import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  FolderKanban, 
  TrendingUp,
  FileText
} from 'lucide-react';

export const TeamMemberProfilePage = ({ userId, onNavigate }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await api.users.getProfile(userId);
        setProfileData(data);
      } catch (err) {
        setError('Failed to load team member profile: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading team member profile and history...
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
        <h3 style={{ color: '#fff', marginBottom: 8 }}>Profile Not Found</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
        <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const { user: member, stats, reportsHistory } = profileData;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Back button */}
      <button onClick={() => onNavigate('dashboard')} className="btn btn-ghost btn-sm" style={{ gap: 6, marginBottom: 20 }}>
        <ArrowLeft size={16} />
        <span>Back to Manager Dashboard</span>
      </button>

      {/* Member Header Card */}
      <div className="card" style={{ padding: 32, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <img
            src={member.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
            alt={member.fullName}
            style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid #3b82f6' }}
          />

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: '1.65rem', color: '#fff' }}>{member.fullName}</h1>
              <span className="badge badge-submitted">{member.role}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, color: 'var(--text-muted)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} />
                {member.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={14} />
                {member.jobTitle || 'Engineer'}
              </span>
            </div>

            {/* Assigned Projects */}
            {member.assignedProjects && member.assignedProjects.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>Projects:</span>
                {member.assignedProjects.map((p) => (
                  <span
                    key={p.id}
                    style={{
                      fontSize: '0.75rem',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Member Statistics Grid */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.totalReports}</div>
            <div className="stat-label">Total Reports Filed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.approvedReports}</div>
            <div className="stat-label">Approved Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.totalTasksCompleted}</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.averageHoursPerReport}h</div>
            <div className="stat-label">Avg Hours / Week</div>
          </div>
        </div>
      </div>

      {/* Submission History Table */}
      <div className="card" style={{ padding: 28 }}>
        <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="#3b82f6" />
          <span>Full Weekly Report History</span>
        </h3>

        {(!reportsHistory || reportsHistory.length === 0) ? (
          <p style={{ fontSize: '0.85rem' }}>No reports recorded yet for this team member.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Week Starting</th>
                  <th>Project</th>
                  <th>Tasks Completed</th>
                  <th>Hours Logged</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportsHistory.map((rep) => (
                  <tr key={rep.id}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {new Date(rep.weekStartDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>{rep.projectName}</td>
                    <td>{rep.completedTasksCount} / {rep.tasksCount} tasks</td>
                    <td><span style={{ color: '#60a5fa', fontWeight: 600 }}>{rep.totalHours}</span> hrs</td>
                    <td>v{rep.currentVersionNumber}</td>
                    <td>
                      <span className={`badge badge-${rep.status.toLowerCase().replace(' ', '-')}`}>
                        {rep.status === 'NeedsCorrection' ? 'Needs Correction' : rep.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onNavigate('report-detail', rep.id)}
                        className="btn btn-sm btn-secondary"
                        style={{ gap: 6 }}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
