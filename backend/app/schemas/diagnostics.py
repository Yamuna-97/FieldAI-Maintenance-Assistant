from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class DiagnosticRequest(BaseModel):
    equipment_id: str = Field(..., description="Asset identifier (e.g. MOT-4081)")
    error_code: Optional[str] = Field(None, description="Industrial fault/error code (e.g. ERR-MOTOR-082)")
    technician_notes: str = Field(..., description="Technician observed symptoms or specific inquiry")
    image_data: Optional[str] = Field(None, description="Base64 encoded equipment image or file reference")
    operating_parameters: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Sensor telemetry")


class VisualObservation(BaseModel):
    component: str
    anomaly_detected: bool
    description: str
    confidence: float
    bounding_box: Optional[List[float]] = None  # [ymin, xmin, ymax, xmax]


class InspectionStep(BaseModel):
    step_number: int
    title: str
    action: str
    safety_precaution: Optional[str] = None
    expected_nominal: Optional[str] = None
    estimated_time_mins: int = 15


class SourceCitation(BaseModel):
    document_title: str
    section: str
    page_number: int
    relevance_score: float
    excerpt: str


class DiagnosticResponse(BaseModel):
    diagnostic_id: str
    equipment_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    issue_summary: str
    severity: str  # "CRITICAL", "WARNING", "MODERATE", "LOW"
    confidence_score: float
    visual_observations: List[VisualObservation] = []
    error_code_analysis: Optional[str] = None
    safety_warnings: List[str] = []
    recommended_actions: List[InspectionStep] = []
    retrieved_knowledge: List[SourceCitation] = []
    maintenance_history_relevance: Optional[str] = None
    suggested_parts: List[str] = []
