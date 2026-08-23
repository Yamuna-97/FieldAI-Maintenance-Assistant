"""
Database Package
----------------
Application database layer for FieldAI Assistant.

MongoDB (Motor async driver) is used for all structured application data:
    users
    equipment
    diagnostics
    maintenance_history
    error_logs

ChromaDB (in genai/rag/) is used separately for the RAG vector store.
"""
from app.db.mongodb import db_service, get_db, MongoDBService

__all__ = [
    "db_service",
    "get_db",
    "MongoDBService",
]
