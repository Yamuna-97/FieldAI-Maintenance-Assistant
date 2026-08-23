import React, { useState, useEffect } from 'react';
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
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { authService } from './services/authService';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [targetEquipmentId, setTargetEquipmentId] = useState('MOT-4081');
  const [currentUser, setCurrentUser] = useState(() => authService.getUser());

  useEffect(() => {
    // Validate session against MongoDB backend on mount
    const verifySession = async () => {
      if (authService.isAuthenticated()) {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      }
    };
    verifySession();
  }, []);

  const handleNavigateToDiagnostic = (equipmentId) => {
    if (equipmentId) {
      setTargetEquipmentId(equipmentId);
    }
    setActiveTab('diagnostics');
  };

  const handleProtectedNavigate = (tabName) => {
    if (!currentUser && tabName !== 'landing' && tabName !== 'login' && tabName !== 'signup') {
      setActiveTab('login');
      return;
    }
    setActiveTab(tabName);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('overview');
  };

  const handleSignupSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('overview');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setActiveTab('landing');
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onNavigate={handleProtectedNavigate} />;
      case 'login':
        return (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateToSignup={() => setActiveTab('signup')}
          />
        );
      case 'signup':
        return (
          <SignupPage
            onSignupSuccess={handleSignupSuccess}
            onNavigateToLogin={() => setActiveTab('login')}
          />
        );
      case 'overview':
        return <DashboardPage onNavigate={setActiveTab} currentUser={currentUser} />;
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
        return <LandingPage onNavigate={handleProtectedNavigate} />;
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
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
