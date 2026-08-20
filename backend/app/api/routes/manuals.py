from fastapi import APIRouter, Query
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()


class ManualItem(BaseModel):
    id: str
    title: str
    equipment_type: str
    manufacturer: str
    version: str
    file_size: str
    pages: int
    indexed_status: str  # "INDEXED", "INDEXING", "PENDING"
    last_updated: str
    vector_chunks_count: int


MOCK_MANUALS: List[ManualItem] = [
    ManualItem(
        id="MAN-001",
        title="Simotics 1LE1 AC Induction Motor Service & Maintenance Manual",
        equipment_type="Industrial Motor",
        manufacturer="Siemens",
        version="v3.4 (2024)",
        file_size="8.4 MB",
        pages=148,
        indexed_status="INDEXED",
        last_updated="2026-06-10",
        vector_chunks_count=184
    ),
    ManualItem(
        id="MAN-002",
        title="Flowserve Mark 3 ANSI Chemical & Slurry Pump Technical Guide",
        equipment_type="Centrifugal Pump",
        manufacturer="Flowserve",
        version="v2.1 (2023)",
        file_size="12.1 MB",
        pages=210,
        indexed_status="INDEXED",
        last_updated="2026-05-18",
        vector_chunks_count=246
    ),
    ManualItem(
        id="MAN-003",
        title="Atlas Copco GA 90 VSD Lubricated Rotary Screw Compressor Manual",
        equipment_type="Air Compressor",
        manufacturer="Atlas Copco",
        version="v4.0 (2024)",
        file_size="15.8 MB",
        pages=280,
        indexed_status="INDEXED",
        last_updated="2026-07-02",
        vector_chunks_count=310
    ),
    ManualItem(
        id="MAN-004",
        title="Flexco HeavyDuty Conveyor Belting & Splice Maintenance Handbook",
        equipment_type="Conveyor System",
        manufacturer="Flexco",
        version="v1.8 (2023)",
        file_size="5.2 MB",
        pages=92,
        indexed_status="INDEXED",
        last_updated="2026-04-12",
        vector_chunks_count=108
    ),
    ManualItem(
        id="MAN-005",
        title="Trane IntelliPak II Packaged Rooftop Unit Engineering Reference",
        equipment_type="HVAC Unit",
        manufacturer="Trane",
        version="v5.2 (2024)",
        file_size="18.9 MB",
        pages=340,
        indexed_status="INDEXED",
        last_updated="2026-06-25",
        vector_chunks_count=395
    )
]


@router.get("", response_model=List[ManualItem])
async def list_manuals(
    equipment_type: Optional[str] = Query(None, description="Filter by equipment category"),
    search: Optional[str] = Query(None, description="Search document title or manufacturer")
):
    """
    List technical manuals and knowledge base documents indexed for RAG retrieval.
    """
    results = MOCK_MANUALS
    if equipment_type and equipment_type != "All":
        results = [m for m in results if m.equipment_type.lower() == equipment_type.lower()]
    if search:
        s = search.lower()
        results = [
            m for m in results
            if s in m.title.lower() or s in m.manufacturer.lower() or s in m.equipment_type.lower()
        ]
    return results
