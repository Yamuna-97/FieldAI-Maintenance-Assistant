import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Upload, FileText, CheckCircle2, Layers, Download, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { getManualsList } from '../services/equipmentService';
import { MOCK_MANUALS_LIST } from '../data/mockData';

export function KnowledgeBasePage() {
  const [manuals, setManuals] = useState(MOCK_MANUALS_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [indexingSimulated, setIndexingSimulated] = useState(false);

  useEffect(() => {
    const fetchDocs = async () => {
      const data = await getManualsList({
        equipment_type: typeFilter,
        search: searchQuery
      });
      setManuals(data);
    };
    fetchDocs();
  }, [typeFilter, searchQuery]);

  const categories = ['All', 'Industrial Motor', 'Centrifugal Pump', 'Air Compressor', 'Conveyor System', 'HVAC Unit'];

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setIndexingSimulated(true);
    setTimeout(() => {
      setIndexingSimulated(false);
      setIsUploadOpen(false);
      setUploadedFileName('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-800">
        <div>
          <h2 className="text-xl font-bold text-steel-100 font-sans tracking-wide">
            Knowledge Base & Technical Manuals
          </h2>
          <p className="text-xs font-mono text-steel-400 mt-0.5">
            Vectorized OEM documentation powered by NVIDIA Nemotron-3-Embed-1B (1024D)
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
            onClick={() => setIsUploadOpen(true)}
          >
            Upload Manual
          </Button>
        </div>
      </div>

      {/* RAG Status Bar */}
      <div className="p-4 rounded-lg bg-carbon-900 border border-steel-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <Badge variant="cyan" size="sm" dot>NVIDIA RAG PIPELINE</Badge>
          <span className="text-steel-300">Model: nemotron-3-embed-1b</span>
          <span className="text-steel-600">|</span>
          <span className="text-steel-400">Embedding Dim: 1024</span>
        </div>
        <div className="flex items-center gap-4 text-steel-400">
          <span>{manuals.length} Documents Indexed</span>
          <span>·</span>
          <span>ChromaDB Vector Store</span>
        </div>
      </div>

      {/* Manuals List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {manuals.map((man) => (
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
                    <span className="text-xs font-mono text-steel-400 block">{man.manufacturer}</span>
                  </div>
                </div>
                <Badge variant="nominal" size="sm" dot>
                  {man.indexedStatus || man.indexed_status || 'INDEXED'}
                </Badge>
              </div>

              <h3 className="text-sm font-semibold text-steel-100 mt-3 leading-snug">
                {man.title}
              </h3>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono text-steel-400">
                <div>
                  <span className="text-steel-500 block text-[10px]">CATEGORY</span>
                  <span className="text-steel-200">{man.equipmentType || man.equipment_type}</span>
                </div>
                <div>
                  <span className="text-steel-500 block text-[10px]">VERSION</span>
                  <span className="text-steel-200">{man.version}</span>
                </div>
                <div>
                  <span className="text-steel-500 block text-[10px]">DOCUMENT SIZE</span>
                  <span className="text-steel-200">{man.fileSize || man.file_size} ({man.pages} pages)</span>
                </div>
                <div>
                  <span className="text-steel-500 block text-[10px]">VECTOR CHUNKS</span>
                  <span className="text-cyan-glow font-bold">{man.vectorChunksCount || man.vector_chunks_count || 180} chunks</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-steel-850 flex items-center justify-between text-xs font-mono text-steel-400">
              <span>Updated: {man.lastUpdated || man.last_updated}</span>
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => alert(`Downloading cached copy of ${man.title}`)}
              >
                PDF View
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Manual Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload OEM Manual for RAG Ingestion"
        subtitle="Processes PDF with PyMuPDF and generates embeddings via NVIDIA nemotron-3-embed-1b"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Upload}
              loading={indexingSimulated}
              onClick={handleUploadSubmit}
            >
              {indexingSimulated ? 'Indexing Vectors...' : 'Start Ingestion'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-steel-700 rounded-lg p-6 text-center bg-carbon-950">
            <Upload className="w-8 h-8 text-cyan-glow mx-auto mb-2" />
            <p className="text-sm text-steel-200">Select PDF Manual or Service Guide</p>
            <p className="text-xs font-mono text-steel-500 mt-1">Accepts PDF files up to 50 MB</p>
            <input
              type="file"
              accept=".pdf"
              className="mt-3 text-xs font-mono text-steel-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border file:border-steel-700 file:bg-carbon-800 file:text-steel-200 cursor-pointer"
              onChange={(e) => setUploadedFileName(e.target.files?.[0]?.name || '')}
            />
          </div>

          <Input
            label="Manual Title"
            placeholder="e.g. Ingersoll Rand Nirvana 15-30kW Maintenance Guide"
            defaultValue={uploadedFileName ? uploadedFileName.replace('.pdf', '') : ''}
          />

          <Select
            label="Target Equipment Category"
            options={categories.filter(c => c !== 'All')}
          />
        </form>
      </Modal>
    </div>
  );
}
