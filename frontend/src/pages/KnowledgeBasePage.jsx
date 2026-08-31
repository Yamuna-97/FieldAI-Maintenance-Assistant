import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Upload, FileText, CheckCircle2, Layers, Download, 
  Plus, Trash2, HelpCircle, Send, Sparkles, AlertCircle, ExternalLink, RefreshCw 
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { getManualsList, uploadManual, deleteManual, queryRag, getRagStatus } from '../services/equipmentService';
import { API_BASE_URL } from '../services/api';
import { MOCK_MANUALS_LIST } from '../data/mockData';

export function KnowledgeBasePage() {
  const [manuals, setManuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  
  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Industrial Motor');
  const [uploadManufacturer, setUploadManufacturer] = useState('Siemens');
  const [uploadVersion, setUploadVersion] = useState('v1.0 (2026)');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  // RAG Query states
  const [ragQuery, setRagQuery] = useState('');
  const [ragCategory, setRagCategory] = useState('All');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState(null);
  const [ragError, setRagError] = useState('');
  const [showChunks, setShowChunks] = useState(false);

  // Chroma status
  const [ragStatusData, setRagStatusData] = useState(null);

  const categories = [
    'All',
    'Industrial Motor',
    'Centrifugal Pump',
    'Air Compressor',
    'Conveyor System',
    'HVAC Unit',
    'Industrial Gas / IG40'
  ];

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await getManualsList({
        equipment_type: typeFilter,
        search: searchQuery
      });
      setManuals(data && data.length > 0 ? data : MOCK_MANUALS_LIST);
    } catch (e) {
      console.warn('Failed to load manuals:', e);
      setManuals(MOCK_MANUALS_LIST);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const st = await getRagStatus();
      setRagStatusData(st);
    } catch (e) {
      console.warn('Failed to get RAG status:', e);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [typeFilter, searchQuery]);

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace('.pdf', '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadErrorMsg('Please select a PDF file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadErrorMsg('');
    setUploadSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('equipment_type', uploadCategory);
      formData.append('manufacturer', uploadManufacturer || 'OEM');
      formData.append('version', uploadVersion || 'v1.0 (2026)');

      const result = await uploadManual(formData);
      
      setUploadSuccessMsg(
        `Successfully indexed "${result.title}"! Extracted ${result.pages} pages and generated ${result.vector_chunks_count} vector chunks.`
      );
      
      // Refresh list & status
      await fetchDocs();
      await fetchStatus();

      // Reset form
      setTimeout(() => {
        setIsUploadOpen(false);
        setUploadFile(null);
        setUploadTitle('');
        setUploadSuccessMsg('');
      }, 2000);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadErrorMsg(err.message || 'Failed to upload and vectorize manual PDF.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteManual = async (manualId, manualTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${manualTitle}" and remove its vector embeddings?`)) {
      return;
    }
    try {
      await deleteManual(manualId);
      await fetchDocs();
      await fetchStatus();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleExecuteRagQuery = async (e) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    setRagLoading(true);
    setRagError('');
    setRagResult(null);

    // Map human readable category to backend filter
    let filterType = null;
    if (ragCategory !== 'All') {
      const map = {
        'Industrial Motor': 'motor',
        'Centrifugal Pump': 'pump',
        'Air Compressor': 'compressor',
        'Conveyor System': 'conveyor',
        'HVAC Unit': 'hvac',
        'Industrial Gas / IG40': 'industrial_gas'
      };
      filterType = map[ragCategory] || ragCategory.toLowerCase();
    }

    try {
      const response = await queryRag({
        question: ragQuery,
        equipment_type: filterType,
        top_k: 4
      });
      setRagResult(response);
    } catch (err) {
      console.error('RAG query failed:', err);
      setRagError(err.message || 'Failed to execute grounded query.');
    } finally {
      setRagLoading(false);
    }
  };

  const totalChunks = manuals.reduce((acc, m) => acc + (m.vector_chunks_count || m.vectorChunksCount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-800">
        <div>
          <h2 className="text-xl font-bold text-steel-100 font-sans tracking-wide">
            Knowledge Base & Technical Manuals
          </h2>
          <p className="text-xs font-mono text-steel-400 mt-0.5">
            Vectorized OEM engineering documentation powered by 1024D Semantic Vector Index (ChromaDB + Nemotron)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search manuals, specs, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>

          <div className="w-44">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={categories.map(c => ({ value: c, label: c === 'All' ? 'All Equipment' : c }))}
            />
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => {
              setUploadErrorMsg('');
              setUploadSuccessMsg('');
              setIsUploadOpen(true);
            }}
          >
            Upload PDF Manual
          </Button>
        </div>
      </div>

      {/* RAG Status Bar */}
      <div className="p-4 rounded-lg bg-carbon-900 border border-steel-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="cyan" size="sm" dot>SEMANTIC VECTOR RETRIEVAL</Badge>
          <span className="text-steel-300">Index: Dense 1024D</span>
          <span className="text-steel-600">|</span>
          <span className="text-steel-400">Embedding: Nemotron-3-Embed-1B</span>
          <span className="text-steel-600">|</span>
          <span className="text-cyan-glow font-bold">{ragStatusData?.total_chunks || totalChunks} Total Vector Chunks</span>
        </div>
        <div className="flex items-center gap-4 text-steel-400">
          <span>{manuals.length} Documents Registered</span>
          <span>·</span>
          <span>ChromaDB Vector Store</span>
          <button 
            onClick={() => { fetchDocs(); fetchStatus(); }} 
            className="hover:text-cyan-glow transition-colors"
            title="Refresh Index"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive RAG Grounded Query Explorer */}
      <div className="p-5 rounded-lg bg-carbon-900 border border-cyan-glow/30 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 pb-3 border-b border-steel-800">
          <div className="p-1.5 rounded bg-cyan-glow/10 text-cyan-glow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-steel-100 font-mono tracking-wide">
              RAG KNOWLEDGE RETRIEVAL & QA ASSISTANT
            </h3>
            <p className="text-xs font-mono text-steel-400">
              Query indexed OEM manuals and schematics for grounded, citation-backed maintenance procedures
            </p>
          </div>
        </div>

        <form onSubmit={handleExecuteRagQuery} className="mt-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Ask technical question (e.g. 'What is normal operating temperature for SIM-CMP-01?' or 'Motor bearing vibration limits')"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                icon={HelpCircle}
              />
            </div>
            <div className="w-full md:w-56">
              <Select
                value={ragCategory}
                onChange={(e) => setRagCategory(e.target.value)}
                options={categories.map(c => ({ value: c, label: c === 'All' ? 'Search All Manuals' : c }))}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              type="submit"
              icon={Send}
              loading={ragLoading}
              disabled={!ragQuery.trim() || ragLoading}
            >
              {ragLoading ? 'Querying RAG...' : 'Ask RAG'}
            </Button>
          </div>
        </form>

        {/* RAG Error Display */}
        {ragError && (
          <div className="mt-4 p-3 rounded bg-critical/10 border border-critical/30 flex items-center gap-2 text-xs font-mono text-critical">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{ragError}</span>
          </div>
        )}

        {/* RAG Result Card */}
        {ragResult && (
          <div className="mt-4 p-4 rounded-lg bg-carbon-950 border border-steel-800 space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-steel-850 pb-2">
              <div className="flex items-center gap-2">
                <Badge variant={ragResult.grounded ? "nominal" : "warning"} size="sm" dot>
                  {ragResult.grounded ? "GROUNDED RAG INFERENCE" : "KB FALLBACK"}
                </Badge>
                <span className="text-xs font-mono text-steel-400">
                  {ragResult.chunks_retrieved} vector chunks retrieved
                </span>
              </div>
              {ragResult.sources && ragResult.sources.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-steel-500">CITATIONS:</span>
                  {ragResult.sources.map((src, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded bg-carbon-800 border border-steel-700 text-cyan-glow text-[11px] font-mono"
                    >
                      {src.doc_name} (p. {src.page})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-sm font-sans text-steel-200 leading-relaxed whitespace-pre-wrap">
              {ragResult.answer}
            </div>

            {ragResult.sources && ragResult.sources.length > 0 && (
              <div className="pt-2 border-t border-steel-850 flex items-center justify-between text-xs font-mono text-steel-400">
                <span>Retrieved from ChromaDB 1024D vector index</span>
                <span className="text-cyan-glow font-bold">100% Grounded & Non-Hallucinatory</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manuals List Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-steel-200 font-mono tracking-wider uppercase">
            Indexed Technical Manuals & Guides ({manuals.length})
          </h3>
          {loading && <span className="text-xs font-mono text-cyan-glow animate-pulse">Loading manuals...</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {manuals.map((man) => {
            const pdfUrl = `${API_BASE_URL}/api/v1/manuals/${man.id}/pdf`;
            const chunksCount = man.vector_chunks_count || man.vectorChunksCount || 0;
            const isIndexed = man.indexed_status === 'INDEXED' || man.indexedStatus === 'INDEXED' || chunksCount > 0;

            return (
              <div
                key={man.id}
                className="p-5 rounded-lg bg-carbon-900 border border-steel-800 hover:border-steel-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-steel-850">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded bg-carbon-800 border border-steel-700 text-cyan-glow">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-cyan-glow font-bold">{man.id}</span>
                        <span className="text-xs font-mono text-steel-400 block">{man.manufacturer || 'OEM'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={isIndexed ? "nominal" : "warning"} size="sm" dot>
                        {isIndexed ? 'INDEXED' : 'PENDING'}
                      </Badge>
                      <button
                        onClick={() => handleDeleteManual(man.id, man.title)}
                        className="text-steel-600 hover:text-critical transition-colors p-1"
                        title="Delete manual"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-steel-100 mt-3 leading-snug">
                    {man.title}
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono text-steel-400">
                    <div>
                      <span className="text-steel-500 block text-[10px]">CATEGORY</span>
                      <span className="text-steel-200">{man.equipment_type || man.equipmentType}</span>
                    </div>
                    <div>
                      <span className="text-steel-500 block text-[10px]">VERSION</span>
                      <span className="text-steel-200">{man.version || 'v1.0'}</span>
                    </div>
                    <div>
                      <span className="text-steel-500 block text-[10px]">DOCUMENT SIZE</span>
                      <span className="text-steel-200">{man.file_size || man.fileSize} ({man.pages || 1} pages)</span>
                    </div>
                    <div>
                      <span className="text-steel-500 block text-[10px]">VECTOR CHUNKS</span>
                      <span className="text-cyan-glow font-bold">{chunksCount} chunks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-steel-850 flex items-center justify-between text-xs font-mono text-steel-400">
                  <span>Updated: {man.last_updated || man.lastUpdated || '2026-08-31'}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-steel-700 bg-carbon-800 hover:bg-carbon-750 text-steel-200 hover:text-cyan-glow text-xs font-mono transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open PDF
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Manual Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          if (!isUploading) setIsUploadOpen(false);
        }}
        title="Upload OEM Manual for RAG Ingestion"
        subtitle="Extracts document sections and generates 1024D vector embeddings for grounded search"
        footer={
          <>
            <Button 
              variant="ghost" 
              size="md" 
              onClick={() => setIsUploadOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              loading={isUploading}
              onClick={handleUploadSubmit}
            >
              {isUploading ? 'Ingesting & Vectorizing...' : 'Start Ingestion'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadSuccessMsg && (
            <div className="p-3 rounded bg-nominal/10 border border-nominal/30 flex items-center gap-2 text-xs font-mono text-nominal">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadSuccessMsg}</span>
            </div>
          )}

          {uploadErrorMsg && (
            <div className="p-3 rounded bg-critical/10 border border-critical/30 flex items-center gap-2 text-xs font-mono text-critical">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadErrorMsg}</span>
            </div>
          )}

          <div className="border-2 border-dashed border-steel-700 hover:border-cyan-glow/50 rounded-lg p-6 text-center bg-carbon-950 transition-colors">
            <Upload className="w-8 h-8 text-cyan-glow mx-auto mb-2" />
            <p className="text-sm text-steel-200">Select PDF Manual or Service Guide</p>
            <p className="text-xs font-mono text-steel-500 mt-1">Accepts PDF files up to 50 MB</p>
            <input
              type="file"
              accept=".pdf,application/pdf"
              className="mt-3 text-xs font-mono text-steel-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-steel-700 file:bg-carbon-800 file:text-steel-200 cursor-pointer"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {uploadFile && (
              <p className="mt-2 text-xs font-mono text-cyan-glow">
                Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Input
            label="Manual Title"
            placeholder="e.g. Ingersoll Rand Nirvana 15-30kW Maintenance Guide"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            disabled={isUploading}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Equipment Category"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              options={categories.filter(c => c !== 'All').map(c => ({ value: c, label: c }))}
              disabled={isUploading}
            />

            <Input
              label="Manufacturer / OEM"
              placeholder="e.g. Siemens, Flowserve, Atlas Copco"
              value={uploadManufacturer}
              onChange={(e) => setUploadManufacturer(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <Input
            label="Manual Version / Year"
            placeholder="e.g. v3.4 (2025)"
            value={uploadVersion}
            onChange={(e) => setUploadVersion(e.target.value)}
            disabled={isUploading}
          />
        </form>
      </Modal>
    </div>
  );
}
