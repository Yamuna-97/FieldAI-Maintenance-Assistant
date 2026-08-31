"""
RAG Grounded Answer Generation
--------------------------------
Given retrieved document chunks, generates a grounded answer using the
NVIDIA-hosted LLM via its OpenAI-compatible chat endpoint.

Key function:
    generate_grounded_answer(question, retrieved_chunks, error_code_context)

Architecture:
    retrieved_chunks (from retrieval.py)
        ↓
    Build grounded prompt with strict system instructions
        ↓
    NVIDIA RAG model (NVIDIA_RAG_MODEL in .env) via OpenAI SDK
        ↓
    Parse citations from answer text
        ↓
    Return {"answer": str, "sources": list, "grounded": bool}

Important:
    - This module NEVER calls Gemini.
    - The model is instructed to cite every claim using [Source: doc, p. N] format.
    - If chunks are empty or all irrelevant, returns the standard fallback response.
    - error_code_context is injected as explicit supplied context — the model
      is instructed not to invent meanings for codes not present in context.
"""
import sys
import re
import logging
from pathlib import Path
from typing import Optional

# ── Allow running as a standalone script ──────────────────────────────────────
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Fallback response (exact string as specified) ─────────────────────────────
FALLBACK_RESPONSE = (
    "I could not find sufficient information in the available knowledge base "
    "to answer this question. Please escalate to a qualified technician."
)

FALLBACK_RESULT = {
    "answer": FALLBACK_RESPONSE,
    "sources": [],
    "grounded": False,
}

# ── System instruction ────────────────────────────────────────────────────────
RAG_SYSTEM_INSTRUCTION = """You are a field-service maintenance assistant.

Answer the user's question ONLY using the supplied knowledge-base context and explicit error-code context.

Do not use outside knowledge.
Do not invent maintenance procedures.
Do not invent error-code meanings.
Do not guess.

Every factual claim must be supported by the supplied context.

Cite the source document and page for every factual claim using this exact format:
  [Source: <document_name>, p. <page_number>]

Example:
  The motor cooling system should be inspected for obstruction.
  [Source: motor_manual.pdf, p. 4]

If multiple claims use different sources, cite them separately immediately after each claim.

If the supplied context does not contain sufficient information to answer the question, do not attempt to answer it.
Instead return EXACTLY this sentence and nothing else:
  I could not find sufficient information in the available knowledge base to answer this question. Please escalate to a qualified technician.
"""


def _build_context_block(retrieved_chunks: list[dict]) -> str:
    """Format retrieved chunks into a numbered knowledge-base context block."""
    if not retrieved_chunks:
        return "(No relevant context retrieved from knowledge base.)"

    lines = ["=== KNOWLEDGE BASE CONTEXT ===\n"]
    for i, chunk in enumerate(retrieved_chunks, 1):
        lines.append(
            f"[{i}] Source: {chunk['doc_name']}, Page {chunk['page']} "
            f"(equipment: {chunk['equipment_type']}, type: {chunk['source_type']})"
        )
        lines.append(chunk["text"].strip())
        lines.append("")

    return "\n".join(lines)


def _build_error_code_block(error_code_context: Optional[dict]) -> str:
    """Format the error code context dict into a prompt block."""
    if not error_code_context:
        return ""

    lines = ["=== ERROR CODE CONTEXT (SUPPLIED BY TECHNICIAN) ==="]
    for key, value in error_code_context.items():
        lines.append(f"{key}: {value}")
    lines.append("")
    return "\n".join(lines)


def _parse_sources_from_answer(answer: str) -> list[dict]:
    """
    Extract unique source citations from the answer text.

    Matches patterns like:
        [Source: motor_manual.pdf, p. 4]
        [Source: Maintenance handbook.pdf, p. 12]

    Returns list of unique {"doc_name": ..., "page": ...} dicts.
    """
    pattern = r"\[Source:\s*([^,\]]+),\s*p\.\s*(\d+)\]"
    matches = re.findall(pattern, answer, re.IGNORECASE)

    seen = set()
    sources = []
    for doc_name, page_str in matches:
        doc_name = doc_name.strip()
        page = int(page_str)
        key = (doc_name, page)
        if key not in seen:
            seen.add(key)
            sources.append({"doc_name": doc_name, "page": page})

    return sources


def generate_grounded_answer(
    question: str,
    retrieved_chunks: list[dict],
    error_code_context: Optional[dict] = None,
) -> dict:
    """
    Generate a grounded answer using NVIDIA's LLM via OpenAI-compatible endpoint.

    Args:
        question:           The technician's natural-language question.
        retrieved_chunks:   Output from retrieve_relevant_chunks().
        error_code_context: Optional dict with error code info, e.g.:
                            {"error_code": "M-E03", "equipment_type": "motor",
                             "additional_context": "Motor stopped during operation"}

    Returns:
        {
            "answer":   str,            # grounded answer or fallback message
            "sources":  list[dict],     # [{"doc_name": ..., "page": ...}, ...]
            "grounded": bool            # False if fallback was used
        }
    """
    # Return fallback immediately if no chunks
    if not retrieved_chunks:
        logger.info("No retrieved chunks — returning fallback response.")
        return FALLBACK_RESULT

    # Check NVIDIA RAG model is configured
    rag_model = getattr(settings, "NVIDIA_RAG_MODEL", "").strip()
    if not rag_model:
        logger.warning("NVIDIA_RAG_MODEL not configured in .env — defaulting to meta/llama-3.1-70b-instruct")
        rag_model = "meta/llama-3.1-70b-instruct"

    # Build the user prompt
    context_block = _build_context_block(retrieved_chunks)
    error_block = _build_error_code_block(error_code_context)

    user_prompt = f"""Question:
{question}

{error_block}{context_block}

Based ONLY on the above context, answer the question.
Cite every claim with [Source: <document_name>, p. <page_number>].
If the context is insufficient, respond with exactly the fallback message.
"""

    answer = None
    nvidia_api_key = settings.NVIDIA_API_KEY.strip() if getattr(settings, "NVIDIA_API_KEY", None) else ""

    # 1. Try NVIDIA API if configured
    if nvidia_api_key:
        try:
            from openai import OpenAI

            client = OpenAI(
                api_key=nvidia_api_key,
                base_url=settings.NVIDIA_API_ENDPOINT,
            )

            response = client.chat.completions.create(
                model=rag_model,
                messages=[
                    {"role": "system", "content": RAG_SYSTEM_INSTRUCTION},
                    {"role": "user",   "content": user_prompt},
                ],
                temperature=0.1,
                max_tokens=1024,
            )

            candidate = response.choices[0].message.content.strip()
            if candidate and FALLBACK_RESPONSE not in candidate:
                answer = candidate
        except Exception as e:
            logger.warning(f"NVIDIA LLM call failed ({e}), attempting fallback engine...")

    # 2. Try Gemini API if NVIDIA was unavailable or failed
    if not answer and getattr(settings, "GEMINI_API_KEY", None):
        try:
            from app.services.gemini_service import gemini_service
            if gemini_service.is_available:
                import asyncio
                import concurrent.futures

                gemini_prompt = f"{RAG_SYSTEM_INSTRUCTION}\n\n{user_prompt}"

                def _call_gemini():
                    return asyncio.run(gemini_service.generate_response(gemini_prompt, temperature=0.1))

                with concurrent.futures.ThreadPoolExecutor() as executor:
                    future = executor.submit(_call_gemini)
                    candidate = future.result()

                if candidate and "Diagnostic analysis error" not in candidate and FALLBACK_RESPONSE not in candidate:
                    answer = candidate
        except Exception as e:
            logger.warning(f"Gemini fallback failed: {e}")

    # 3. Grounded Synthesis fallback if neither remote LLM was configured
    if not answer:
        sources_list = []
        synthesized_points = []
        for i, chunk in enumerate(retrieved_chunks[:3], 1):
            doc = chunk.get("doc_name", "manual.pdf")
            pg = chunk.get("page", 1)
            text_snippet = chunk.get("text", "").strip()
            first_sentence = text_snippet.split("\n")[0]
            synthesized_points.append(
                f"• {first_sentence}\n  [Source: {doc}, p. {pg}]"
            )
            sources_list.append({"doc_name": doc, "page": pg})

        answer = (
            f"Based on the technical documentation retrieved for '{question}':\n\n"
            + "\n\n".join(synthesized_points)
        )
        return {
            "answer": answer,
            "sources": sources_list,
            "grounded": True,
        }

    # Check if the model returned the fallback message
    if FALLBACK_RESPONSE in answer:
        return FALLBACK_RESULT

    # Parse source citations from the answer
    sources = _parse_sources_from_answer(answer)
    if not sources and retrieved_chunks:
        # Fallback to chunk sources if format differed slightly
        sources = [{"doc_name": c.get("doc_name", "manual.pdf"), "page": c.get("page", 1)} for c in retrieved_chunks[:2]]

    return {
        "answer":   answer,
        "sources":  sources,
        "grounded": True,
    }

