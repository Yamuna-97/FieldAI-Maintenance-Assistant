"""
NVIDIA Embedding Service
------------------------
Responsible ONLY for generating text embeddings using NVIDIA's API:
- Model: nemotron-3-embed-1b
- Configuration/Credential Identifier: NVIDIABuild-Autogen-59
- Clean abstraction for RAG embedding generation.
"""
from typing import List, Optional
import httpx
import logging
from app.core.config import settings
from app.core.security import validate_nvidia_configured

logger = logging.getLogger(__name__)


class NvidiaEmbeddingService:
    def __init__(self):
        self.model_name = settings.NVIDIA_EMBEDDING_MODEL
        self.api_endpoint = settings.NVIDIA_API_ENDPOINT
        self.credential_id = settings.NVIDIA_CREDENTIAL_IDENTIFIER
        self.embedding_dimension = 1024  # nemotron-3-embed-1b typical dimension

    @property
    def is_available(self) -> bool:
        return validate_nvidia_configured()

    def get_status_info(self) -> dict:
        return {
            "name": "High-Dimensional Vector Engine",
            "provider": "Neural Vector Core",
            "model": "semantic-embed-1024d",
            "status": "ONLINE" if self.is_available else "CONFIGURED_STANDBY",
            "dimension": self.embedding_dimension,
            "role": "1024D Semantic Vectorization for OEM Manuals & Schematics"
        }

    async def embed_text(self, text: str, input_type: str = "query") -> List[float]:
        """
        Generate embedding for a single text query or snippet.
        """
        if not text or not text.strip():
            return [0.0] * self.embedding_dimension

        if not self.is_available:
            logger.warning("NVIDIA_API_KEY not configured. Generating synthetic normalized vector for development.")
            return self._generate_mock_embedding(text)

        headers = {
            "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "input": [text],
            "model": self.model_name,
            "input_type": input_type,
            "encoding_format": "float"
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.api_endpoint}/embeddings",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                return data["data"][0]["embedding"]
        except Exception as e:
            logger.error(f"Error calling NVIDIA embedding API: {str(e)}. Using fallback representation.")
            return self._generate_mock_embedding(text)

    async def embed_documents(self, texts: List[str], input_type: str = "passage") -> List[List[float]]:
        """
        Generate embeddings for a batch of manual passages or document chunks.
        """
        if not texts:
            return []

        if not self.is_available:
            return [self._generate_mock_embedding(t) for t in texts]

        headers = {
            "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        payload = {
            "input": texts,
            "model": self.model_name,
            "input_type": input_type,
            "encoding_format": "float"
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.api_endpoint}/embeddings",
                    json=payload,
                    headers=headers
                )
                response.raise_for_status()
                data = response.json()
                return [item["embedding"] for item in data["data"]]
        except Exception as e:
            logger.error(f"Error calling NVIDIA embedding batch API: {str(e)}. Using fallback representation.")
            return [self._generate_mock_embedding(t) for t in texts]

    def _generate_mock_embedding(self, text: str) -> List[float]:
        """Deterministic pseudo-embedding for testing when offline or in dev."""
        import hashlib
        import math
        
        seed = int(hashlib.md5(text.encode("utf-8")).hexdigest(), 16)
        vec = []
        for i in range(self.embedding_dimension):
            val = math.sin(seed + i * 0.314)
            vec.append(round(val, 6))
        
        norm = math.sqrt(sum(x * x for x in vec)) or 1.0
        return [round(x / norm, 6) for x in vec]


nvidia_embedding_service = NvidiaEmbeddingService()
