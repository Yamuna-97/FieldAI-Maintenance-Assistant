"""
RAG Ingestion Pipeline
----------------------
Scans backend/app/data/manuals/ (own/ + sources/) for PDF files,
extracts text page-by-page using PyMuPDF, splits into chunks with
LangChain RecursiveCharacterTextSplitter, generates NVIDIA embeddings,
and upserts into ChromaDB (collection: manual_chunks).

Running this script multiple times is safe (upsert strategy):
  - Chunk IDs are deterministic: "{doc_name}:{page}:{chunk_index}"
  - ChromaDB upsert replaces existing chunks with the same ID
  - A SHA-256 hash of each PDF is stored in metadata; if the hash hasn't
    changed, the file's existing chunks are still valid and will be
    silently overwritten with identical data (idempotent).

Usage:
    # From the backend/ directory with conda env active:
    cd D:\\FieldAI_Assistant\\backend
    python -m app.genai.rag.ingest

    # Or directly:
    python app/genai/rag/ingest.py
"""
import sys
import hashlib
import logging
from collections import defaultdict
from pathlib import Path
from typing import Any

# ── Allow running as a standalone script ──────────────────────────────────────
# Adds backend/ to sys.path so 'app.*' imports resolve correctly.
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

import pymupdf as fitz  # PyMuPDF (replaces deprecated 'import fitz')
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.genai.rag.config import (
    OWN_MANUALS_DIR,
    SOURCE_MANUALS_DIR,
    CHROMA_PERSIST_DIR,
    CHROMA_COLLECTION_NAME,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
    infer_equipment_type,
)
from app.genai.rag.embeddings import embed_passages, get_embedding_info

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _sha256(path: Path) -> str:
    """Compute SHA-256 hash of a file for change detection."""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def _discover_pdfs() -> list[tuple[Path, str]]:
    """
    Discover all PDFs under own/ and sources/ directories.

    Returns:
        List of (pdf_path, source_type) tuples.
        source_type is "own" for own/ and "real" for sources/.
    """
    pdfs: list[tuple[Path, str]] = []

    for folder, source_type in [(OWN_MANUALS_DIR, "own"), (SOURCE_MANUALS_DIR, "real")]:
        if not folder.exists():
            logger.warning(f"Manual directory not found: {folder}")
            continue
        found = sorted(folder.glob("*.pdf"))
        logger.info(f"  [{source_type}] Found {len(found)} PDFs in {folder}")
        for p in found:
            pdfs.append((p, source_type))

    return pdfs


def _extract_pages(pdf_path: Path) -> list[dict[str, Any]]:
    """
    Extract text from every page of a PDF using PyMuPDF.

    Returns:
        List of dicts: {"page": int (1-indexed), "text": str}
        Pages with no extractable text are skipped.
    """
    pages = []
    doc = fitz.open(str(pdf_path))
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text("text").strip()
        if text:
            pages.append({
                "page": page_num + 1,  # Human-readable 1-indexed
                "text": text,
            })
    doc.close()
    return pages


def _chunk_pages(
    pages: list[dict],
    doc_name: str,
    source_type: str,
    equipment_type: str,
    pdf_hash: str,
) -> tuple[list[str], list[list[float]], list[dict], list[str]]:
    """
    Split page texts into overlapping chunks and prepare ChromaDB inputs.

    Returns:
        (documents, embeddings_placeholder, metadatas, ids)
        Note: embeddings are generated in batches after this function.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    documents: list[str] = []
    metadatas: list[dict] = []
    ids: list[str] = []

    for page_info in pages:
        page_num = page_info["page"]
        page_text = page_info["text"]

        chunks = splitter.split_text(page_text)

        for chunk_idx, chunk_text in enumerate(chunks):
            chunk_text = chunk_text.strip()
            if not chunk_text:
                continue

            chunk_id = f"{doc_name}:{page_num}:{chunk_idx}"
            documents.append(chunk_text)
            metadatas.append({
                "doc_name": doc_name,
                "page": page_num,
                "source_type": source_type,
                "equipment_type": equipment_type,
                "pdf_hash": pdf_hash,
                "chunk_index": chunk_idx,
            })
            ids.append(chunk_id)

    return documents, metadatas, ids


def _get_chroma_collection():
    """Initialize persistent ChromaDB client and return the manual_chunks collection."""
    CHROMA_PERSIST_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
    collection = client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "l2"},  # L2 distance (default)
    )
    return collection


def _upsert_batch(
    collection,
    documents: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict],
    ids: list[str],
    batch_size: int = 50,
):
    """Upsert chunks into ChromaDB in batches to avoid memory issues with large PDFs."""
    total = len(ids)
    for start in range(0, total, batch_size):
        end = min(start + batch_size, total)
        collection.upsert(
            documents=documents[start:end],
            embeddings=embeddings[start:end],
            metadatas=metadatas[start:end],
            ids=ids[start:end],
        )


# ── Main ingestion ─────────────────────────────────────────────────────────────

def run_ingestion() -> dict:
    """
    Execute the full ingestion pipeline.

    Returns a summary dict with counts and model info.
    """
    logger.info("=" * 50)
    logger.info("RAG INGESTION STARTING")
    logger.info("=" * 50)

    # 1. Print embedding model info
    embed_info = get_embedding_info()
    logger.info(f"NVIDIA embedding model: {embed_info['model']}")
    logger.info(f"Embedding dimension:    {embed_info['dimension']}")

    # 2. Discover PDFs
    pdfs = _discover_pdfs()
    if not pdfs:
        logger.error("No PDFs found! Check MANUALS_DIR paths.")
        return {}

    # 3. Connect to ChromaDB
    collection = _get_chroma_collection()
    logger.info(f"ChromaDB collection '{CHROMA_COLLECTION_NAME}' ready at: {CHROMA_PERSIST_DIR}")

    # 4. Process each PDF
    total_pdfs = 0
    total_chunks = 0
    chunks_by_equipment: defaultdict[str, int] = defaultdict(int)

    for pdf_path, source_type in pdfs:
        doc_name = pdf_path.name
        equipment_type = infer_equipment_type(doc_name)
        pdf_hash = _sha256(pdf_path)

        logger.info(f"\nProcessing: {doc_name}")
        logger.info(f"  source_type:    {source_type}")
        logger.info(f"  equipment_type: {equipment_type}")
        logger.info(f"  sha256:         {pdf_hash[:16]}...")

        # Extract pages
        pages = _extract_pages(pdf_path)
        if not pages:
            logger.warning(f"  ⚠  No extractable text in {doc_name} — skipping.")
            continue

        logger.info(f"  pages with text: {len(pages)}")

        # Chunk pages
        documents, metadatas, ids = _chunk_pages(
            pages, doc_name, source_type, equipment_type, pdf_hash
        )
        logger.info(f"  chunks created:  {len(ids)}")

        if not ids:
            logger.warning(f"  ⚠  No chunks generated for {doc_name} — skipping.")
            continue

        # Generate embeddings in batch
        logger.info(f"  Generating {len(documents)} embeddings via NVIDIA API...")
        embeddings = embed_passages(documents)
        logger.info(f"  Embeddings generated: {len(embeddings)}")

        # Upsert into ChromaDB
        _upsert_batch(collection, documents, embeddings, metadatas, ids)
        logger.info(f"  ✓ Upserted {len(ids)} chunks into ChromaDB")

        total_pdfs += 1
        total_chunks += len(ids)
        chunks_by_equipment[equipment_type] += len(ids)

    # 5. Print summary
    print("\n" + "=" * 40)
    print("RAG INGESTION COMPLETE")
    print("=" * 40)
    print(f"\nManual directory:\n  {OWN_MANUALS_DIR.parent}")
    print(f"\nPDFs processed:\n  {total_pdfs}")
    print(f"\nChunks created/updated:\n  {total_chunks}")
    print("\nChunks by equipment type:")
    for eq_type, count in sorted(chunks_by_equipment.items()):
        print(f"  {eq_type}: {count}")
    print(f"\nNVIDIA embedding model:\n  {embed_info['model']}")
    print(f"\nEmbedding dimension:\n  {embed_info['dimension']}")
    print(f"\nChromaDB:\n  {CHROMA_PERSIST_DIR}")
    print(f"\nCollection:\n  {CHROMA_COLLECTION_NAME}")
    print(f"\nTotal chunks in collection:\n  {collection.count()}")
    print("=" * 40)

    return {
        "total_pdfs": total_pdfs,
        "total_chunks": total_chunks,
        "chunks_by_equipment": dict(chunks_by_equipment),
        "embedding_model": embed_info["model"],
        "embedding_dimension": embed_info["dimension"],
        "collection_total": collection.count(),
    }


def ingest_pdf_file(
    pdf_path: Path,
    source_type: str = "own",
    equipment_type: str | None = None
) -> dict:
    """
    Ingest a single PDF file into ChromaDB.
    Extracts text, splits into chunks, computes embeddings, and upserts into ChromaDB.
    """
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    doc_name = pdf_path.name
    if not equipment_type or equipment_type.lower() == "all" or equipment_type == "unknown":
        equipment_type = infer_equipment_type(doc_name)

    pdf_hash = _sha256(pdf_path)
    pages = _extract_pages(pdf_path)
    if not pages:
        logger.warning(f"No extractable text in {doc_name}")
        return {
            "doc_name": doc_name,
            "pages": 0,
            "chunks": 0,
            "equipment_type": equipment_type,
            "status": "NO_TEXT"
        }

    documents, metadatas, ids = _chunk_pages(
        pages, doc_name, source_type, equipment_type, pdf_hash
    )

    if not ids:
        return {
            "doc_name": doc_name,
            "pages": len(pages),
            "chunks": 0,
            "equipment_type": equipment_type,
            "status": "NO_CHUNKS"
        }

    collection = _get_chroma_collection()
    embeddings = embed_passages(documents)
    _upsert_batch(collection, documents, embeddings, metadatas, ids)

    logger.info(f"Successfully ingested {doc_name}: {len(pages)} pages, {len(ids)} chunks")
    return {
        "doc_name": doc_name,
        "pages": len(pages),
        "chunks": len(ids),
        "equipment_type": equipment_type,
        "status": "INDEXED"
    }


def delete_pdf_from_chroma(doc_name: str) -> int:
    """
    Delete all chunks belonging to doc_name from ChromaDB collection.
    """
    try:
        collection = _get_chroma_collection()
        res = collection.get(where={"doc_name": doc_name})
        chunk_ids = res.get("ids", [])
        if chunk_ids:
            collection.delete(ids=chunk_ids)
            logger.info(f"Deleted {len(chunk_ids)} chunks for {doc_name} from ChromaDB")
            return len(chunk_ids)
    except Exception as e:
        logger.error(f"Error deleting chunks for {doc_name}: {e}")
    return 0


if __name__ == "__main__":
    run_ingestion()

