import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Flag, 
  TrendingUp, 
  Filter, 
  Eye, 
  UserCheck, 
  Calendar, 
  FolderKanban, 
  Activity, 
  RefreshCw,
  Sparkles,
  Columns
} from 'lucide-react';

export const TeamDashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [sumRes, chartRes, repRes, projRes, usersRes] = await Promise.allSettled([
        api.dashboard.getSummary(),
        api.dashboard.getCharts(),
        api.reports.getAll({ pageSize: 30 }),
        api.projects.getAll(),
        api.users.getAll()
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (chartRes.status === 'fulfilled') setCharts(chartRes.value);
      if (repRes.status === 'fulfilled') setReports(repRes.value.items || []);
      if (projRes.status === 'fulfilled') setProjects(projRes.value || []);
      if (usersRes.status === 'fulfilled') setTeamMembers((usersRes.value || []).filter(u => u.role === 'TeamMember'));

      const errors = [sumRes, chartRes, repRes, projRes, usersRes]
        .filter(r => r.status === 'rejected')
        .map(r => r.reason?.message || 'Request failed');

      if (errors.length > 0) {
        setError('Notice: ' + errors.join(', '));
      }
    } catch (err) {
      setError('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Filtered reports list
  const filteredReports = reports.filter(r => {
    if (selectedUser && r.userId.toString() !== selectedUser) return false;
    if (selectedProject && r.projectId.toString() !== selectedProject) return false;
    if (selectedStatus && selectedStatus !== 'All' && r.status !== selectedStatus) return false;
    return true;
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading team metrics, visual charts and weekly reports...
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>Team Performance & Reporting Dashboard</h1>
          <p style={{ fontSize: '0.86rem', marginTop: 4 }}>
            Consolidated overview of weekly submissions, review cycles, blocker hotspots, and engineering velocity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onNavigate('side-by-side')}
            className="btn btn-secondary btn-sm"
          >
            <Columns size={16} />
            <span>Side-by-Side Matrix</span>
          </button>

          <button
            onClick={loadDashboardData}
            className="btn btn-ghost btn-sm"
            title="Refresh dashboard data"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-box alert-warning" style={{ marginBottom: 20 }}>
          <span>{error}</span>
        </div>
      )}

      {/* Section 6 Summary Metrics Cards */}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value">{summary.totalSubmittedThisWeek} / {summary.totalTeamMembers}</div>
              <div className="stat-label">Reports Submitted This Week</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-value">{summary.complianceRatePercentage}%</div>
              <div className="stat-label">Submission Compliance Rate</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="stat-value">{summary.needsCorrectionCount}</div>
              <div className="stat-label">In Needs Correction Status</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <Flag size={24} />
            </div>
            <div>
              <div className="stat-value">{summary.totalOpenBlockersCount}</div>
              <div className="stat-label">Open Team Blockers</div>
            </div>
          </div>
        </div>
      )}

      {/* Section 6 Charts Grid */}
      {charts && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24, marginBottom: 30 }}>
          {/* Chart 1: Tasks Completed Trend Over Time */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="#3b82f6" />
              <span>Tasks Velocity Trend (Weekly)</span>
            </h3>
            <p style={{ fontSize: '0.78rem', marginBottom: 16 }}>Completed vs in-progress tasks across sprints</p>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={charts.tasksTrend}>
                  <XAxis dataKey="weekLabel" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f293d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="tasksCompleted" name="Completed Tasks" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="tasksInProgress" name="In Progress" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Report Status Distribution */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color="#8b5cf6" />
              <span>Report Review Cycle Status Breakdown</span>
            </h3>
            <p style={{ fontSize: '0.78rem', marginBottom: 16 }}>Current statuses of team weekly reports</p>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={charts.statusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {charts.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f293d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Workload / Task Distribution by Project */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FolderKanban size={18} color="#06b6d4" />
              <span>Workload Distribution by Project</span>
            </h3>
            <p style={{ fontSize: '0.78rem', marginBottom: 16 }}>Hours allocated across client and internal projects</p>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={charts.projectDistribution} layout="vertical">
                  <XAxis type="number" stroke="#6b7280" fontSize={12} unit="h" />
                  <YAxis type="category" dataKey="projectName" stroke="#6b7280" fontSize={11} width={130} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f293d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="hoursSpent" name="Total Hours Logged" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Time Spent by Task Type Team-Wide */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="#f59e0b" />
              <span>Time Spent by Task Type (Team-Wide)</span>
            </h3>
            <p style={{ fontSize: '0.78rem', marginBottom: 16 }}>Development vs Testing vs Meetings vs Documentation</p>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={charts.hoursByType}>
                  <XAxis dataKey="taskType" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} unit="h" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f293d', borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="hours" name="Hours" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Feed & Reports Review Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24 }}>
        {/* Reports Review Table with Filters */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Team Weekly Reports</h3>

            {/* Filter controls */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">All Members</option>
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 10px', fontSize: '0.8rem' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted (Needs Review)</option>
                <option value="NeedsCorrection">Needs Correction</option>
                <option value="Approved">Approved</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Week</th>
                  <th>Project</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                    <td>
                      <span style={{ fontSize: '0.82rem' }}>
                        {new Date(report.weekStartDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem' }}>{report.projectName}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#60a5fa' }}>{report.totalHoursSpent}h</span>
                    </td>
                    <td>
                      <span className={`badge badge-${report.status.toLowerCase().replace(' ', '-')}`}>
                        {report.status === 'NeedsCorrection' ? 'Needs Correction' : report.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => onNavigate('report-detail', report.id)}
                          className="btn btn-sm btn-ghost"
                          title="View report"
                        >
                          <Eye size={14} />
                        </button>

                        {report.status === 'Submitted' && (
                          <button
                            onClick={() => onNavigate('review', report.id)}
                            className="btn btn-sm btn-warning"
                            title="Take review action"
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
        </div>

        {/* Recent Activity / Audit Feed */}
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={16} color="#8b5cf6" />
            <span>Recent Activity Feed</span>
          </h3>

          {summary && summary.recentActivity && summary.recentActivity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {summary.recentActivity.map((act, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>{act.userName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: 1.35 }}>
                    {act.message}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem' }}>No recent activity logged.</p>
          )}
        </div>
      </div>
    </div>
  );
};
