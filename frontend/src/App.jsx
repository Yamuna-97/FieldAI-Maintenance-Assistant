import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { MaintenanceHistoryPage } from './pages/MaintenanceHistoryPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [targetEquipmentId, setTargetEquipmentId] = useState('MOT-4081');

  const handleNavigateToDiagnostic = (equipmentId) => {
    if (equipmentId) {
      setTargetEquipmentId(equipmentId);
    }
    setActiveTab('diagnostics');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={setActiveTab} />;
      case 'overview':
        return <DashboardPage onNavigate={setActiveTab} />;
      case 'equipment':
        return <EquipmentPage onSelectForDiagnostic={handleNavigateToDiagnostic} />;
      case 'diagnostics':
        return <DiagnosticsPage initialEquipmentId={targetEquipmentId} />;
      case 'manuals':
        return <KnowledgeBasePage />;
      case 'maintenance':
        return <MaintenanceHistoryPage />;
      case 'feedback':
        return <FeedbackPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LandingPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {renderActivePage()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
