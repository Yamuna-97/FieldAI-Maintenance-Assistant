from fastapi import APIRouter, Query, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from typing import List, Optional
from pydantic import BaseModel
from pathlib import Path
import os
import json
import logging
import shutil
import pymupdf as fitz
import chromadb

from app.genai.rag.config import (
    OWN_MANUALS_DIR,
    SOURCE_MANUALS_DIR,
    CHROMA_PERSIST_DIR,
    CHROMA_COLLECTION_NAME,
    infer_equipment_type,
)
from app.genai.rag.ingest import ingest_pdf_file, delete_pdf_from_chroma

router = APIRouter()
logger = logging.getLogger(__name__)

META_STORE_PATH = OWN_MANUALS_DIR.parent / "manuals_meta.json"


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
    filename: Optional[str] = None
    pdf_url: Optional[str] = None
    source_type: Optional[str] = "own"


def _format_file_size(size_bytes: int) -> str:
    if size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    elif size_bytes >= 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes} B"


def _load_meta_store() -> dict:
    if META_STORE_PATH.exists():
        try:
            with open(META_STORE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read manuals metadata: {e}")
    return {}


def _save_meta_store(meta: dict):
    try:
        META_STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(META_STORE_PATH, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to write manuals metadata: {e}")


def _get_chroma_chunk_counts() -> dict[str, int]:
    counts: dict[str, int] = {}
    try:
        client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIR))
        collection = client.get_or_create_collection(name=CHROMA_COLLECTION_NAME)
        # Fetch metadata items
        results = collection.get(include=["metadatas"])
        metadatas = results.get("metadatas", [])
        for meta in metadatas:
            if meta and "doc_name" in meta:
                doc = meta["doc_name"]
                counts[doc] = counts.get(doc, 0) + 1
    except Exception as e:
        logger.warning(f"Could not count ChromaDB chunks: {e}")
    return counts


def _build_manual_list() -> List[ManualItem]:
    meta_store = _load_meta_store()
    chunk_counts = _get_chroma_chunk_counts()
    items: List[ManualItem] = []

    # Map of filename -> (Path, source_type)
    discovered: dict[str, tuple[Path, str]] = {}

    if OWN_MANUALS_DIR.exists():
        for p in sorted(OWN_MANUALS_DIR.glob("*.pdf")):
            discovered[p.name] = (p, "own")

    if SOURCE_MANUALS_DIR.exists():
        for p in sorted(SOURCE_MANUALS_DIR.glob("*.pdf")):
            if p.name not in discovered:
                discovered[p.name] = (p, "real")

    idx = 1
    for filename, (path, source_type) in discovered.items():
        doc_meta = meta_store.get(filename, {})
        man_id = doc_meta.get("id", f"MAN-{idx:03d}")
        
        # Calculate real page count & size
        page_count = 1
        try:
            doc = fitz.open(str(path))
            page_count = len(doc)
            doc.close()
        except Exception:
            pass

        file_size_str = _format_file_size(path.stat().st_size) if path.exists() else "1.0 MB"
        inferred_eq = infer_equipment_type(filename)
        
        # Format human friendly equipment category
        cat_map = {
            "motor": "Industrial Motor",
            "compressor": "Air Compressor",
            "hvac": "HVAC Unit",
            "pump": "Centrifugal Pump",
            "conveyor": "Conveyor System",
            "industrial_gas": "Industrial Gas / IG40"
        }
        equipment_type = doc_meta.get("equipment_type") or cat_map.get(inferred_eq, "Industrial Equipment")
        
        title = doc_meta.get("title") or filename.replace(".pdf", "").replace("_", " ").title()
        manufacturer = doc_meta.get("manufacturer") or "OEM Industrial"
        version = doc_meta.get("version") or "v2.0 (2025)"
        last_updated = doc_meta.get("last_updated") or "2026-08-31"

        vector_chunks = chunk_counts.get(filename, 0)
        status = "INDEXED" if vector_chunks > 0 else "PENDING"

        items.append(ManualItem(
            id=man_id,
            title=title,
            equipment_type=equipment_type,
            manufacturer=manufacturer,
            version=version,
            file_size=file_size_str,
            pages=page_count,
            indexed_status=status,
            last_updated=last_updated,
            vector_chunks_count=vector_chunks,
            filename=filename,
            pdf_url=f"/api/v1/manuals/{man_id}/pdf",
            source_type=source_type
        ))
        idx += 1

    return items


@router.get("", response_model=List[ManualItem])
async def list_manuals(
    equipment_type: Optional[str] = Query(None, description="Filter by equipment category"),
    search: Optional[str] = Query(None, description="Search document title or manufacturer")
):
    """
    List technical manuals and knowledge base documents indexed for RAG retrieval.
    Scans physical PDFs and ChromaDB vector store.
    """
    results = _build_manual_list()
    if equipment_type and equipment_type != "All":
        results = [m for m in results if equipment_type.lower() in m.equipment_type.lower()]
    if search:
        s = search.lower()
        results = [
            m for m in results
            if s in m.title.lower() or s in m.manufacturer.lower() or s in m.equipment_type.lower() or (m.filename and s in m.filename.lower())
        ]
    return results


@router.post("/upload", response_model=ManualItem)
async def upload_manual(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    equipment_type: Optional[str] = Form(None),
    manufacturer: Optional[str] = Form("OEM"),
    version: Optional[str] = Form("v1.0 (2026)")
):
    """
    Upload a new technical PDF manual, extract sections, vectorize with 1024D embeddings,
    and index immediately into ChromaDB for grounded RAG answers.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF documents are supported.")

    OWN_MANUALS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Clean filename
    safe_filename = "".join(c for c in file.filename if c.isalnum() or c in ("-", "_", ".")).strip()
    if not safe_filename.endswith(".pdf"):
        safe_filename += ".pdf"

    dest_path = OWN_MANUALS_DIR / safe_filename

    # Save uploaded file to disk
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Ingest into ChromaDB
    try:
        ingest_result = ingest_pdf_file(
            pdf_path=dest_path,
            source_type="own",
            equipment_type=equipment_type
        )
    except Exception as e:
        logger.error(f"Ingestion failed for {safe_filename}: {e}")
        ingest_result = {
            "doc_name": safe_filename,
            "pages": 1,
            "chunks": 0,
            "equipment_type": equipment_type or "unknown"
        }

    # Generate Manual ID and save metadata
    meta_store = _load_meta_store()
    current_count = len(_build_manual_list()) + 1
    man_id = f"MAN-{current_count:03d}"

    cleaned_title = title if title and title.strip() else safe_filename.replace(".pdf", "").replace("_", " ").title()
    resolved_category = equipment_type if equipment_type and equipment_type != "All" else "Industrial Equipment"

    meta_store[safe_filename] = {
        "id": man_id,
        "title": cleaned_title,
        "equipment_type": resolved_category,
        "manufacturer": manufacturer or "OEM",
        "version": version or "v1.0 (2026)",
        "last_updated": "2026-08-31",
        "source_type": "own"
    }
    _save_meta_store(meta_store)

    file_size_str = _format_file_size(dest_path.stat().st_size)
    chunks_count = ingest_result.get("chunks", 0)
    pages_count = ingest_result.get("pages", 1)

    return ManualItem(
        id=man_id,
        title=cleaned_title,
        equipment_type=resolved_category,
        manufacturer=manufacturer or "OEM",
        version=version or "v1.0 (2026)",
        file_size=file_size_str,
        pages=pages_count,
        indexed_status="INDEXED" if chunks_count > 0 else "PENDING",
        last_updated="2026-08-31",
        vector_chunks_count=chunks_count,
        filename=safe_filename,
        pdf_url=f"/api/v1/manuals/{man_id}/pdf",
        source_type="own"
    )


@router.get("/{manual_id}/pdf")
async def get_manual_pdf(manual_id: str):
    """
    Stream or download the actual PDF manual by ID.
    """
    manuals = _build_manual_list()
    target = next((m for m in manuals if m.id == manual_id or m.filename == manual_id), None)
    if not target or not target.filename:
        raise HTTPException(status_code=404, detail="Manual document not found")

    # Look for file in own or sources
    pdf_path = OWN_MANUALS_DIR / target.filename
    if not pdf_path.exists():
        pdf_path = SOURCE_MANUALS_DIR / target.filename

    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail=f"PDF file '{target.filename}' not found on server disk")

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=target.filename,
        headers={"Content-Disposition": f"inline; filename={target.filename}"}
    )


@router.delete("/{manual_id}")
async def delete_manual(manual_id: str):
    """
    Delete a manual document and remove its vector embeddings from ChromaDB.
    """
    manuals = _build_manual_list()
    target = next((m for m in manuals if m.id == manual_id or m.filename == manual_id), None)
    if not target or not target.filename:
        raise HTTPException(status_code=404, detail="Manual document not found")

    filename = target.filename
    # Delete from ChromaDB
    deleted_chunks = delete_pdf_from_chroma(filename)

    # Delete physical file if in own
    pdf_path = OWN_MANUALS_DIR / filename
    if pdf_path.exists():
        try:
            os.remove(pdf_path)
        except Exception as e:
            logger.warning(f"Could not delete physical file {pdf_path}: {e}")

    # Remove from metadata store
    meta_store = _load_meta_store()
    if filename in meta_store:
        del meta_store[filename]
        _save_meta_store(meta_store)

    return {
        "status": "deleted",
        "manual_id": manual_id,
        "filename": filename,
        "chunks_removed": deleted_chunks
    }
