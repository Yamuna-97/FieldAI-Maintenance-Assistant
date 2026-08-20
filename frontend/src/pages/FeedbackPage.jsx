import React, { useState } from 'react';
import { MessageSquare, Star, CheckCircle2, ThumbsUp, ThumbsDown, Send, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { MOCK_EQUIPMENT_LIST } from '../data/mockData';

export function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [wasUseful, setWasUseful] = useState('yes');
  const [issueType, setIssueType] = useState('Mechanical Alignment');
  const [equipmentId, setEquipmentId] = useState('MOT-4081');
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComments('');
    }, 4000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-4 border-b border-steel-800">
        <h2 className="text-xl font-bold text-steel-100 font-sans tracking-wide">
          Technician Diagnostic Feedback
        </h2>
        <p className="text-xs font-mono text-steel-400 mt-0.5">
          Reinforce AI accuracy and validate grounded manual citations from field inspections
        </p>
      </div>

      {submitted ? (
        <div className="p-8 rounded-lg bg-carbon-900 border border-nominal/40 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-nominal/10 text-nominal mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-steel-100 font-mono">
            Feedback Successfully Logged
          </h3>
          <p className="text-xs text-steel-300 font-sans max-w-md mx-auto">
            Thank you for validating this diagnostic run. Your field observations help calibrate our grounding model and OEM manual relevance scores.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card title="Diagnostic Evaluation" icon={MessageSquare}>
            <div className="space-y-5">
              {/* Star Rating */}
              <div>
                <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider mb-2">
                  Overall Diagnostic Quality & Accuracy Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1.5 rounded transition-all ${
                        star <= rating ? 'text-hazard' : 'text-steel-600 hover:text-steel-400'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-hazard' : ''}`} />
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-mono text-steel-400">
                    {rating === 5 ? 'Exceptional Accuracy' : rating >= 3 ? 'Acceptable Guidance' : 'Needs Calibration'}
                  </span>
                </div>
              </div>

              {/* Useful Check */}
              <div>
                <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider mb-2">
                  Were the recommended inspection steps actionable?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'yes', label: 'Yes, Fully Resolved Issue' },
                    { id: 'partial', label: 'Partially Useful' },
                    { id: 'no', label: 'Inaccurate / Off-Target' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setWasUseful(opt.id)}
                      className={`p-3 rounded border text-xs font-mono text-center transition-all ${
                        wasUseful === opt.id
                          ? 'bg-carbon-800 border-cyan-accent text-cyan-glow'
                          : 'bg-carbon-950 border-steel-800 text-steel-400 hover:border-steel-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Target Equipment Asset"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  options={MOCK_EQUIPMENT_LIST.map(e => ({ value: e.id, label: `${e.id} (${e.category})` }))}
                />

                <Select
                  label="Observed Issue Type"
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  options={[
                    'Mechanical Alignment & Vibration',
                    'Lubrication & Bearing Fatigue',
                    'Thermal Elevation / Overheat',
                    'Electrical / Sensor Fault',
                    'Hydraulic / Seal Leakage'
                  ]}
                />
              </div>

              <Textarea
                label="Technician Notes & Feedback"
                rows={4}
                placeholder="Detail any discrepancies in torque specifications, unexpected physical conditions, or parts required..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Send}
                className="w-full"
              >
                Submit Feedback Report
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
