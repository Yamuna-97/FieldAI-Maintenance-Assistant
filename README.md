# FieldAI Assistant
## Multimodal AI-Powered Field-Service Maintenance Assistant (Project 15)

**FieldAI Assistant** is an engineering-grade diagnostic assistant designed for industrial field service technicians and reliability engineers. It integrates **Google Gemini Multimodal AI** for vision and reasoning, **NVIDIA Nemotron-3-Embed-1B** for RAG document embeddings, and grounded OEM manual retrieval.

---

## 🏗️ Architecture Overview

```
                      FieldAI Assistant
                             │
     ┌───────────────────────┴───────────────────────┐
     ▼                                               ▼
React + Vite Frontend                           FastAPI Backend
Tailwind CSS + Framer Motion                   Python 3.11.15 (version11)
Lucide Icons + Industrial Theme                      │
     │                                     ┌─────────┴─────────┐
     │ (Base URL Client)                   ▼                   ▼
     └──────────────────────────────► API Routes        Core Services
                                      ├── /health       ├── GeminiService (LLM & Vision)
                                      ├── /api/v1/...   ├── NvidiaEmbeddingService (nemotron-3-embed-1b)
                                                        ├── RagService & VisionService
                                                        └── AgentService
```

### AI Capabilities Separation
- **Gemini API:** Main LLM reasoning, multimodal image understanding, tool calling, and grounded action sequence synthesis.
- **NVIDIA API (`nemotron-3-embed-1b` / `NVIDIABuild-Autogen-59`):** Strictly used for high-dimensional text embeddings in the RAG manual pipeline.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Operating System:** Windows
- **Conda Environment:** `version11` (Python 3.11.15)
- **Node.js:** v18+ (v22 installed) & npm

---

### 1. Backend Setup & Execution

1. Open your terminal and activate your Conda environment:
   ```bash
   conda activate version11
   ```

2. Navigate to the backend directory:
   ```bash
   cd D:\FieldAI_Assistant\backend
   ```

3. (Optional) Configure your API keys in `backend/.env`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_key
   NVIDIA_API_KEY=your_actual_nvidia_key
   ```

4. Start the FastAPI backend:
   ```bash
   python run.py
   ```
   *The backend will be live at `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).*

---

### 2. Frontend Setup & Execution

1. In a separate terminal, navigate to the frontend directory:
   ```bash
   cd D:\FieldAI_Assistant\frontend
   ```

2. Install dependencies (first time only):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be live at `http://localhost:5173`.*

---

## 📁 Project Structure

```
FieldAI_Assistant/
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI App & CORS configuration
│   │   ├── core/
│   │   │   ├── config.py                    # Pydantic Settings & Environment
│   │   │   └── security.py                  # API Key security helpers
│   │   ├── api/routes/
│   │   │   ├── health.py                    # Health & System Status endpoints
│   │   │   ├── diagnostics.py               # Multimodal Diagnostic routes
│   │   │   ├── equipment.py                 # Equipment catalog & telemetry
│   │   │   ├── manuals.py                   # Manuals & RAG index routes
│   │   │   └── maintenance.py               # Maintenance history logs
│   │   ├── services/
│   │   │   ├── gemini_service.py            # Gemini Multimodal & Reasoning
│   │   │   ├── nvidia_embedding_service.py  # NVIDIA nemotron-3-embed-1b
│   │   │   ├── rag_service.py               # Manuals RAG coordinator
│   │   │   ├── vision_service.py            # Equipment image inspection
│   │   │   └── agent_service.py             # Diagnostic agent workflow
│   │   └── schemas/                         # Pydantic schemas
│   ├── run.py                               # Backend runner
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/                      # UI, Layout, & Diagnostic components
│   │   ├── pages/                           # 8 Product Views
│   │   ├── services/                        # API & Equipment client services
│   │   ├── data/mockData.js                 # Realistic industrial telemetry data
│   │   └── styles/index.css                 # Industrial theme & Tailwind
│   ├── package.json
│   └── vite.config.js
└── README.md
```
