from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.equipment import EquipmentItem

router = APIRouter()

# Realistic industrial equipment dataset
MOCK_EQUIPMENT: List[EquipmentItem] = [
    EquipmentItem(
        id="MOT-4081",
        name="Main Drive Induction Motor",
        category="Industrial Motor",
        model="Simotics 1LE1501-2DB23",
        manufacturer="Siemens Industrial",
        location="Line 3 — Extruder Bay",
        installation_date="2023-04-12",
        status="MAINTENANCE_REQUIRED",
        health_score=74,
        last_serviced="2026-07-09",
        next_inspection="2026-08-25",
        open_issues_count=1,
        active_error_code="ERR-MOTOR-082",
        specifications={
            "Power Rating": "75 kW (100 HP)",
            "RPM": "1785 RPM",
            "Voltage": "460 V 3-Phase",
            "Full Load Amps": "118 A",
            "Frame Size": "284T"
        }
    ),
    EquipmentItem(
        id="PMP-1044",
        name="High-Pressure Slurry Pump",
        category="Centrifugal Pump",
        model="Flowserve Mark 3 ANSI",
        manufacturer="Flowserve Corp",
        location="Clarifier Intake Station",
        installation_date="2022-11-18",
        status="NOMINAL",
        health_score=96,
        last_serviced="2026-08-01",
        next_inspection="2026-09-01",
        open_issues_count=0,
        active_error_code=None,
        specifications={
            "Flow Rate": "450 GPM",
            "Discharge Head": "180 ft",
            "Impeller Diameter": "10.5 in",
            "Seal Type": "Plan 53A Dual Mechanical"
        }
    ),
    EquipmentItem(
        id="CMP-9022",
        name="Rotary Screw Air Compressor",
        category="Air Compressor",
        model="Atlas Copco GA 90 VSD",
        manufacturer="Atlas Copco",
        location="Utility Building Compressors Room",
        installation_date="2021-08-05",
        status="CRITICAL_ALERT",
        health_score=58,
        last_serviced="2026-06-15",
        next_inspection="2026-08-22",
        open_issues_count=2,
        active_error_code="ERR-CMP-104",
        specifications={
            "Capacity": "580 CFM",
            "Working Pressure": "125 PSI",
            "Cooling": "Air Cooled Aftercooler",
            "Oil Type": "Roto-Xtend Duty Fluid"
        }
    ),
    EquipmentItem(
        id="CNV-3310",
        name="Bulk Material Feed Conveyor",
        category="Conveyor System",
        model="Flexco HeavyDuty Transporter 48",
        manufacturer="Flexco Systems",
        location="Raw Materials Loading Dock",
        installation_date="2023-01-20",
        status="NOMINAL",
        health_score=91,
        last_serviced="2026-07-28",
        next_inspection="2026-08-30",
        open_issues_count=0,
        active_error_code=None,
        specifications={
            "Belt Width": "48 in",
            "Belt Speed": "250 FPM",
            "Drive System": "Shaft-Mounted Gearmotor",
            "Length": "120 ft"
        }
    ),
    EquipmentItem(
        id="HVC-6601",
        name="Cleanroom Packaged HVAC Unit",
        category="HVAC Unit",
        model="Trane IntelliPak II 50-Ton",
        manufacturer="Trane Technologies",
        location="Cleanroom Rooftop Bay 4",
        installation_date="2022-03-14",
        status="NOMINAL",
        health_score=88,
        last_serviced="2026-07-15",
        next_inspection="2026-09-15",
        open_issues_count=0,
        active_error_code=None,
        specifications={
            "Tonnage": "50 Tons",
            "Refrigerant": "R-410A",
            "Airflow": "18,000 CFM",
            "Filter Stage": "MERV 14 + HEPA 99.97%"
        }
    )
]


@router.get("", response_model=List[EquipmentItem])
async def list_equipment(
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by operational status"),
    search: Optional[str] = Query(None, description="Search by ID, name or model")
):
    """
    List industrial equipment assets with filtering and search.
    """
    results = MOCK_EQUIPMENT
    if category and category != "All":
        results = [e for e in results if e.category.lower() == category.lower()]
    if status and status != "All":
        results = [e for e in results if e.status.lower() == status.lower()]
    if search:
        s = search.lower()
        results = [
            e for e in results
            if s in e.id.lower() or s in e.name.lower() or s in e.model.lower() or s in e.location.lower()
        ]
    return results


@router.get("/{equipment_id}", response_model=EquipmentItem)
async def get_equipment_detail(equipment_id: str):
    """
    Get detailed equipment specifications and telemetry state.
    """
    for item in MOCK_EQUIPMENT:
        if item.id.lower() == equipment_id.lower():
            return item
    raise HTTPException(status_code=404, detail=f"Equipment asset '{equipment_id}' not found")
