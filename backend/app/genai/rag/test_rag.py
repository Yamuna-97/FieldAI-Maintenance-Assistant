"""
RAG Pipeline End-to-End Test Script
-------------------------------------
Verifies the complete RAG pipeline from PDF discovery through to
NVIDIA-grounded answer generation and fallback handling.

Run from the backend/ directory:
    cd D:\\FieldAI_Assistant\\backend
    python -m app.genai.rag.test_rag

Or directly:
    python app/genai/rag/test_rag.py

Tests:
    1. PDF discovery
    2. PDF text extraction
    3. NVIDIA embeddings
    4. ChromaDB collection status
    5. Retrieval
    6. Answer generation (grounded)
    7. Fallback test (out-of-domain question)
"""
import sys
import logging
from pathlib import Path

# ── Allow running as a standalone script ──────────────────────────────────────
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

logging.basicConfig(level=logging.WARNING, format="%(asctime)s [%(levelname)s] %(message)s")

from app.genai.rag.config import (
    OWN_MANUALS_DIR,
    SOURCE_MANUALS_DIR,
    CHROMA_PERSIST_DIR,
    CHROMA_COLLECTION_NAME,
    infer_equipment_type,
)
from app.genai.rag.embeddings import get_embedding_info, embed_query
from app.genai.rag.retrieval import retrieve_relevant_chunks
from app.genai.rag.generate_answer import generate_grounded_answer, FALLBACK_RESPONSE

PASS = "✓ PASS"
FAIL = "✗ FAIL"
results: dict[str, str] = {}


def separator(title: str = ""):
    print("\n" + "=" * 40)
    if title:
        print(title)
        print("=" * 40)


# ── TEST 1: PDF Discovery ──────────────────────────────────────────────────────
separator("TEST 1 — PDF DISCOVERY")
try:
    own_pdfs   = sorted(OWN_MANUALS_DIR.glob("*.pdf")) if OWN_MANUALS_DIR.exists() else []
    src_pdfs   = sorted(SOURCE_MANUALS_DIR.glob("*.pdf")) if SOURCE_MANUALS_DIR.exists() else []
    total_pdfs = len(own_pdfs) + len(src_pdfs)

    print(f"\nManual directory:\n  {OWN_MANUALS_DIR.parent}")
    print(f"\nOwn manuals ({len(own_pdfs)}):")
    for p in own_pdfs:
        print(f"  {p.name}  [equipment: {infer_equipment_type(p.name)}]")

    print(f"\nSource manuals ({len(src_pdfs)}):")
    for p in src_pdfs:
        print(f"  {p.name}  [equipment: {infer_equipment_type(p.name)}]")

    print(f"\nTotal PDFs found: {total_pdfs}")
    assert total_pdfs > 0, "No PDFs found!"
    results["PDF Discovery"] = PASS
except Exception as e:
    print(f"ERROR: {e}")
    results["PDF Discovery"] = FAIL


# ── TEST 2: PDF Text Extraction ────────────────────────────────────────────────
separator("TEST 2 — PDF TEXT EXTRACTION")
try:
    import pymupdf as fitz  # PyMuPDF

    # Pick any existing PDF to test
    test_pdf = (own_pdfs + src_pdfs)[0] if (own_pdfs or src_pdfs) else None
    assert test_pdf, "No PDF available to test extraction"

    doc = fitz.open(str(test_pdf))
    total_pages = len(doc)
    total_chars = sum(len(doc.load_page(i).get_text("text")) for i in range(total_pages))
    doc.close()

    print(f"\nDocument:\n  {test_pdf.name}")
    print(f"\nPages:\n  {total_pages}")
    print(f"\nCharacters extracted:\n  {total_chars}")
    assert total_chars > 0, "No text extracted from PDF"
    results["PDF Extraction"] = PASS
except Exception as e:
    print(f"ERROR: {e}")
    results["PDF Extraction"] = FAIL


# ── TEST 3: NVIDIA Embeddings ──────────────────────────────────────────────────
separator("TEST 3 — NVIDIA EMBEDDINGS")
try:
    info = get_embedding_info()
    test_vec = embed_query("motor bearing vibration inspection")

    print(f"\nEmbedding model:\n  {info['model']}")
    print(f"\nEmbedding dimension:\n  {info['dimension']}")
    print(f"\nActual vector dimension from API:\n  {len(test_vec)}")
    print(f"\nFirst 5 values:\n  {test_vec[:5]}")
    assert len(test_vec) > 0, "Empty embedding returned"
    results["NVIDIA Embeddings"] = PASS
except Exception as e:
    print(f"ERROR: {e}")
    results["NVIDIA Embeddings"] = FAIL


# ── TEST 4: ChromaDB Status ────────────────────────────────────────────────────
separator("TEST 4 — CHROMADB STATUS")
try:
    import chromadb

    client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
    collection = client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "l2"},
    )
    chunk_count = collection.count()

    print(f"\nChromaDB path:\n  {CHROMA_PERSIST_DIR}")
    print(f"\nCollection:\n  {CHROMA_COLLECTION_NAME}")
    print(f"\nTotal chunks:\n  {chunk_count}")

    if chunk_count == 0:
        print("\n  ⚠  Collection is empty! Run ingest.py first.")
        results["ChromaDB"] = FAIL
    else:
        results["ChromaDB"] = PASS
except Exception as e:
    print(f"ERROR: {e}")
    results["ChromaDB"] = FAIL


# ── TEST 5: Retrieval ──────────────────────────────────────────────────────────
separator("TEST 5 — RETRIEVAL")
RETRIEVAL_QUERY = "What should I inspect if the motor shows error M-E03?"
retrieved = []
try:
    print(f"\nQuery:\n  {RETRIEVAL_QUERY}")
    retrieved = retrieve_relevant_chunks(
        query=RETRIEVAL_QUERY,
        top_k=4,
    )

    if not retrieved:
        print("\n  No chunks returned (collection may be empty or threshold too strict).")
        results["Retrieval"] = FAIL
    else:
        for i, chunk in enumerate(retrieved, 1):
            print(f"\nResult {i}")
            print(f"  Document:     {chunk['doc_name']}")
            print(f"  Page:         {chunk['page']}")
            print(f"  Equipment:    {chunk['equipment_type']}")
            print(f"  Source type:  {chunk['source_type']}")
            print(f"  Distance:     {chunk['distance']}  (L2, lower = more relevant)")
            print(f"  Preview:      {chunk['text'][:120].strip()}...")
        results["Retrieval"] = PASS
except Exception as e:
    print(f"ERROR: {e}")
    results["Retrieval"] = FAIL


# ── TEST 6: Answer Generation ──────────────────────────────────────────────────
separator("TEST 6 — RAG ANSWER GENERATION")
try:
    error_ctx = {
        "error_code": "M-E03",
        "equipment_type": "motor",
        "additional_context": "Motor stopped during operation",
    }
    rag_result = generate_grounded_answer(
        question=RETRIEVAL_QUERY,
        retrieved_chunks=retrieved,
        error_code_context=error_ctx,
    )

    separator("RAG ANSWER")
    print(rag_result["answer"])

    separator("SOURCES")
    if rag_result["sources"]:
        for src in rag_result["sources"]:
            print(f"  - {src['doc_name']}, page {src['page']}")
    else:
        print("  (none)")

    print(f"\nGrounded: {rag_result['grounded']}")
    print("=" * 40)

    results["Answer Generation"] = PASS
except Exception as e:
    print(f"ERROR: {e}")
    results["Answer Generation"] = FAIL


# ── TEST 7: Fallback Test ─────────────────────────────────────────────────────
separator("TEST 7 — FALLBACK TEST (OUT-OF-DOMAIN QUESTION)")
FALLBACK_QUERY = "Who was the first person to walk on the Moon?"
try:
    print(f"\nQuery:\n  {FALLBACK_QUERY}")
    fallback_chunks = retrieve_relevant_chunks(query=FALLBACK_QUERY, top_k=4)
    fallback_result = generate_grounded_answer(
        question=FALLBACK_QUERY,
        retrieved_chunks=fallback_chunks,
    )

    print(f"\nGrounded: {fallback_result['grounded']}")
    print(f"Sources:  {fallback_result['sources']}")
    print(f"\nAnswer:\n  {fallback_result['answer']}")

    assert not fallback_result["grounded"], "Expected grounded=False for out-of-domain question"
    assert fallback_result["sources"] == [], "Expected empty sources for out-of-domain question"
    results["Fallback"] = PASS
except Exception as e:
    print(f"ERROR: {e}")
    results["Fallback"] = FAIL


# ── Summary ────────────────────────────────────────────────────────────────────
separator("TEST SUMMARY")
for test_name, result in results.items():
    print(f"  {result}  {test_name}")

all_passed = all(r == PASS for r in results.values())
print("\n" + ("✓ ALL TESTS PASSED" if all_passed else "⚠  SOME TESTS FAILED"))
print("=" * 40)
