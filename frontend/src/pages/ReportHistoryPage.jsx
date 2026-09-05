import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Eye, 
  PlusCircle, 
  Filter,
  Check,
  ChevronRight,
  UserCheck
} from 'lucide-react';

export const ReportHistoryPage = ({ onNavigate }) => {
  const { user, isManager } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUserFilter, setSelectedUserFilter] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUsersIfManager() {
      if (isManager) {
        try {
          const list = await api.users.getAll();
          setUsersList(list.filter(u => u.role === 'TeamMember'));
        } catch {
          // ignore
        }
      }
    }
    loadUsersIfManager();
  }, [isManager]);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const params = {
          status: statusFilter,
          userId: selectedUserFilter || undefined,
          pageSize: 50
        };
        const res = await api.reports.getAll(params);
        setReports(res.items || []);
      } catch (err) {
        setError('Failed to fetch reports: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [statusFilter, selectedUserFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge badge-approved"><CheckCircle2 size={12} /> Approved</span>;
      case 'Submitted':
        return <span className="badge badge-submitted"><Clock size={12} /> Submitted</span>;
      case 'NeedsCorrection':
        return <span className="badge badge-needs-correction"><AlertCircle size={12} /> Needs Correction</span>;
      default:
        return <span className="badge badge-draft">Draft</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#fff' }}>
            {isManager ? 'Weekly Reports History' : 'My Weekly Reports'}
          </h1>
          <p style={{ fontSize: '0.86rem', marginTop: 4 }}>
            {isManager 
              ? 'View all submitted weekly reports across team members, review progress, and inspect past versions.' 
              : 'Track your weekly report submissions, draft updates, and manager review feedback.'}
          </p>
        </div>

        <button
          onClick={() => onNavigate('create-report')}
          className="btn btn-primary"
        >
          <PlusCircle size={16} />
          <span>Create New Report</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Filter size={16} />
            <span>Filter Status:</span>
          </div>

          {['All', 'Submitted', 'NeedsCorrection', 'Approved', 'Draft'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {status === 'NeedsCorrection' ? 'Needs Correction' : status}
            </button>
          ))}
        </div>

        {isManager && usersList.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Team Member:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
            >
              <option value="">All Team Members</option>
              {usersList.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="alert-box alert-warning" style={{ marginBottom: 20 }}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading reports history...
        </div>
      ) : reports.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <FileText size={42} color="var(--text-dim)" style={{ marginBottom: 14 }} />
          <h3 style={{ color: '#fff', marginBottom: 6 }}>No reports found</h3>
          <p style={{ fontSize: '0.86rem', maxWidth: 420, margin: '0 auto 20px' }}>
            {statusFilter !== 'All' 
              ? `No reports currently match the status "${statusFilter}".` 
              : 'You have not created any weekly work reports yet.'}
          </p>
          <button
            onClick={() => onNavigate('create-report')}
            className="btn btn-primary"
          >
            <PlusCircle size={16} />
            <span>Create Your First Report</span>
          </button>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                {isManager && <th>Team Member</th>}
                <th>Week Range</th>
                <th>Project Category</th>
                <th>Tasks</th>
                <th>Hours Spent</th>
                <th>Status</th>
                <th>Version</th>
                <th>Submitted Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  {isManager && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={report.userAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                          alt={report.userName}
                          style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span 
                          onClick={() => onNavigate('team-profile', report.userId)}
                          style={{ fontWeight: 600, color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {report.userName}
                        </span>
                      </div>
                    </td>
                  )}
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="#3b82f6" />
                      <span>{new Date(report.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(report.weekEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>{report.projectName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{report.projectCategoryTag}</div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{report.tasksCount}</span> tasks
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#60a5fa' }}>{report.totalHoursSpent}</span> hrs
                  </td>
                  <td>
                    <div>
                      {getStatusBadge(report.status)}
                      {report.latestCommentAction === 'ChangesRequested' && (
                        <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: 4, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          ⚠️ Changes requested
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      v{report.currentVersionNumber}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      {/* If user owns report and it needs correction or is draft */}
                      {(report.status === 'Draft' || report.status === 'NeedsCorrection') && (
                        <button
                          onClick={() => onNavigate('edit-report', report.id)}
                          className="btn btn-sm btn-primary"
                          title="Edit report"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                      )}

                      {/* Read-only view for all */}
                      <button
                        onClick={() => onNavigate('report-detail', report.id)}
                        className="btn btn-sm btn-secondary"
                        title="View document"
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>

                      {/* Manager Review Action */}
                      {isManager && report.status === 'Submitted' && (
                        <button
                          onClick={() => onNavigate('review', report.id)}
                          className="btn btn-sm btn-warning"
                          title="Review this submitted report"
                        >
                          <UserCheck size={14} />
                          <span>Review</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
