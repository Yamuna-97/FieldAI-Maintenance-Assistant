from fastapi import APIRouter, Query
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()


class MaintenanceRecord(BaseModel):
    id: str
    date: str
    asset_id: str
    asset_name: str
    issue_type: str
    error_code: Optional[str] = None
    action_taken: str
    technician: str
    status: str  # "RESOLVED", "SCHEDULED", "IN_PROGRESS"
    downtime_hours: float
    parts_replaced: List[str] = []


MOCK_HISTORY: List[MaintenanceRecord] = [
    {
        "id": "MNT-2026-089",
        "date": "2026-08-01",
        "asset_id": "PMP-1044",
        "asset_name": "High-Pressure Slurry Pump",
        "issue_type": "Scheduled Preventive Servicing",
        "error_code": None,
        "action_taken": "Flushed mechanical seal barrier fluid, re-greased thrust bearings with Mobilith SHC 100, verified impeller clearance (0.018 in).",
        "technician": "Sarah Jenkins (Lead Tech)",
        "status": "RESOLVED",
        "downtime_hours": 1.5,
        "parts_replaced": ["Barrier Fluid Cartridge #BF-10", "Seal O-ring Kit"]
    },
    {
        "id": "MNT-2026-077",
        "date": "2026-07-28",
        "asset_id": "CNV-3310",
        "asset_name": "Bulk Material Feed Conveyor",
        "issue_type": "Belt Misalignment & Edge Wear",
        "error_code": "WRN-CNV-014",
        "action_taken": "Adjusted take-up screw tensioners, realigned return idlers, installed secondary urethane belt scraper.",
        "technician": "Marcus Vance",
        "status": "RESOLVED",
        "downtime_hours": 2.0,
        "parts_replaced": ["Secondary Belt Scraper Blade"]
    },
    {
        "id": "MNT-2026-064",
        "date": "2026-07-09",
        "asset_id": "MOT-4081",
        "asset_name": "Main Drive Induction Motor",
        "issue_type": "Bearing Lubrication & Thermal Audit",
        "error_code": None,
        "action_taken": "Purged old grease from DE/NDE bearing housings. Injected 45g Klüberplex BEM 41-132. IR thermography showed 62°C nominal operating temp.",
        "technician": "Alex Rivera (Vibration Analyst)",
        "status": "RESOLVED",
        "downtime_hours": 0.75,
        "parts_replaced": ["Grease Relief Plugs"]
    },
    {
        "id": "MNT-2026-052",
        "date": "2026-06-15",
        "asset_id": "CMP-9022",
        "asset_name": "Rotary Screw Air Compressor",
        "issue_type": "Differential Pressure High Warning",
        "error_code": "ERR-CMP-104",
        "action_taken": "Replaced air/oil separator element and pre-filter cartridges. Drained condensate moisture trap.",
        "technician": "Sarah Jenkins (Lead Tech)",
        "status": "RESOLVED",
        "downtime_hours": 3.0,
        "parts_replaced": ["Air/Oil Separator Cartridge #OS-88", "Intake Air Filter Element"]
    },
    {
        "id": "MNT-2026-041",
        "date": "2026-05-20",
        "asset_id": "HVC-6601",
        "asset_name": "Cleanroom Packaged HVAC Unit",
        "issue_type": "Quarterly Filter Bank Replacement",
        "error_code": None,
        "action_taken": "Replaced MERV 14 pre-filters. Verified differential pressure at 0.45 in. w.g. Inspected blower belt tension.",
        "technician": "David Kim",
        "status": "RESOLVED",
        "downtime_hours": 1.0,
        "parts_replaced": ["MERV 14 Filter Pack (x8)"]
    }
]


@router.get("/history", response_model=List[MaintenanceRecord])
async def get_maintenance_history(
    asset_id: Optional[str] = Query(None, description="Filter by asset identifier"),
    status: Optional[str] = Query(None, description="Filter by status")
):
    """
    Get chronological maintenance history and service logs.
    """
    results = [MaintenanceRecord(**r) for r in MOCK_HISTORY]
    if asset_id:
        results = [r for r in results if r.asset_id.lower() == asset_id.lower()]
    if status:
        results = [r for r in results if r.status.lower() == status.lower()]
    return results
