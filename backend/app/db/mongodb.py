"""
MongoDB Database Service
------------------------
Async MongoDB client using Motor (the official async MongoDB driver for Python).

Architecture:
    MongoDB URI (MONGODB_URI in .env)
        ↓
    Motor AsyncIOMotorClient
        ↓
    database: fieldai (MONGODB_DB_NAME in .env)
        ↓
    collections:
        users
        equipment
        diagnostics
        maintenance_history
        error_logs

Usage:
    from app.db.mongodb import get_db, db_service

    # In a FastAPI route or service:
    db = await get_db()
    await db["diagnostics"].insert_one({...})

    # Or use the service directly:
    from app.db.mongodb import db_service
    collection = db_service.get_collection("equipment")
"""
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)


class MongoDBService:
    """
    Singleton-style async MongoDB connection manager.

    The client is created lazily on first use and reused for the
    lifetime of the application.  Call connect() during FastAPI lifespan
    startup and disconnect() during shutdown.
    """

    def __init__(self):
        self._client: Optional[AsyncIOMotorClient] = None
        self._db: Optional[AsyncIOMotorDatabase] = None

    @property
    def is_configured(self) -> bool:
        """True if MONGODB_URI is set in the environment."""
        return bool(settings.MONGODB_URI and settings.MONGODB_URI.strip())

    async def connect(self):
        """
        Establish the MongoDB connection.
        Called during FastAPI lifespan startup.
        """
        if not self.is_configured:
            logger.warning(
                "MONGODB_URI is not configured in .env — MongoDB features are disabled. "
                "Add MONGODB_URI to backend/.env to enable the application database."
            )
            return

        try:
            self._client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
            )
            self._db = self._client[settings.MONGODB_DB_NAME]
            # Ping to confirm connection
            await self._client.admin.command("ping")
            logger.info(
                f"✓ MongoDB connected — database: '{settings.MONGODB_DB_NAME}'"
            )
        except Exception as e:
            logger.error(f"MongoDB connection failed: {e}")
            self._client = None
            self._db = None

    async def disconnect(self):
        """Close the MongoDB connection. Called during FastAPI lifespan shutdown."""
        if self._client:
            self._client.close()
            logger.info("MongoDB connection closed.")
            self._client = None
            self._db = None

    @property
    def database(self) -> Optional[AsyncIOMotorDatabase]:
        """Return the active database instance, or None if not connected."""
        return self._db

    def get_collection(self, name: str):
        """
        Get a named collection from the application database.

        Raises RuntimeError if MongoDB is not connected.
        """
        if self._db is None:
            raise RuntimeError(
                f"MongoDB is not connected. Cannot access collection '{name}'. "
                "Check that MONGODB_URI is set in backend/.env."
            )
        return self._db[name]

    async def get_status(self) -> dict:
        """Return connection status for the health endpoint."""
        if not self.is_configured:
            return {
                "status": "NOT_CONFIGURED",
                "details": "Add MONGODB_URI to backend/.env",
                "database": None,
            }
        if self._db is None:
            return {
                "status": "DISCONNECTED",
                "details": "Connection failed at startup — check MONGODB_URI",
                "database": settings.MONGODB_DB_NAME,
            }
        try:
            await self._client.admin.command("ping")
            return {
                "status": "CONNECTED",
                "details": "Healthy",
                "database": settings.MONGODB_DB_NAME,
            }
        except Exception as e:
            return {
                "status": "ERROR",
                "details": str(e),
                "database": settings.MONGODB_DB_NAME,
            }


# Singleton instance used throughout the application
db_service = MongoDBService()


async def get_db() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency — inject the active MongoDB database.

    Usage in a route:
        from fastapi import Depends
        from app.db.mongodb import get_db

        @router.get("/something")
        async def my_route(db = Depends(get_db)):
            result = await db["equipment"].find_one({"id": "MOT-001"})
    """
    if db_service.database is None:
        raise RuntimeError(
            "MongoDB is not connected. Set MONGODB_URI in backend/.env and restart."
        )
    return db_service.database
