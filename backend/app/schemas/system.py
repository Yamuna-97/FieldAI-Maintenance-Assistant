from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime


class HealthResponse(BaseModel):
    status: str = Field(default="healthy", description="Application health status")
    project: str = Field(default="FieldAI Assistant", description="Project name")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ComponentStatus(BaseModel):
    name: str
    status: str  # "ONLINE", "STANDBY", "CONFIGURED", "READY", "NOT_CONFIGURED"
    provider: str
    model_or_info: Optional[str] = None
    latency_ms: Optional[float] = None
    details: Optional[str] = None


class SystemStatusResponse(BaseModel):
    project: str
    version: str
    environment: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    components: Dict[str, ComponentStatus]
    summary: str
