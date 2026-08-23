"""
RAG Retrieval
-------------
Given a natural-language query, generates a NVIDIA embedding and queries
the ChromaDB manual_chunks collection to find the most relevant document
chunks.

Key function:
    retrieve_relevant_chunks(query, top_k, equipment_type_filter)

Distance vs. Similarity:
    ChromaDB uses L2 (Euclidean) distance by default.
    Lower distance = more similar.  This module returns raw L2 distance
    labeled clearly as 'distance' — it is NOT a similarity score.

    If you need a similarity approximation:
        similarity ≈ 1 / (1 + distance)   [informal, not a standard formula]

Relevance Threshold:
    Chunks with distance > RELEVANCE_THRESHOLD are excluded.
    This prevents the system from returning completely unrelated passages
    just because ChromaDB always returns the k nearest neighbours.
"""
import sys
import logging
from pathlib import Path
from typing import Optional

# ── Allow running as a standalone script ──────────────────────────────────────
_BACKEND_DIR = Path(__file__).resolve().parent.parent.parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

import chromadb

from app.genai.rag.config import (
    CHROMA_PERSIST_DIR,
    CHROMA_COLLECTION_NAME,
    TOP_K_DEFAULT,
    RELEVANCE_THRESHOLD,
)
from app.genai.rag.embeddings import embed_query

logger = logging.getLogger(__name__)


def _get_collection():
    """Return the ChromaDB manual_chunks collection (read-only access)."""
    client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
    return client.get_or_create_collection(
        name=CHROMA_COLLECTION_NAME,
        metadata={"hnsw:space": "l2"},
    )


def retrieve_relevant_chunks(
    query: str,
    top_k: int = TOP_K_DEFAULT,
    equipment_type_filter: Optional[str] = None,
) -> list[dict]:
    """
    Retrieve the most relevant document chunks for a given query.

    Steps:
        1. Embed the query using NVIDIA (input_type="query")
        2. Query ChromaDB with optional equipment_type filter
        3. Filter out chunks beyond RELEVANCE_THRESHOLD distance
        4. Return structured results with metadata

    Args:
        query:                  Natural-language question or symptom description.
        top_k:                  Maximum number of chunks to return (default 4).
        equipment_type_filter:  If set, limit search to this equipment type
                                (e.g. "motor", "compressor", "hvac").

    Returns:
        List of dicts, each containing:
            text           — chunk text
            doc_name       — PDF filename
            page           — 1-indexed page number
            equipment_type — inferred from filename
            source_type    — "own" or "real"
            distance       — L2 distance (lower = more relevant, NOT a similarity score)
            chunk_id       — deterministic ID used in ChromaDB

    Returns [] if:
        - The collection is empty (run ingest.py first)
        - No chunks pass the relevance threshold
        - The query embedding fails
    """
    if not query or not query.strip():
        logger.warning("Empty query passed to retrieve_relevant_chunks — returning []")
        return []

    # Check collection is populated
    try:
        collection = _get_collection()
        count = collection.count()
    except Exception as e:
        logger.error(f"Failed to connect to ChromaDB: {e}")
        return []

    if count == 0:
        logger.warning(
            "ChromaDB collection 'manual_chunks' is empty. "
            "Run ingest.py first to populate the knowledge base."
        )
        return []

    # Generate query embedding
    try:
        query_embedding = embed_query(query)
    except Exception as e:
        logger.error(f"Failed to generate query embedding: {e}")
        return []

    # Build optional where clause for equipment filtering
    where_clause = None
    if equipment_type_filter and equipment_type_filter.strip():
        where_clause = {"equipment_type": {"$eq": equipment_type_filter.strip().lower()}}
        logger.info(f"Equipment filter applied: equipment_type = '{equipment_type_filter}'")

    # Query ChromaDB
    try:
        query_kwargs: dict = {
            "query_embeddings": [query_embedding],
            "n_results": min(top_k, count),
            "include": ["documents", "metadatas", "distances"],
        }
        if where_clause:
            query_kwargs["where"] = where_clause

        results = collection.query(**query_kwargs)
    except Exception as e:
        logger.error(f"ChromaDB query failed: {e}")
        return []

    # Unpack results
    raw_docs = results.get("documents", [[]])[0]
    raw_meta = results.get("metadatas", [[]])[0]
    raw_dist = results.get("distances", [[]])[0]
    raw_ids  = results.get("ids", [[]])[0]

    # Build response, applying relevance threshold
    chunks = []
    for text, meta, distance, chunk_id in zip(raw_docs, raw_meta, raw_dist, raw_ids):
        if distance > RELEVANCE_THRESHOLD:
            logger.debug(
                f"Chunk '{chunk_id}' excluded — distance {distance:.4f} > threshold {RELEVANCE_THRESHOLD}"
            )
            continue
        chunks.append({
            "text":           text,
            "doc_name":       meta.get("doc_name", "unknown"),
            "page":           meta.get("page", 0),
            "equipment_type": meta.get("equipment_type", "unknown"),
            "source_type":    meta.get("source_type", "unknown"),
            "distance":       round(distance, 6),  # L2 distance — lower is more relevant
            "chunk_id":       chunk_id,
        })

    if not chunks:
        logger.info(
            f"No chunks passed relevance threshold ({RELEVANCE_THRESHOLD}) for query: '{query[:80]}...'"
        )

    return chunks
