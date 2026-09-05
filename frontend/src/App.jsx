import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { LoginPage } from './pages/LoginPage';
import { PersonalReportPage } from './pages/PersonalReportPage';
import { ReportHistoryPage } from './pages/ReportHistoryPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { ManagerReviewPage } from './pages/ManagerReviewPage';
import { TeamDashboardPage } from './pages/TeamDashboardPage';
import { SideBySideViewPage } from './pages/SideBySideViewPage';
import { TeamMemberProfilePage } from './pages/TeamMemberProfilePage';
import { ProjectManagementPage } from './pages/ProjectManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { Sparkles } from 'lucide-react';

const MainApp = () => {
  const { user, loading, isManager } = useAuth();
  const [currentView, setCurrentView] = useState(() => (user?.role === 'Manager' ? 'dashboard' : 'history'));
  const [activeParamId, setActiveParamId] = useState(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        Initializing Weekly Report Generator...
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => setCurrentView(isManager ? 'dashboard' : 'history')} />;
  }

  const navigateTo = (view, paramId = null) => {
    setCurrentView(view);
    setActiveParamId(paramId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container">
      <Navbar
        currentView={currentView}
        onNavigate={navigateTo}
        onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
      />

      <main className="main-content">
        {currentView === 'dashboard' && <TeamDashboardPage onNavigate={navigateTo} />}
        {currentView === 'history' && <ReportHistoryPage onNavigate={navigateTo} />}
        {currentView === 'create-report' && <PersonalReportPage onNavigate={navigateTo} />}
        {currentView === 'edit-report' && <PersonalReportPage reportId={activeParamId} onNavigate={navigateTo} />}
        {currentView === 'report-detail' && <ReportDetailPage reportId={activeParamId} onNavigate={navigateTo} />}
        {currentView === 'review' && <ManagerReviewPage reportId={activeParamId} onNavigate={navigateTo} />}
        {currentView === 'side-by-side' && <SideBySideViewPage onNavigate={navigateTo} />}
        {currentView === 'team-profile' && <TeamMemberProfilePage userId={activeParamId} onNavigate={navigateTo} />}
        {currentView === 'projects' && <ProjectManagementPage onNavigate={navigateTo} />}
        {currentView === 'users' && <UserManagementPage onNavigate={navigateTo} />}
      </main>

      {/* Floating AI Assistant Trigger Button (Bottom Right) */}
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        className="btn"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 40,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
          gap: 8
        }}
        title="Open Team AI Assistant"
      >
        <Sparkles size={18} />
        <span>Ask Team AI</span>
      </button>

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
