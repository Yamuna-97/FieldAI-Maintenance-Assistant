import React, { useState, useEffect } from 'react';
import { Cpu, Search, Filter, AlertTriangle, CheckCircle, Activity, Info, Wrench } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { getEquipmentList } from '../services/equipmentService';
import { MOCK_EQUIPMENT_LIST } from '../data/mockData';

export function EquipmentPage({ onSelectForDiagnostic }) {
  const [equipment, setEquipment] = useState(MOCK_EQUIPMENT_LIST);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      const data = await getEquipmentList({
        category: categoryFilter,
        status: statusFilter,
        search: searchQuery
      });
      setEquipment(data);
    };
    fetchEquipment();
  }, [categoryFilter, statusFilter, searchQuery]);

  const categories = ['All', 'Industrial Motor', 'Centrifugal Pump', 'Air Compressor', 'Conveyor System', 'HVAC Unit'];
  const statuses = ['All', 'NOMINAL', 'MAINTENANCE_REQUIRED', 'CRITICAL_ALERT'];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-800">
        <div>
          <h2 className="text-xl font-bold text-steel-100 font-sans tracking-wide">
            Industrial Equipment Catalog
          </h2>
          <p className="text-xs font-mono text-steel-400 mt-0.5">
            Monitored plant machinery and telemetry tracking
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search ID, name, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>

          <div className="w-40">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categories.map(c => ({ value: c, label: c === 'All' ? 'All Types' : c }))}
            />
          </div>

          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statuses.map(s => ({ value: s, label: s === 'All' ? 'All Statuses' : s.replace('_', ' ') }))}
            />
          </div>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipment.map((item) => {
          const statusVariant =
            item.status === 'NOMINAL'
              ? 'nominal'
              : item.status === 'CRITICAL_ALERT'
              ? 'critical'
              : 'warning';

          return (
            <div
              key={item.id}
              className="p-5 rounded-lg bg-carbon-900 border border-steel-800 hover:border-steel-700 transition-all flex flex-col justify-between space-y-4 shadow-sm group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-steel-850">
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan-glow">{item.id}</span>
                    <h3 className="text-sm font-semibold text-steel-100 mt-0.5">{item.name}</h3>
                    <span className="text-[11px] font-mono text-steel-400">{item.manufacturer} · {item.model}</span>
                  </div>
                  <Badge variant={statusVariant} size="sm" dot>
                    {item.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-steel-400">
                    <span>Location:</span>
                    <span className="text-steel-200">{item.location}</span>
                  </div>
                  <div className="flex justify-between text-steel-400">
                    <span>Health Index:</span>
                    <span className={`font-bold ${item.healthScore > 80 ? 'text-nominal' : item.healthScore > 60 ? 'text-hazard' : 'text-critical'}`}>
                      {item.healthScore}%
                    </span>
                  </div>
                  <div className="flex justify-between text-steel-400">
                    <span>Last Service:</span>
                    <span className="text-steel-200">{item.lastServiced || item.last_serviced}</span>
                  </div>
                  {item.activeErrorCode && (
                    <div className="p-2 rounded bg-carbon-950 border border-hazard/40 text-hazard flex items-center justify-between text-[11px]">
                      <span>Active Alarm:</span>
                      <span className="font-bold">{item.activeErrorCode}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-steel-850">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Info}
                  onClick={() => setSelectedAsset(item)}
                  className="flex-1"
                >
                  Specs
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Activity}
                  onClick={() => onSelectForDiagnostic(item.id)}
                  className="flex-1"
                >
                  Diagnose
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Specifications Modal */}
      <Modal
        isOpen={Boolean(selectedAsset)}
        onClose={() => setSelectedAsset(null)}
        title={selectedAsset ? `${selectedAsset.id} — ${selectedAsset.name}` : ''}
        subtitle={selectedAsset ? `Manufacturer: ${selectedAsset.manufacturer} | Model: ${selectedAsset.model}` : ''}
        footer={
          <Button
            variant="primary"
            size="md"
            icon={Activity}
            onClick={() => {
              const id = selectedAsset?.id;
              setSelectedAsset(null);
              onSelectForDiagnostic(id);
            }}
          >
            Launch Diagnostic on {selectedAsset?.id}
          </Button>
        }
      >
        {selectedAsset && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-3 rounded bg-carbon-950 border border-steel-800 grid grid-cols-2 gap-3">
              <div>
                <span className="text-steel-500 block">LOCATION</span>
                <span className="text-steel-200 font-bold">{selectedAsset.location}</span>
              </div>
              <div>
                <span className="text-steel-500 block">INSTALLATION DATE</span>
                <span className="text-steel-200">{selectedAsset.installationDate || selectedAsset.installation_date}</span>
              </div>
              <div>
                <span className="text-steel-500 block">NEXT INSPECTION</span>
                <span className="text-steel-200">{selectedAsset.nextInspection || selectedAsset.next_inspection}</span>
              </div>
              <div>
                <span className="text-steel-500 block">HEALTH SCORE</span>
                <span className="text-nominal font-bold">{selectedAsset.healthScore}%</span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-steel-300 uppercase tracking-wider">
              Technical Specifications
            </h4>

            <div className="p-3 rounded bg-carbon-950 border border-steel-800 space-y-2">
              {Object.entries(selectedAsset.specifications || {}).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-steel-900 last:border-none">
                  <span className="text-steel-400">{key}:</span>
                  <span className="text-steel-100 font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
