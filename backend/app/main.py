import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router
from app.db.mongodb import db_service

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s - [%(levelname)s] - %(name)s - %(message)s"
)
logger = logging.getLogger("field_ai_assistant")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.PROJECT_VERSION} in [{settings.ENVIRONMENT}] mode")
    logger.info(f"CORS origins configured: {settings.CORS_ORIGINS}")
    logger.info(f"NVIDIA Embedding model: {settings.NVIDIA_EMBEDDING_MODEL} ({settings.NVIDIA_CREDENTIAL_IDENTIFIER})")

    # Connect to MongoDB
    await db_service.connect()

    yield

    # Disconnect from MongoDB
    await db_service.disconnect()
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Multimodal AI-Powered Field-Service Maintenance Assistant Backend API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mount Health Endpoint at root level
@app.get("/health", tags=["Health"])
async def root_health():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME
    }

# Mount API V1 Router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
