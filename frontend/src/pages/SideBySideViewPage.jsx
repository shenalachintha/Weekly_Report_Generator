import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Columns, 
  Flag, 
  Award, 
  Calendar, 
  ArrowLeft, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  UserCheck 
} from 'lucide-react';

export const SideBySideViewPage = ({ onNavigate }) => {
  const [sectionType, setSectionType] = useState('Blockers'); // 'Blockers' or 'Achievements'
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getSideBySide(null, sectionType);
      setData(res);
    } catch (err) {
      setError('Failed to load side-by-side data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sectionType]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge badge-approved">Approved</span>;
      case 'Submitted':
        return <span className="badge badge-submitted">Submitted</span>;
      case 'NeedsCorrection':
        return <span className="badge badge-needs-correction">Needs Correction</span>;
      case 'Draft':
        return <span className="badge badge-draft">Draft</span>;
      default:
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)' }}>Not Started</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <button onClick={() => onNavigate('dashboard')} className="btn btn-ghost btn-sm" style={{ gap: 6, marginBottom: 8 }}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Columns size={26} color="#8b5cf6" />
            <span>Cross-Team Side-by-Side Analysis</span>
          </h1>
          <p style={{ fontSize: '0.86rem', marginTop: 4 }}>
            Compare specific sections across all team members simultaneously for the active sprint without opening individual reports.
          </p>
        </div>

        {/* Section Toggle Controls */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-card)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setSectionType('Blockers')}
            className={`btn btn-sm ${sectionType === 'Blockers' ? 'btn-danger' : 'btn-ghost'}`}
            style={{ fontSize: '0.85rem', gap: 6 }}
          >
            <Flag size={14} />
            <span>Blockers & Challenges</span>
          </button>

          <button
            onClick={() => setSectionType('Achievements')}
            className={`btn btn-sm ${sectionType === 'Achievements' ? 'btn-success' : 'btn-ghost'}`}
            style={{ fontSize: '0.85rem', gap: 6 }}
          >
            <Award size={14} />
            <span>Achievements & Highlights</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-warning" style={{ marginBottom: 20 }}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Aggregating {sectionType.toLowerCase()} across all team members...
        </div>
      ) : !data || !data.members || data.members.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p>No team members found.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20
        }}>
          {data.members.map((member) => {
            const hasContent = !!member.content;
            const isFlaggedKey = member.keyIndex >= 0;

            return (
              <div 
                key={member.userId}
                className="card"
                style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isFlaggedKey 
                    ? `1px solid ${sectionType === 'Blockers' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                    : '1px solid var(--border-color)',
                  boxShadow: isFlaggedKey 
                    ? `0 0 15px ${sectionType === 'Blockers' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`
                    : 'var(--shadow-md)'
                }}
              >
                <div>
                  {/* Member info header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={member.userAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                        alt={member.userName}
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div 
                          onClick={() => onNavigate('team-profile', member.userId)}
                          style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {member.userName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                          {member.jobTitle || 'Team Member'}
                        </div>
                      </div>
                    </div>

                    {getStatusBadge(member.status)}
                  </div>

                  {/* Project & Metrics Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: 16,
                    fontSize: '0.78rem'
                  }}>
                    <span style={{ color: '#93c5fd', fontWeight: 600 }}>{member.projectName || 'Unassigned'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{member.totalHours} hrs logged</span>
                  </div>

                  {/* Section Content */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {sectionType}
                      </span>
                      {isFlaggedKey && (
                        <span className="badge" style={{
                          fontSize: '0.68rem',
                          background: sectionType === 'Blockers' ? '#ef444425' : '#10b98125',
                          color: sectionType === 'Blockers' ? '#f87171' : '#34d399',
                          border: `1px solid ${sectionType === 'Blockers' ? '#ef444450' : '#10b98150'}`
                        }}>
                          {sectionType === 'Blockers' ? <><Flag size={10} /> Key Issue</> : <><Award size={10} /> Key Highlight</>}
                        </span>
                      )}
                    </div>

                    <div style={{
                      padding: 14,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isFlaggedKey
                        ? (sectionType === 'Blockers' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)')
                        : 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.86rem',
                      color: hasContent ? '#e5e7eb' : 'var(--text-dim)',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-wrap',
                      minHeight: 100
                    }}>
                      {hasContent ? member.content : `No ${sectionType.toLowerCase()} logged for this period.`}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                {member.reportId && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => onNavigate('report-detail', member.reportId)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.8rem', gap: 6 }}
                    >
                      <Eye size={14} />
                      <span>Inspect Full Report</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
