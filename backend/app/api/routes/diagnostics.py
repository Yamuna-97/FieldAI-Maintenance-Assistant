from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.diagnostics import DiagnosticRequest, DiagnosticResponse
from app.services.agent_service import agent_service

router = APIRouter()


@router.post("/analyze", response_model=DiagnosticResponse)
async def run_diagnostic(request: DiagnosticRequest):
    """
    Execute multimodal diagnostic analysis for equipment using Vision, RAG Manuals, and Gemini reasoning.
    """
    try:
        response = await agent_service.execute_diagnostic_pipeline(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Diagnostic pipeline execution failed: {str(e)}")


@router.get("/recent", response_model=List[DiagnosticResponse])
async def get_recent_diagnostics():
    """
    Get recent diagnostic runs for telemetry and history.
    """
    mock_request = DiagnosticRequest(
        equipment_id="MOT-4081",
        error_code="ERR-MOTOR-082",
        technician_notes="High vibration observed on drive end bearing during full-load cycle."
    )
    result = await agent_service.execute_diagnostic_pipeline(mock_request)
    return [result]
