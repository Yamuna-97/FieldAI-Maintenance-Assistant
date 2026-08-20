from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class EquipmentItem(BaseModel):
    id: str = Field(..., description="Asset identifier, e.g. MOT-4081")
    name: str = Field(..., description="Equipment name")
    category: str = Field(..., description="Category, e.g. Industrial Motor, Centrifugal Pump")
    model: str
    manufacturer: str
    location: str
    installation_date: str
    status: str  # "NOMINAL", "MAINTENANCE_REQUIRED", "CRITICAL_ALERT", "OFFLINE"
    health_score: int = Field(100, ge=0, le=100)
    last_serviced: str
    next_inspection: str
    open_issues_count: int = 0
    active_error_code: Optional[str] = None
    specifications: dict = {}


class EquipmentFilter(BaseModel):
    category: Optional[str] = None
    status: Optional[str] = None
    search: Optional[str] = None
