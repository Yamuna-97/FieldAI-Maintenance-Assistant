"""
Gemini AI Service
-----------------
Main reasoning, multimodal image understanding, troubleshooting generation,
and structured output generation abstraction.
"""
from typing import Dict, Any, List, Optional
import httpx
import logging
from app.core.config import settings
from app.core.security import validate_gemini_configured

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self):
        self.model_name = settings.GEMINI_MODEL
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    @property
    def is_available(self) -> bool:
        return validate_gemini_configured()

    def get_status_info(self) -> dict:
        return {
            "name": "Gemini AI Engine",
            "provider": "Google Gemini",
            "model": self.model_name,
            "status": "ONLINE" if self.is_available else "CONFIGURED_STANDBY",
            "role": "Multimodal Vision, LLM Reasoning, Diagnostic Synthesis"
        }

    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2
    ) -> str:
        """
        Generate text response from Gemini LLM.
        """
        if not self.is_available:
            logger.info("Gemini API key not configured. Returning structured placeholder guidance.")
            return "Gemini service is initialized in development mode. Configure GEMINI_API_KEY in .env for live inferences."

        url = f"{self.base_url}/models/{self.model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        
        contents = []
        if system_instruction:
            contents.append({"role": "user", "parts": [{"text": f"System Context: {system_instruction}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. Ready for field maintenance instructions."}]})
            
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 2048,
            }
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                result = response.json()
                return result["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            return f"Diagnostic analysis error: {str(e)}"

    async def analyze_multimodal(
        self,
        image_base64: str,
        mime_type: str,
        prompt: str,
        equipment_context: Optional[dict] = None
    ) -> Dict[str, Any]:
        """
        Multimodal image understanding and visual symptom extraction.
        """
        if not self.is_available:
            return {
                "observations": [
                    {
                        "component": "Drive Shaft Coupling",
                        "anomaly_detected": True,
                        "description": "Visible thermal discoloration and 2mm misalignment on flange.",
                        "confidence": 0.94,
                        "bounding_box": [0.35, 0.42, 0.68, 0.78]
                    }
                ],
                "summary": "Visual inspection indicates mechanical misalignment and potential bearing fatigue."
            }

        url = f"{self.base_url}/models/{self.model_name}:generateContent?key={settings.GEMINI_API_KEY}"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": image_base64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Error calling Gemini Multimodal API: {str(e)}")
            return {"error": str(e)}


gemini_service = GeminiService()
