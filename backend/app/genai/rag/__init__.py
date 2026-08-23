"""
RAG Sub-package
---------------
Retrieval-Augmented Generation pipeline for FieldAI Assistant.

Architecture:
    PDF manuals (backend/app/data/manuals/)
        ↓  PyMuPDF extraction
        ↓  LangChain chunking
        ↓  NVIDIA embeddings (nvidia_embedding_service)
        ↓  ChromaDB (backend/app/data/chroma_db/)
        ↓  Similarity retrieval
        ↓  NVIDIA LLM grounded generation
        ↓  Structured answer with source citations

Modules:
    config.py          — paths, constants, equipment keyword map
    embeddings.py      — sync wrapper around NvidiaEmbeddingService
    ingest.py          — PDF → chunks → ChromaDB upsert
    retrieval.py       — query → NVIDIA embed → ChromaDB search
    generate_answer.py — retrieved chunks → NVIDIA LLM → grounded answer
    test_rag.py        — end-to-end pipeline test script
"""

from app.genai.rag.retrieval import retrieve_relevant_chunks
from app.genai.rag.generate_answer import generate_grounded_answer

__all__ = [
    "retrieve_relevant_chunks",
    "generate_grounded_answer",
]
