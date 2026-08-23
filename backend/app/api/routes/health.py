from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings
from app.schemas.system import HealthResponse, SystemStatusResponse, ComponentStatus
from app.services.gemini_service import gemini_service
from app.services.nvidia_embedding_service import nvidia_embedding_service
from app.services.rag_service import rag_service
from app.db.mongodb import db_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def get_health():
    """
    Standard application health probe endpoint.
    """
    return HealthResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        timestamp=datetime.utcnow()
    )


@router.get("/system/status", response_model=SystemStatusResponse)
async def get_system_status():
    """
    Detailed system and AI services operational status.
    """
    gemini_info = gemini_service.get_status_info()
    nvidia_info = nvidia_embedding_service.get_status_info()
    rag_info = rag_service.get_status_info()

    # MongoDB status (real, async ping)
    mongo_status = await db_service.get_status()

    components = {
        "gemini": ComponentStatus(
            name=gemini_info["name"],
            status=gemini_info["status"],
            provider=gemini_info["provider"],
            model_or_info=gemini_info["model"],
            details=gemini_info["role"]
        ),
        "nvidia_embeddings": ComponentStatus(
            name=nvidia_info["name"],
            status=nvidia_info["status"],
            provider=nvidia_info["provider"],
            model_or_info=nvidia_info["model"],
            details=nvidia_info["role"]
        ),
        "knowledge_base": ComponentStatus(
            name="Manuals Vector Index",
            status=rag_info["status"],
            provider="ChromaDB + NVIDIA Embeddings",
            model_or_info=f"{rag_info['documents_indexed']} documents / {rag_info['total_chunks']} chunks",
            details="RAG vector store — manual_chunks collection"
        ),
        "database": ComponentStatus(
            name="Application Database",
            status=mongo_status["status"],
            provider="MongoDB (Motor async)",
            model_or_info=mongo_status.get("database") or "not configured",
            details=mongo_status["details"]
        ),
    }

    return SystemStatusResponse(
        project=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow(),
        components=components,
        summary="All core services operational."
    )
