import React, { useState, useEffect } from 'react';
import { History, Search, Calendar, User, Wrench, Clock, CheckCircle2, Package } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { getMaintenanceHistory } from '../services/equipmentService';
import { MOCK_MAINTENANCE_HISTORY } from '../data/mockData';

export function MaintenanceHistoryPage() {
  const [history, setHistory] = useState(MOCK_MAINTENANCE_HISTORY);
  const [assetFilter, setAssetFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      const data = await getMaintenanceHistory({
        asset_id: assetFilter === 'All' ? undefined : assetFilter
      });
      setHistory(data);
    };
    fetchHistory();
  }, [assetFilter]);

  const assetOptions = ['All', 'MOT-4081', 'PMP-1044', 'CMP-9022', 'CNV-3310', 'HVC-6601'];

  const filtered = history.filter((item) => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return (
      item.assetId?.toLowerCase().includes(s) ||
      item.asset_id?.toLowerCase().includes(s) ||
      item.issueType?.toLowerCase().includes(s) ||
      item.actionTaken?.toLowerCase().includes(s) ||
      item.technician?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-800">
        <div>
          <h2 className="text-xl font-bold text-steel-100 font-sans tracking-wide">
            Maintenance History & Service Timeline
          </h2>
          <p className="text-xs font-mono text-steel-400 mt-0.5">
            Audit trail of completed preventative maintenance and diagnostic interventions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search actions, parts, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>

          <div className="w-40">
            <Select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              options={assetOptions.map(a => ({ value: a, label: a === 'All' ? 'All Assets' : a }))}
            />
          </div>
        </div>
      </div>

      {/* Visual Timeline Layout */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-steel-800">
        {filtered.map((record, index) => (
          <div key={record.id} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-carbon-900 border-2 border-cyan-accent flex items-center justify-center text-cyan-glow shadow-cyan-glow">
              <span className="w-2 h-2 rounded-full bg-cyan-accent" />
            </div>

            {/* Record Content Box */}
            <div className="p-5 rounded-lg bg-carbon-900 border border-steel-800 hover:border-steel-700 transition-all space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-steel-850">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-glow">
                    {record.assetId || record.asset_id}
                  </span>
                  <span className="text-sm font-semibold text-steel-100">
                    {record.assetName || record.asset_name}
                  </span>
                  {record.errorCode && (
                    <Badge variant="warning" size="sm">
                      {record.errorCode}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-steel-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-steel-500" />
                    {record.date}
                  </span>
                  <Badge variant="nominal" size="sm" dot>
                    {record.status}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono text-steel-300 font-bold uppercase tracking-wider">
                  {record.issueType || record.issue_type}
                </h4>
                <p className="mt-1.5 text-xs text-steel-200 leading-relaxed font-sans">
                  {record.actionTaken || record.action_taken}
                </p>
              </div>

              {/* Parts & Tech Bar */}
              <div className="pt-2.5 border-t border-steel-850/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-steel-400">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-steel-500" />
                  <span>Technician: <strong className="text-steel-200">{record.technician}</strong></span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-steel-400">
                    <Clock className="w-3.5 h-3.5 text-steel-500" />
                    Downtime: <strong className="text-steel-200">{record.downtimeHours || record.downtime_hours} hrs</strong>
                  </span>

                  {(record.partsReplaced || record.parts_replaced)?.length > 0 && (
                    <div className="flex items-center gap-1 text-steel-300">
                      <Package className="w-3.5 h-3.5 text-cyan-glow" />
                      <span>{(record.partsReplaced || record.parts_replaced).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
