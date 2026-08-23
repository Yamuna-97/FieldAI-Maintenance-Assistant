from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.diagnostics import router as diagnostics_router
from app.api.routes.equipment import router as equipment_router
from app.api.routes.manuals import router as manuals_router
from app.api.routes.maintenance import router as maintenance_router
from app.api.routes.rag import router as rag_router
from app.api.routes.auth import router as auth_router

api_router = APIRouter()

api_router.include_router(health_router, tags=["System & Health"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication & User Management"])
api_router.include_router(diagnostics_router, prefix="/diagnostics", tags=["Multimodal Diagnostics"])
api_router.include_router(equipment_router, prefix="/equipment", tags=["Equipment Catalog"])
api_router.include_router(manuals_router, prefix="/manuals", tags=["Knowledge Base & Manuals"])
api_router.include_router(maintenance_router, prefix="/maintenance", tags=["Maintenance History"])
api_router.include_router(rag_router, prefix="/rag", tags=["RAG Pipeline"])

__all__ = ["api_router"]
