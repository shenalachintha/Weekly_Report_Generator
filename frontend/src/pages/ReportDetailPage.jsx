import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  FolderKanban, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  MessageSquare, 
  ExternalLink, 
  Edit3, 
  UserCheck, 
  Flag, 
  Award,
  Layers
} from 'lucide-react';

export const ReportDetailPage = ({ reportId, onNavigate }) => {
  const { user, isManager } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(-1); // -1 = current live version

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await api.reports.getById(reportId);
        setReport(data);
      } catch (err) {
        setError('Failed to load report details: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading report document and version snapshots...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
        <h3 style={{ color: '#fff', marginBottom: 8 }}>Unable to View Report</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error || 'Report not found'}</p>
        <button onClick={() => onNavigate('history')} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Return to Reports List</span>
        </button>
      </div>
    );
  }

  // Handle version snapshot rendering
  let activeViewData = {
    tasks: report.tasks,
    hours: report.hoursBreakdown,
    blockers: report.blockersNotes,
    keyBlockerIndex: report.keyBlockerIndex,
    achievements: report.achievementsNotes,
    keyAchievementIndex: report.keyAchievementIndex,
    nextWeek: report.tasksPlannedNextWeek,
    versionLabel: `v${report.currentVersionNumber} (Current)`
  };

  if (selectedVersionIndex >= 0 && report.versions && report.versions[selectedVersionIndex]) {
    try {
      const snap = JSON.parse(report.versions[selectedVersionIndex].snapshotJson);
      activeViewData = {
        tasks: snap.Tasks || snap.tasks || [],
        hours: snap.Hours || snap.hours || [],
        blockers: snap.BlockersNotes || snap.blockersNotes || '',
        keyBlockerIndex: snap.KeyBlockerIndex !== undefined ? snap.KeyBlockerIndex : -1,
        achievements: snap.AchievementsNotes || snap.achievementsNotes || '',
        keyAchievementIndex: snap.KeyAchievementIndex !== undefined ? snap.KeyAchievementIndex : -1,
        nextWeek: snap.TasksPlannedNextWeek || snap.tasksPlannedNextWeek || '',
        versionLabel: `v${report.versions[selectedVersionIndex].versionNumber} (Snapshot from ${new Date(report.versions[selectedVersionIndex].submittedAt).toLocaleString()})`
      };
    } catch (e) {
      console.error('Failed to parse snapshot json', e);
    }
  }

  const isOwner = user?.id === report.userId;
  const canEdit = isOwner && (report.status === 'Draft' || report.status === 'NeedsCorrection');

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Navigation & Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <button
          onClick={() => onNavigate('history')}
          className="btn btn-ghost btn-sm"
          style={{ gap: 6 }}
        >
          <ArrowLeft size={16} />
          <span>Back to List</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {canEdit && (
            <button
              onClick={() => onNavigate('edit-report', report.id)}
              className="btn btn-primary btn-sm"
            >
              <Edit3 size={14} />
              <span>Edit Report</span>
            </button>
          )}

          {isManager && report.status === 'Submitted' && (
            <button
              onClick={() => onNavigate('review', report.id)}
              className="btn btn-warning btn-sm"
            >
              <UserCheck size={14} />
              <span>Take Review Action</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Document Card */}
      <div className="card" style={{ padding: 36, marginBottom: 30 }}>
        {/* Document Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 20,
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span className={`badge badge-${report.status.toLowerCase().replace(' ', '-')}`}>
                {report.status === 'NeedsCorrection' ? 'Needs Correction' : report.status}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {activeViewData.versionLabel}
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: 6 }}>
              Weekly Work Report
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={15} color="#3b82f6" />
                {new Date(report.weekStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(report.weekEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderKanban size={15} color="#8b5cf6" />
                {report.projectName} ({report.projectCategoryTag})
              </span>
            </div>
          </div>

          {/* Author Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <img
              src={report.userAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
              alt={report.userName}
              style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                {report.userName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {report.userJobTitle || 'Engineering Team Member'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 Version History Switcher (Assignment Requirement) */}
        {report.versions && report.versions.length > 0 && (
          <div style={{
            padding: '12px 18px',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#93c5fd' }}>
              <History size={16} />
              <span style={{ fontWeight: 600 }}>Version History Timeline:</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                (Toggle past submitted versions to view changes before correction cycles)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => setSelectedVersionIndex(-1)}
                className={`btn btn-sm ${selectedVersionIndex === -1 ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                Current v{report.currentVersionNumber}
              </button>

              {report.versions.map((ver, idx) => (
                <button
                  key={ver.id}
                  onClick={() => setSelectedVersionIndex(idx)}
                  className={`btn btn-sm ${selectedVersionIndex === idx ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  v{ver.versionNumber} ({new Date(ver.submittedAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' })})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Table */}
        <div style={{ marginBottom: 30 }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 12 }}>
            Tasks Completed & In-Progress
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Hours (Plan / Spent)</th>
                  <th>Deliverable Produced</th>
                </tr>
              </thead>
              <tbody>
                {activeViewData.tasks && activeViewData.tasks.map((task, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {task.taskName || task.TaskName}
                    </td>
                    <td>
                      <span className={`badge badge-${(task.priority || task.Priority || 'medium').toLowerCase()}`}>
                        {task.priority || task.Priority}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', minWidth: 60 }}>
                          <div style={{
                            width: `${task.actualPercentage !== undefined ? task.actualPercentage : task.ActualPercentage}%`,
                            height: '100%',
                            backgroundColor: (task.actualPercentage || task.ActualPercentage) >= 100 ? '#10b981' : '#3b82f6',
                            borderRadius: 3
                          }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {task.actualPercentage !== undefined ? task.actualPercentage : task.ActualPercentage}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: (task.status || task.Status) === 'Completed' ? '#34d399' : '#fbbf24'
                      }}>
                        {task.status || task.Status}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {task.timePlannedHours !== undefined ? task.timePlannedHours : task.TimePlannedHours}h / 
                      </span>
                      <span style={{ fontWeight: 600, color: '#60a5fa', marginLeft: 4 }}>
                        {task.timeSpentHours !== undefined ? task.timeSpentHours : task.TimeSpentHours}h
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {(task.outputDeliverable || task.OutputDeliverable) || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks Planned Next Week */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 8 }}>
            Tasks Planned for Next Week
          </h3>
          <div style={{
            padding: 16,
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.88rem',
            whiteSpace: 'pre-wrap',
            color: activeViewData.nextWeek ? '#e5e7eb' : 'var(--text-dim)'
          }}>
            {activeViewData.nextWeek || 'None specified.'}
          </div>
        </div>

        {/* Blockers & Achievements Grid */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          {/* Blockers */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ fontSize: '1rem', color: '#fff' }}>Blockers / Challenges</h3>
              {activeViewData.keyBlockerIndex >= 0 && (
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <Flag size={10} /> Key Issue
                </span>
              )}
            </div>
            <div style={{
              padding: 16,
              backgroundColor: 'rgba(239, 68, 68, 0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              fontSize: '0.88rem',
              whiteSpace: 'pre-wrap',
              color: activeViewData.blockers ? '#fca5a5' : 'var(--text-dim)'
            }}>
              {activeViewData.blockers || 'No blockers reported.'}
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ fontSize: '1rem', color: '#fff' }}>Achievements / Highlights</h3>
              {activeViewData.keyAchievementIndex >= 0 && (
                <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <Award size={10} /> Key Achievement
                </span>
              )}
            </div>
            <div style={{
              padding: 16,
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              fontSize: '0.88rem',
              whiteSpace: 'pre-wrap',
              color: activeViewData.achievements ? '#a7f3d0' : 'var(--text-dim)'
            }}>
              {activeViewData.achievements || 'None recorded.'}
            </div>
          </div>
        </div>

        {/* Hours Breakdown */}
        {activeViewData.hours && activeViewData.hours.length > 0 && (
          <div style={{
            marginBottom: 28,
            padding: 18,
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} color="#06b6d4" />
              <span>Hours Worked Breakdown by Task Type</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {activeViewData.hours.map((h, i) => (
                <div key={i} style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.82rem'
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{h.taskType || h.TaskType}: </span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{h.hoursSpent !== undefined ? h.hoursSpent : h.HoursSpent} hrs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Notes */}
        {report.optionalNotesOrLinks && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 600, color: '#fff' }}>Notes / Links: </span>
            <span>{report.optionalNotesOrLinks}</span>
          </div>
        )}
      </div>

      {/* Review Comments History & Audit Trail (Section 3 Requirement) */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <MessageSquare size={18} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Manager Review Comments & Workflow Audit</h3>
        </div>

        {(!report.comments || report.comments.length === 0) ? (
          <p style={{ fontSize: '0.85rem' }}>No manager review comments have been left on this report yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {report.comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: comment.action === 'Approved' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${comment.action === 'Approved' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem' }}>
                      {comment.authorName}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: comment.action === 'Approved' ? '#10b98125' : '#f59e0b25',
                      color: comment.action === 'Approved' ? '#34d399' : '#fbbf24'
                    }}>
                      {comment.action === 'Approved' ? 'Approved' : 'Requested Changes'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Against Version v{comment.targetVersionNumber}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.86rem', color: '#e5e7eb', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                  {comment.commentText}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
