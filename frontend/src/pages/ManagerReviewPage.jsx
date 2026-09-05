import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  FileText, 
  Calendar, 
  FolderKanban, 
  Clock, 
  Flag, 
  Award,
  History,
  MessageSquare
} from 'lucide-react';

export const ManagerReviewPage = ({ reportId, onNavigate }) => {
  const { isManager } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' or 'ChangesRequested'
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await api.reports.getById(reportId);
        setReport(data);
      } catch (err) {
        setError('Failed to load report for review: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (reviewAction === 'ChangesRequested' && !commentText.trim()) {
      setError('Please provide a specific comment explaining what needs correction.');
      return;
    }

    setSubmitting(true);
    try {
      await api.reports.review(reportId, {
        action: reviewAction,
        commentText: commentText.trim()
      });

      setSuccess(
        reviewAction === 'Approved'
          ? 'Weekly report successfully approved!'
          : 'Report sent back for correction. The team member will see your feedback notice.'
      );

      setTimeout(() => {
        onNavigate('dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading report for review...
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="card" style={{ padding: 40, textAlign: 'center' }}>
        <AlertCircle size={36} color="#ef4444" style={{ marginBottom: 12 }} />
        <h3 style={{ color: '#fff', marginBottom: 8 }}>Unable to Load Review</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{error}</p>
        <button onClick={() => onNavigate('dashboard')} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1080, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => onNavigate('dashboard')} className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
          <ArrowLeft size={16} />
          <span>Back to Manager Dashboard</span>
        </button>

        <span className={`badge badge-${report.status.toLowerCase().replace(' ', '-')}`}>
          Current Status: {report.status} (v{report.currentVersionNumber})
        </span>
      </div>

      {success && (
        <div className="alert-box alert-success" style={{ marginBottom: 20 }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="alert-box alert-warning" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Review Action Form Card */}
      <div className="card" style={{
        padding: 30,
        marginBottom: 28,
        border: '1px solid rgba(59, 130, 246, 0.3)',
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.9) 0%, rgba(21, 30, 46, 0.9) 100%)'
      }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.35rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MessageSquare size={20} color="#3b82f6" />
            <span>Manager Review & Approval Action</span>
          </h2>
          <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
            Carefully review {report.userName}'s submission below. You can either approve the report or request changes with actionable guidance.
          </p>
        </div>

        <form onSubmit={handleReviewSubmit}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <label style={{
              flex: 1,
              padding: 16,
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${reviewAction === 'Approved' ? '#10b981' : 'var(--border-color)'}`,
              backgroundColor: reviewAction === 'Approved' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <input
                type="radio"
                name="reviewAction"
                checked={reviewAction === 'Approved'}
                onChange={() => setReviewAction('Approved')}
              />
              <div>
                <div style={{ fontWeight: 700, color: reviewAction === 'Approved' ? '#34d399' : '#fff', fontSize: '0.95rem' }}>
                  Approve Report
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Accept deliverables and finalize status as Approved.
                </div>
              </div>
            </label>

            <label style={{
              flex: 1,
              padding: 16,
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${reviewAction === 'ChangesRequested' ? '#f59e0b' : 'var(--border-color)'}`,
              backgroundColor: reviewAction === 'ChangesRequested' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <input
                type="radio"
                name="reviewAction"
                checked={reviewAction === 'ChangesRequested'}
                onChange={() => setReviewAction('ChangesRequested')}
              />
              <div>
                <div style={{ fontWeight: 700, color: reviewAction === 'ChangesRequested' ? '#fbbf24' : '#fff', fontSize: '0.95rem' }}>
                  Request Changes
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Send report back for correction with mandatory review comments.
                </div>
              </div>
            </label>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">
              <span>{reviewAction === 'ChangesRequested' ? 'Correction Instructions (Required)' : 'Optional Feedback / Notes'}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Targeting Version v{report.currentVersionNumber}
              </span>
            </label>
            <textarea
              required={reviewAction === 'ChangesRequested'}
              className="form-textarea"
              rows={3}
              placeholder={reviewAction === 'ChangesRequested' 
                ? 'Please specify what needs adjustment (e.g. clarify deliverable link, update hours breakdown, document blockers)...'
                : 'Great work this week! Deliverables look solid.'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`btn ${reviewAction === 'Approved' ? 'btn-success' : 'btn-warning'}`}
            >
              {submitting ? 'Submitting...' : reviewAction === 'Approved' ? 'Confirm Approval' : 'Send Back for Correction'}
            </button>
          </div>
        </form>
      </div>

      {/* Submitted Report Content Under Review */}
      <div className="card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>
              Report Content Under Review
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Submitted by <strong style={{ color: '#fff' }}>{report.userName}</strong> on {new Date(report.submittedAt || report.updatedAt).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{report.projectName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{report.projectCategoryTag}</div>
          </div>
        </div>

        {/* Tasks Table */}
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ color: '#fff', marginBottom: 10 }}>Task Deliverables</h4>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Priority</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Hours (Plan/Spent)</th>
                  <th>Output / Deliverable Produced</th>
                </tr>
              </thead>
              <tbody>
                {report.tasks.map((task, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{task.taskName}</td>
                    <td><span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                    <td>{task.actualPercentage}%</td>
                    <td><span style={{ fontWeight: 600 }}>{task.status}</span></td>
                    <td>{task.timePlannedHours}h / {task.timeSpentHours}h</td>
                    <td>{task.outputDeliverable || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blockers & Achievements */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div style={{ padding: 16, backgroundColor: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontWeight: 700, color: '#f87171', fontSize: '0.9rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flag size={14} />
              <span>Blockers / Challenges</span>
              {report.keyBlockerIndex >= 0 && <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>Key Issue</span>}
            </div>
            <div style={{ fontSize: '0.86rem', color: '#fca5a5', whiteSpace: 'pre-wrap' }}>
              {report.blockersNotes || 'None reported.'}
            </div>
          </div>

          <div style={{ padding: 16, backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={14} />
              <span>Achievements / Highlights</span>
              {report.keyAchievementIndex >= 0 && <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>Key Highlight</span>}
            </div>
            <div style={{ fontSize: '0.86rem', color: '#a7f3d0', whiteSpace: 'pre-wrap' }}>
              {report.achievementsNotes || 'None reported.'}
            </div>
          </div>
        </div>

        {/* Next Week */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: 6 }}>Tasks Planned for Next Week</h4>
          <div style={{ padding: 14, backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.86rem', whiteSpace: 'pre-wrap', color: '#d1d5db' }}>
            {report.tasksPlannedNextWeek || 'None specified.'}
          </div>
        </div>
      </div>
    </div>
  );
};
