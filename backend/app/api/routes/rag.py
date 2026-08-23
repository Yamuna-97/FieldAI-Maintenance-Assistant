"""
RAG Query API Route
-------------------
Exposes the RAG pipeline (ChromaDB retrieval + NVIDIA generation) as
a REST endpoint that the frontend can call.

Endpoints:
    POST /api/v1/rag/query    — Ask a grounded question
    GET  /api/v1/rag/status   — ChromaDB collection status
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import logging
import chromadb

from app.genai.rag.config import CHROMA_PERSIST_DIR, CHROMA_COLLECTION_NAME
from app.genai.rag.retrieval import retrieve_relevant_chunks
from app.genai.rag.generate_answer import generate_grounded_answer

router = APIRouter()
logger = logging.getLogger(__name__)


class RagQueryRequest(BaseModel):
    question: str = Field(..., description="Natural-language question about equipment maintenance")
    equipment_type: Optional[str] = Field(
        None,
        description="Filter retrieval to a specific equipment type (e.g. 'motor', 'compressor', 'hvac')"
    )
    top_k: int = Field(4, ge=1, le=10, description="Number of chunks to retrieve (1-10)")
    error_code_context: Optional[dict] = Field(
        None,
        description="Optional error code context: {error_code, equipment_type, additional_context}"
    )


class RagSourceItem(BaseModel):
    doc_name: str
    page: int


class RagQueryResponse(BaseModel):
    answer: str
    sources: list[RagSourceItem]
    grounded: bool
    chunks_retrieved: int
    equipment_filter_applied: Optional[str] = None


@router.post("/query", response_model=RagQueryResponse)
async def rag_query(request: RagQueryRequest):
    """
    Execute a RAG query: retrieve relevant manual chunks and generate a
    grounded answer using the NVIDIA LLM.

    The answer will cite source documents and page numbers.
    If the knowledge base does not contain relevant information, the
    standard fallback message is returned with grounded=False.
    """
    try:
        # Retrieval
        chunks = retrieve_relevant_chunks(
            query=request.question,
            top_k=request.top_k,
            equipment_type_filter=request.equipment_type,
        )

        # Grounded generation
        result = generate_grounded_answer(
            question=request.question,
            retrieved_chunks=chunks,
            error_code_context=request.error_code_context,
        )

        return RagQueryResponse(
            answer=result["answer"],
            sources=[RagSourceItem(**s) for s in result["sources"]],
            grounded=result["grounded"],
            chunks_retrieved=len(chunks),
            equipment_filter_applied=request.equipment_type,
        )

    except Exception as e:
        logger.error(f"RAG query failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")


@router.get("/status")
async def rag_status():
    """
    Return the current status of the ChromaDB knowledge base.
    Shows total chunk count and collection metadata.
    """
    try:
        client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
        collection = client.get_or_create_collection(
            name=CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "l2"},
        )
        count = collection.count()
        status = "READY" if count > 0 else "EMPTY — run ingest.py to populate"

        return {
            "collection": CHROMA_COLLECTION_NAME,
            "chroma_path": str(CHROMA_PERSIST_DIR),
            "total_chunks": count,
            "status": status,
            "embedding_provider": "NVIDIA API",
            "retrieval_provider": "ChromaDB (L2 distance)",
            "generation_provider": "NVIDIA LLM (OpenAI-compatible endpoint)",
        }
    except Exception as e:
        logger.error(f"RAG status check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Could not connect to ChromaDB: {str(e)}")
