import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  FolderKanban, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Flag, 
  Award, 
  FileText, 
  ArrowLeft,
  ExternalLink,
  Info
} from 'lucide-react';

export const PersonalReportPage = ({ reportId, onNavigate }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fixed Report Fields (Section 2)
  const [currentStatus, setCurrentStatus] = useState('Draft');
  const [latestManagerComment, setLatestManagerComment] = useState(null);
  const [versionNumber, setVersionNumber] = useState(1);

  // 1. Week / date range (defaulting to current Monday - Sunday)
  const getMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return mon.toISOString().split('T')[0];
  };

  const getSunday = (monStr) => {
    const mon = new Date(monStr);
    const sun = new Date(mon.setDate(mon.getDate() + 6));
    return sun.toISOString().split('T')[0];
  };

  const [weekStartDate, setWeekStartDate] = useState(getMonday());
  const [weekEndDate, setWeekEndDate] = useState(getSunday(getMonday()));

  // 2. Project or category tag
  const [projectId, setProjectId] = useState('');

  // 3. Tasks completed table
  const [tasks, setTasks] = useState([
    {
      taskName: '',
      priority: 'Medium',
      plannedPercentage: 100,
      actualPercentage: 0,
      status: 'InProgress',
      timePlannedHours: 8,
      timeSpentHours: 0,
      outputDeliverable: ''
    }
  ]);

  // 4. Tasks planned for next week
  const [tasksPlannedNextWeek, setTasksPlannedNextWeek] = useState('');

  // 5. Blockers / challenges & flagged key issue
  const [blockersNotes, setBlockersNotes] = useState('');
  const [isKeyBlockerFlagged, setIsKeyBlockerFlagged] = useState(false);

  // 6. Achievements / highlights & flagged key achievement
  const [achievementsNotes, setAchievementsNotes] = useState('');
  const [isKeyAchievementFlagged, setIsKeyAchievementFlagged] = useState(false);

  // 7. Hours worked broken down by task type
  const [hoursBreakdown, setHoursBreakdown] = useState([
    { taskType: 'Development', hoursSpent: 0 },
    { taskType: 'Testing', hoursSpent: 0 },
    { taskType: 'Meetings', hoursSpent: 0 },
    { taskType: 'Documentation', hoursSpent: 0 },
    { taskType: 'CodeReview', hoursSpent: 0 },
    { taskType: 'Design', hoursSpent: 0 }
  ]);

  // 8. Optional notes or links
  const [optionalNotesOrLinks, setOptionalNotesOrLinks] = useState('');

  // Load project list & report details (if editing)
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const projs = await api.projects.getAll();
        setProjects(projs);

        if (projs.length > 0 && !projectId) {
          setProjectId(projs[0].id.toString());
        }

        if (reportId) {
          const rep = await api.reports.getById(reportId);
          setCurrentStatus(rep.status);
          setVersionNumber(rep.currentVersionNumber);
          setProjectId(rep.projectId.toString());
          setWeekStartDate(rep.weekStartDate.split('T')[0]);
          setWeekEndDate(rep.weekEndDate.split('T')[0]);
          setTasksPlannedNextWeek(rep.tasksPlannedNextWeek || '');
          setBlockersNotes(rep.blockersNotes || '');
          setIsKeyBlockerFlagged(rep.keyBlockerIndex >= 0);
          setAchievementsNotes(rep.achievementsNotes || '');
          setIsKeyAchievementFlagged(rep.keyAchievementIndex >= 0);
          setOptionalNotesOrLinks(rep.optionalNotesOrLinks || '');

          if (rep.tasks && rep.tasks.length > 0) {
            setTasks(rep.tasks.map(t => ({
              taskName: t.taskName,
              priority: t.priority,
              plannedPercentage: t.plannedPercentage,
              actualPercentage: t.actualPercentage,
              status: t.status,
              timePlannedHours: t.timePlannedHours,
              timeSpentHours: t.timeSpentHours,
              outputDeliverable: t.outputDeliverable || ''
            })));
          }

          if (rep.hoursBreakdown && rep.hoursBreakdown.length > 0) {
            const types = ['Development', 'Testing', 'Meetings', 'Documentation', 'CodeReview', 'Design'];
            const mapped = types.map(type => {
              const found = rep.hoursBreakdown.find(h => h.taskType.toLowerCase() === type.toLowerCase());
              return { taskType: type, hoursSpent: found ? found.hoursSpent : 0 };
            });
            setHoursBreakdown(mapped);
          }

          // Check if latest comment was ChangesRequested
          if (rep.comments && rep.comments.length > 0) {
            const latest = rep.comments[0];
            if (latest.action === 'ChangesRequested') {
              setLatestManagerComment(latest);
            }
          }
        }
      } catch (err) {
        setError('Failed to load report data: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [reportId]);

  // Handle week date changes
  const handleStartDateChange = (val) => {
    setWeekStartDate(val);
    setWeekEndDate(getSunday(val));
  };

  // Task list manipulations
  const handleAddTask = () => {
    setTasks(prev => [
      ...prev,
      {
        taskName: '',
        priority: 'Medium',
        plannedPercentage: 100,
        actualPercentage: 0,
        status: 'InProgress',
        timePlannedHours: 4,
        timeSpentHours: 0,
        outputDeliverable: ''
      }
    ]);
  };

  const handleRemoveTask = (idx) => {
    if (tasks.length <= 1) {
      alert('Report must have at least one task item.');
      return;
    }
    setTasks(tasks.filter((_, i) => i !== idx));
  };

  const handleTaskChange = (idx, field, val) => {
    setTasks(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  // Hours breakdown manipulation
  const handleHourChange = (taskType, hours) => {
    setHoursBreakdown(prev =>
      prev.map(h => h.taskType === taskType ? { ...h, hoursSpent: parseFloat(hours) || 0 } : h)
    );
  };

  const totalHoursLogged = hoursBreakdown.reduce((sum, h) => sum + (h.hoursSpent || 0), 0);

  // Form submission: Draft or Submit
  const handleSave = async (shouldSubmit = false) => {
    setError('');
    setSuccessMessage('');

    // Client-side validation
    if (!projectId) {
      setError('Please select a project category.');
      return;
    }

    if (tasks.some(t => !t.taskName.trim())) {
      setError('All tasks must have a descriptive task name.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        projectId: parseInt(projectId),
        weekStartDate: new Date(weekStartDate).toISOString(),
        weekEndDate: new Date(weekEndDate).toISOString(),
        tasksPlannedNextWeek,
        blockersNotes,
        keyBlockerIndex: isKeyBlockerFlagged ? 0 : -1,
        achievementsNotes,
        keyAchievementIndex: isKeyAchievementFlagged ? 0 : -1,
        optionalNotesOrLinks,
        tasks: tasks.map(t => ({
          ...t,
          plannedPercentage: parseInt(t.plannedPercentage) || 0,
          actualPercentage: parseInt(t.actualPercentage) || 0,
          timePlannedHours: parseFloat(t.timePlannedHours) || 0,
          timeSpentHours: parseFloat(t.timeSpentHours) || 0,
        })),
        hoursBreakdown: hoursBreakdown.filter(h => h.hoursSpent > 0)
      };

      let savedReport;
      if (reportId) {
        savedReport = await api.reports.updateDraft(reportId, payload);
      } else {
        savedReport = await api.reports.createDraft(payload);
      }

      if (shouldSubmit) {
        const submitted = await api.reports.submit(savedReport.id);
        setSuccessMessage('Weekly report submitted successfully to your manager for review!');
        setTimeout(() => {
          onNavigate('history');
        }, 1200);
      } else {
        setSuccessMessage('Report draft saved successfully!');
        if (!reportId) {
          onNavigate('edit-report', savedReport.id);
        }
      }
    } catch (err) {
      setError(err.message || 'Error saving report.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading report template and project data...
      </div>
    );
  }

  const isReadOnly = currentStatus === 'Submitted' || currentStatus === 'Approved';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1080, margin: '0 auto' }}>
      {/* Top action header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          onClick={() => onNavigate('history')}
          className="btn btn-ghost btn-sm"
          style={{ gap: 6 }}
        >
          <ArrowLeft size={16} />
          <span>Back to Report History</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`badge badge-${currentStatus.toLowerCase().replace(' ', '-')}`}>
            Status: {currentStatus === 'NeedsCorrection' ? 'Needs Correction' : currentStatus}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Version v{versionNumber}
          </span>
        </div>
      </div>

      {/* Prominent Manager Correction Notice (Section 3 Requirement) */}
      {currentStatus === 'NeedsCorrection' && latestManagerComment && (
        <div className="alert-box alert-warning" style={{ borderLeft: '4px solid #f59e0b', marginBottom: 24 }}>
          <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fbbf24', marginBottom: 4 }}>
              Action Required: Manager Requested Corrections
            </div>
            <div style={{ fontSize: '0.88rem', color: '#fef3c7', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
              "{latestManagerComment.commentText}"
            </div>
            <div style={{ fontSize: '0.75rem', color: '#fcd34d', marginTop: 6 }}>
              Reviewed by {latestManagerComment.authorName} on {new Date(latestManagerComment.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-box alert-warning" style={{ marginBottom: 20 }}>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="alert-box alert-success" style={{ marginBottom: 20 }}>
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Fixed Template Card */}
      <div className="card" style={{ padding: 32 }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 16, marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', color: '#fff' }}>
            {reportId ? `Weekly Report - Week of ${weekStartDate}` : 'New Weekly Work Report'}
          </h1>
          <p style={{ fontSize: '0.86rem', marginTop: 4 }}>
            Fixed standardized report structure. Submit your accomplishments, blockers, and planned deliverables for team transparency.
          </p>
        </div>

        {/* Section 1 & 2: Week Date Range and Project Tag */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} color="#3b82f6" />
                1. Week Date Range (Monday – Sunday)
              </span>
            </label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="date"
                className="form-input"
                disabled={isReadOnly}
                value={weekStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
              <span style={{ color: 'var(--text-dim)' }}>to</span>
              <input
                type="date"
                className="form-input"
                disabled
                value={weekEndDate}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <FolderKanban size={16} color="#8b5cf6" />
                2. Project or Category Tag
              </span>
            </label>
            <select
              className="form-select"
              disabled={isReadOnly}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.categoryTag})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Tasks Completed Table */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <label className="form-label" style={{ fontSize: '0.95rem', color: '#fff' }}>
              3. Tasks Completed / In-Progress Table
            </label>
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleAddTask}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={14} />
                <span>Add Task Row</span>
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>Task Name</th>
                  <th style={{ width: 110 }}>Priority</th>
                  <th style={{ width: 130 }}>Progress %</th>
                  <th style={{ width: 130 }}>Status</th>
                  <th style={{ width: 150 }}>Hours (Plan / Spent)</th>
                  <th style={{ minWidth: 240 }}>Output / Deliverable Produced</th>
                  {!isReadOnly && <th style={{ width: 50 }}></th>}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Refactor Checkout UI"
                        disabled={isReadOnly}
                        value={task.taskName}
                        onChange={(e) => handleTaskChange(idx, 'taskName', e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select"
                        disabled={isReadOnly}
                        value={task.priority}
                        onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                        style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className="form-input"
                          disabled={isReadOnly}
                          value={task.actualPercentage}
                          onChange={(e) => handleTaskChange(idx, 'actualPercentage', e.target.value)}
                          style={{ width: 65, fontSize: '0.82rem', padding: '6px 8px' }}
                        />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>%</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        disabled={isReadOnly}
                        value={task.status}
                        onChange={(e) => handleTaskChange(idx, 'status', e.target.value)}
                        style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                      >
                        <option value="Completed">Completed</option>
                        <option value="InProgress">In Progress</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Deferred">Deferred</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="Plan"
                          className="form-input"
                          disabled={isReadOnly}
                          value={task.timePlannedHours}
                          onChange={(e) => handleTaskChange(idx, 'timePlannedHours', e.target.value)}
                          style={{ width: 55, fontSize: '0.8rem', padding: '6px 6px' }}
                          title="Planned Hours"
                        />
                        <span style={{ color: 'var(--text-dim)' }}>/</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          placeholder="Spent"
                          className="form-input"
                          disabled={isReadOnly}
                          value={task.timeSpentHours}
                          onChange={(e) => handleTaskChange(idx, 'timeSpentHours', e.target.value)}
                          style={{ width: 55, fontSize: '0.8rem', padding: '6px 6px' }}
                          title="Time Spent Hours"
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>h</span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Link, PR, or artifact description"
                        disabled={isReadOnly}
                        value={task.outputDeliverable}
                        onChange={(e) => handleTaskChange(idx, 'outputDeliverable', e.target.value)}
                        style={{ fontSize: '0.85rem', padding: '6px 10px' }}
                      />
                    </td>
                    {!isReadOnly && (
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#ef4444', padding: 6 }}
                          title="Remove task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Tasks Planned for Next Week */}
        <div className="form-group" style={{ marginBottom: 28 }}>
          <label className="form-label" style={{ fontSize: '0.95rem', color: '#fff' }}>
            4. Tasks Planned for Next Week
          </label>
          <textarea
            className="form-textarea"
            disabled={isReadOnly}
            rows={3}
            placeholder="- Plan next sprint deliverables&#10;- Integrate mock payment webhooks&#10;- Conduct cross-browser testing"
            value={tasksPlannedNextWeek}
            onChange={(e) => setTasksPlannedNextWeek(e.target.value)}
          />
        </div>

        {/* Section 5 & 6: Blockers & Achievements with Key Flagging */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          {/* Blockers */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label className="form-label" style={{ fontSize: '0.9rem', color: '#fff' }}>
                5. Blockers & Challenges
              </label>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setIsKeyBlockerFlagged(!isKeyBlockerFlagged)}
                  className={`flag-btn ${isKeyBlockerFlagged ? 'flagged-issue' : ''}`}
                  title="Flag one blocker as the key issue for the week"
                >
                  <Flag size={12} />
                  <span>{isKeyBlockerFlagged ? 'Key Issue Flagged' : 'Flag as Key Issue'}</span>
                </button>
              )}
            </div>
            <textarea
              className="form-textarea"
              disabled={isReadOnly}
              rows={3}
              placeholder="e.g. Awaiting AWS regional VPC quota increase; Stripe API sandbox latency..."
              value={blockersNotes}
              onChange={(e) => setBlockersNotes(e.target.value)}
            />
          </div>

          {/* Achievements */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label className="form-label" style={{ fontSize: '0.9rem', color: '#fff' }}>
                6. Achievements & Highlights
              </label>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setIsKeyAchievementFlagged(!isKeyAchievementFlagged)}
                  className={`flag-btn ${isKeyAchievementFlagged ? 'flagged-achievement' : ''}`}
                  title="Flag one achievement as the key accomplishment for the week"
                >
                  <Award size={12} />
                  <span>{isKeyAchievementFlagged ? 'Key Highlight Flagged' : 'Flag as Key Highlight'}</span>
                </button>
              )}
            </div>
            <textarea
              className="form-textarea"
              disabled={isReadOnly}
              rows={3}
              placeholder="e.g. Zero-downtime K8s migration completed; 35% bundle reduction achieved..."
              value={achievementsNotes}
              onChange={(e) => setAchievementsNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Section 7: Hours Worked Breakdown by Task Type */}
        <div style={{ marginBottom: 28, padding: 20, backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <label className="form-label" style={{ fontSize: '0.9rem', color: '#fff' }}>
              <Clock size={16} color="#06b6d4" style={{ marginRight: 6 }} />
              7. Hours Worked Breakdown by Task Type
            </label>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>
              Total Logged: {totalHoursLogged} hrs
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            {hoursBreakdown.map((h) => (
              <div key={h.taskType} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{h.taskType}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    className="form-input"
                    disabled={isReadOnly}
                    value={h.hoursSpent}
                    onChange={(e) => handleHourChange(h.taskType, e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '6px 8px' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>h</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Optional Notes or Links */}
        <div className="form-group" style={{ marginBottom: 32 }}>
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ExternalLink size={16} color="#a855f7" />
              8. Optional Notes, PRs or Documentation Links
            </span>
          </label>
          <input
            type="text"
            className="form-input"
            disabled={isReadOnly}
            placeholder="https://github.com/... or Figma links, design notes, staging URLs"
            value={optionalNotesOrLinks}
            onChange={(e) => setOptionalNotesOrLinks(e.target.value)}
          />
        </div>

        {/* Action Controls */}
        {!isReadOnly && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            borderTop: '1px solid var(--border-color)',
            paddingTop: 20
          }}>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              className="btn btn-secondary"
            >
              <Save size={16} />
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(true)}
              className="btn btn-primary"
            >
              <Send size={16} />
              <span>{reportId ? 'Submit for Review' : 'Submit Weekly Report'}</span>
            </button>
          </div>
        )}

        {isReadOnly && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-color)',
            paddingTop: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <Info size={16} />
              <span>This report has been submitted and is currently locked for review.</span>
            </div>
            <button
              onClick={() => onNavigate('report-detail', reportId)}
              className="btn btn-secondary btn-sm"
            >
              <FileText size={16} />
              <span>Open Full Document View</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
