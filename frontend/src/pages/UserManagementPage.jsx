import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Briefcase, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  Eye
} from 'lucide-react';

export const UserManagementPage = ({ onNavigate }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  // Add User Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState('TeamMember');
  const [jobTitle, setJobTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const list = await api.users.getAll();
      setUsers(list);
    } catch (err) {
      setError('Failed to fetch team users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.users.updateRole(userId, newRole);
      setNotice(`User role updated to ${newRole}.`);
      loadUsers();
    } catch (err) {
      setError('Failed to update role: ' + err.message);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.auth.register({
        fullName,
        email,
        password,
        role,
        jobTitle
      });
      setNotice(`User "${fullName}" created successfully.`);
      setShowAddModal(false);
      setFullName('');
      setEmail('');
      setJobTitle('');
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to add user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={26} color="#8b5cf6" />
            <span>Team & User Management</span>
          </h1>
          <p style={{ fontSize: '0.86rem', marginTop: 4 }}>
            Manage organization members, assign roles (Team Member vs Manager), and inspect activity.
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <UserPlus size={16} />
          <span>Add New Member</span>
        </button>
      </div>

      {notice && (
        <div className="alert-box alert-info" style={{ marginBottom: 20 }}>
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="alert-box alert-warning" style={{ marginBottom: 20 }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading organization users...
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email Address</th>
                <th>Job Title</th>
                <th>Role Assignment</th>
                <th>Assigned Projects</th>
                <th>Reports Filed</th>
                <th style={{ textAlign: 'right' }}>Profile</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                        alt={u.fullName}
                        style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{u.fullName}</div>
                        {u.id === currentUser?.id && (
                          <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 600 }}>
                            (You)
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.85rem' }}>{u.jobTitle || 'Engineer'}</span>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      style={{
                        width: 'auto',
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        borderColor: u.role === 'Manager' ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-color)'
                      }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="TeamMember">Team Member</option>
                      <option value="Manager">Manager / Admin</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {u.assignedProjects && u.assignedProjects.length > 0 ? (
                        u.assignedProjects.map(p => (
                          <span
                            key={p.id}
                            style={{
                              fontSize: '0.72rem',
                              padding: '2px 6px',
                              borderRadius: 4,
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              color: '#d1d5db'
                            }}
                          >
                            {p.name}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>None</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{u.totalReportsCount}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onNavigate('team-profile', u.id)}
                      className="btn btn-sm btn-ghost"
                      title="View Member Profile & Stats"
                    >
                      <Eye size={14} />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>Add New Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Jordan Hayes"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="jordan@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temporary Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  placeholder="Password123!"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="TeamMember">Team Member (Submit Reports)</option>
                  <option value="Manager">Manager / Admin (Full Review & Dashboard)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Backend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
