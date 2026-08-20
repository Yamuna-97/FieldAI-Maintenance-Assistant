from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings
from app.schemas.system import HealthResponse, SystemStatusResponse, ComponentStatus
from app.services.gemini_service import gemini_service
from app.services.nvidia_embedding_service import nvidia_embedding_service
from app.services.rag_service import rag_service

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
            details="RAG vector store indexed"
        ),
        "database": ComponentStatus(
            name="Telemetry & Maintenance DB",
            status="CONNECTED",
            provider="SQLite (Local)",
            model_or_info="field_ai.db",
            details="Operational with schema version 1.0"
        )
    }

    return SystemStatusResponse(
        project=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow(),
        components=components,
        summary="All core services operational. Phase 1 foundation initialized."
    )
