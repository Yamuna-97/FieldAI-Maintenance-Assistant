"""
RAG Embeddings
--------------
Synchronous wrapper around the existing async NvidiaEmbeddingService.

The NvidiaEmbeddingService uses:
    - NVIDIA_EMBEDDING_MODEL from settings (default: nemotron-3-embed-1b)
    - NVIDIA_API_ENDPOINT: https://integrate.api.nvidia.com/v1

This module provides blocking (synchronous) helpers for use in ingestion
and retrieval scripts that run outside an async event loop.

Key functions:
    embed_query(text)       — embed a user query (input_type="query")
    embed_passage(text)     — embed a document chunk (input_type="passage")
    embed_passages(texts)   — batch embed document chunks

Both query and passage embeddings use the SAME model, ensuring vector
space compatibility for similarity search.
"""
import asyncio
import logging
from typing import List

from app.core.config import settings
from app.services.nvidia_embedding_service import nvidia_embedding_service

logger = logging.getLogger(__name__)

# ── Dimension cache ─────────────────────────────────────────────────────────
_cached_dimension: int | None = None


def _run_async(coro):
    """Run an async coroutine synchronously, handling both nested and top-level calls."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Inside an existing event loop (e.g. FastAPI) — use a new thread
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(asyncio.run, coro)
                return future.result()
        else:
            return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


def embed_query(text: str) -> List[float]:
    """
    Generate a query embedding using NVIDIA's API.

    Uses input_type="query" — required for asymmetric retrieval models
    (the embedding space for queries differs from passages).
    """
    return _run_async(nvidia_embedding_service.embed_text(text, input_type="query"))


def embed_passage(text: str) -> List[float]:
    """
    Generate a passage/document-chunk embedding using NVIDIA's API.

    Uses input_type="passage" — optimised for document retrieval.
    """
    return _run_async(nvidia_embedding_service.embed_text(text, input_type="passage"))


def embed_passages(texts: List[str]) -> List[List[float]]:
    """
    Batch embed multiple document chunks using NVIDIA's API.

    Preferred over calling embed_passage() in a loop — fewer HTTP round trips.
    """
    return _run_async(nvidia_embedding_service.embed_documents(texts, input_type="passage"))


def get_embedding_info() -> dict:
    """
    Return metadata about the active embedding model and dimension.

    The dimension is inferred from the actual API response on the first call
    (or the service's configured default if the API is not reachable).
    """
    global _cached_dimension
    if _cached_dimension is None:
        try:
            test_vec = embed_query("dimension probe")
            _cached_dimension = len(test_vec)
        except Exception as e:
            logger.warning(f"Could not determine embedding dimension from API: {e}")
            _cached_dimension = nvidia_embedding_service.embedding_dimension

    return {
        "model": settings.NVIDIA_EMBEDDING_MODEL,
        "dimension": _cached_dimension,
        "endpoint": settings.NVIDIA_API_ENDPOINT,
        "provider": "NVIDIA API",
    }
