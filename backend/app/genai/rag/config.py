"""
RAG Configuration
-----------------
All paths, constants, and equipment keyword mappings for the RAG pipeline.

Paths are derived from this file's location using pathlib so the project
remains fully portable — no hard-coded Windows drive letters.

Directory layout assumed:
    backend/
    └── app/
        ├── genai/
        │   └── rag/
        │       └── config.py   ← this file
        └── data/
            ├── manuals/
            │   ├── own/
            │   └── sources/
            └── chroma_db/
"""
from pathlib import Path

# ── Path resolution ────────────────────────────────────────────────────────────
# __file__ = backend/app/genai/rag/config.py
# .parent   = backend/app/genai/rag/
# .parent×3 = backend/app/
_APP_DIR: Path = Path(__file__).resolve().parent.parent.parent  # backend/app/

MANUALS_DIR: Path = _APP_DIR / "data" / "manuals"
OWN_MANUALS_DIR: Path = MANUALS_DIR / "own"
SOURCE_MANUALS_DIR: Path = MANUALS_DIR / "sources"
CHROMA_PERSIST_DIR: Path = _APP_DIR / "data" / "chroma_db"

# ── ChromaDB ───────────────────────────────────────────────────────────────────
CHROMA_COLLECTION_NAME: str = "manual_chunks"

# ── Chunking (character-based, ~500-token target) ──────────────────────────────
# Using 4 chars ≈ 1 token as a reasonable approximation for English technical text.
# 500 tokens × 4 chars/token = 2000 chars target chunk size.
# 50 tokens × 4 chars/token  = 200 chars overlap.
CHUNK_SIZE: int = 2000       # characters
CHUNK_OVERLAP: int = 200     # characters

# ── Retrieval ──────────────────────────────────────────────────────────────────
TOP_K_DEFAULT: int = 4

# ChromaDB uses L2 distance by default (lower = more similar).
# Embeddings from NVIDIA are typically normalized, so distances >1.4 are
# usually semantically unrelated.  Chunks beyond this threshold are excluded.
RELEVANCE_THRESHOLD: float = 1.4

# ── Equipment keyword mapping ─────────────────────────────────────────────────
# Keys are lowercase substrings to match against the PDF filename (stem).
# Order matters: first match wins.  Add more keywords as you add more PDFs.
EQUIPMENT_KEYWORD_MAP: list[tuple[str, str]] = [
    # (filename_keyword, equipment_type)
    ("motor",          "motor"),
    ("compressor",     "compressor"),
    ("hvac",           "hvac"),
    ("heating",        "hvac"),
    ("cooling",        "hvac"),
    ("conveyor",       "conveyor"),
    ("belt",           "conveyor"),
    ("pump",           "pump"),
    ("centrifugal",    "pump"),
    ("ig40",           "industrial_gas"),   # IG40Mod5.pdf
    ("boiler",         "boiler"),
    ("generator",      "generator"),
    ("turbine",        "turbine"),
    ("hydraulic",      "hydraulic"),
]


def infer_equipment_type(filename: str) -> str:
    """
    Infer equipment type from a PDF filename.

    Matches lowercase filename stem against EQUIPMENT_KEYWORD_MAP.
    Returns 'unknown' if no keyword is matched.

    Examples:
        motor_manual.pdf          → motor
        compressor_manual.pdf     → compressor
        hvac_guide.pdf            → hvac
        guide_to_home_heating_cooling.pdf → hvac
        MNM-BeltConveyorAlert.pdf → conveyor
        IG40Mod5.pdf              → industrial_gas
    """
    stem = Path(filename).stem.lower()
    for keyword, equipment_type in EQUIPMENT_KEYWORD_MAP:
        if keyword in stem:
            return equipment_type
    return "unknown"
