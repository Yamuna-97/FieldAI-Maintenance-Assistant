from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    PROJECT_NAME: str = "FieldAI Assistant"
    PROJECT_VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Server configuration
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"
    
    # CORS Origins (Vite dev server)
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[List[str], str]) -> List[str]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # AI Provider Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-pro-latest"
    
    # NVIDIA Settings
    # NVIDIA_EMBEDDING_MODEL: Used strictly for RAG document/query embeddings.
    # NVIDIA_RAG_MODEL: LLM for grounded answer generation (OpenAI-compatible endpoint).
    NVIDIA_API_KEY: str = ""
    NVIDIA_EMBEDDING_MODEL: str = "nemotron-3-embed-1b"
    NVIDIA_RAG_MODEL: str = "meta/llama-3.1-70b-instruct"
    NVIDIA_API_ENDPOINT: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_CREDENTIAL_IDENTIFIER: str = "NVIDIABuild-Autogen-59"

    # Database
    # MongoDB — application database (users, equipment, diagnostics, maintenance history)
    MONGODB_URI: str = ""
    MONGODB_DB_NAME: str = "fieldai"

    # SQLite fallback (kept for backwards compatibility — ignored if MONGODB_URI is set)
    DATABASE_URL: str = "sqlite:///./field_ai.db"

    # Authentication & JWT
    JWT_SECRET_KEY: str = "fieldai-super-secret-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )


settings = Settings()
