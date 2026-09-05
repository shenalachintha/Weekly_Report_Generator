import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { 
  FileText, 
  BarChart3, 
  PlusCircle, 
  FolderKanban, 
  Users, 
  Sparkles, 
  LogOut, 
  ChevronDown, 
  Columns, 
  Bot,
  Layers
} from 'lucide-react';

export const Navbar = ({ currentView, onNavigate, onToggleAiDrawer }) => {
  const { user, logout, quickLogin, isManager } = useAuth();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  return (
    <header style={{
      backgroundColor: 'rgba(17, 24, 39, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: 1380,
        margin: '0 auto',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20
      }}>
        {/* Brand */}
        <div 
          onClick={() => onNavigate(isManager ? 'dashboard' : 'history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer'
          }}
        >
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#fff' }}>
              ReportFlow
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Team & Weekly Intelligence
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isManager && (
            <>
              <button
                className={`btn btn-sm ${currentView === 'dashboard' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onNavigate('dashboard')}
                title="Consolidated manager team dashboard"
              >
                <BarChart3 size={16} />
                <span>Dashboard</span>
              </button>

              <button
                className={`btn btn-sm ${currentView === 'side-by-side' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onNavigate('side-by-side')}
                title="Cross-team side-by-side blockers & achievements"
              >
                <Columns size={16} />
                <span>Side-by-Side</span>
              </button>

              <button
                className={`btn btn-sm ${currentView === 'projects' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onNavigate('projects')}
              >
                <FolderKanban size={16} />
                <span>Projects</span>
              </button>

              <button
                className={`btn btn-sm ${currentView === 'users' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => onNavigate('users')}
              >
                <Users size={16} />
                <span>Team Users</span>
              </button>
            </>
          )}

          <button
            className={`btn btn-sm ${currentView === 'history' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onNavigate('history')}
          >
            <FileText size={16} />
            <span>{isManager ? 'All Reports' : 'My Reports'}</span>
          </button>

          <button
            className={`btn btn-sm ${currentView === 'create-report' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onNavigate('create-report')}
            style={{ marginLeft: 6 }}
          >
            <PlusCircle size={16} />
            <span>New Weekly Report</span>
          </button>

          {/* AI Assistant Button */}
          <button
            onClick={onToggleAiDrawer}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd',
              marginLeft: 4
            }}
            title="Ask AI Assistant about team progress"
          >
            <Sparkles size={16} />
            <span>AI Assistant</span>
          </button>
        </nav>

        {/* User Profile & Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          {/* Quick Demo Persona Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSwitchMenu(!showSwitchMenu)}
              className="btn btn-sm btn-ghost"
              style={{
                fontSize: '0.8rem',
                border: '1px dashed var(--border-color)',
                padding: '5px 10px',
                color: 'var(--text-muted)'
              }}
              title="Quick switch between demo accounts"
            >
              <span>Demo Persona</span>
              <ChevronDown size={14} />
            </button>

            {showSwitchMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: 40,
                width: 250,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: 8,
                zIndex: 60
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', padding: '6px 8px', textTransform: 'uppercase' }}>
                  Quick Switch Demo User
                </div>
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.key}
                    onClick={() => {
                      quickLogin(demo.key);
                      setShowSwitchMenu(false);
                      onNavigate(demo.role === 'Manager' ? 'dashboard' : 'history');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      background: user?.email === demo.email ? 'var(--bg-subtle)' : 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: user?.email === demo.email ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{demo.label}</span>
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: demo.badgeColor + '25',
                      color: demo.badgeColor,
                      fontWeight: 700
                    }}>
                      {demo.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Current User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img 
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
              alt={user?.fullName}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${isManager ? '#8b5cf6' : '#3b82f6'}`
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                {user?.fullName}
              </div>
              <div style={{ fontSize: '0.72rem', color: isManager ? '#a78bfa' : '#60a5fa', fontWeight: 600 }}>
                {user?.role === 'Manager' ? 'Manager / Admin' : 'Team Member'}
              </div>
            </div>

            <button
              onClick={logout}
              className="btn btn-ghost btn-sm"
              title="Sign Out"
              style={{ padding: '6px 8px', color: 'var(--text-dim)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
