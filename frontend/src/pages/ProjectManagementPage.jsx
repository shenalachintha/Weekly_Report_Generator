import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  FileText, 
  Check, 
  X, 
  AlertCircle 
} from 'lucide-react';

export const ProjectManagementPage = () => {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryTag, setCategoryTag] = useState('Engineering');
  const [status, setStatus] = useState('Active');
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [projs, users] = await Promise.all([
        api.projects.getAll(),
        api.users.getAll()
      ]);
      setProjects(projs);
      setTeamMembers(users.filter(u => u.role === 'TeamMember'));
    } catch (err) {
      setError('Failed to load projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setCategoryTag('Client Project');
    setStatus('Active');
    setAssignedUserIds([]);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (proj) => {
    setEditingProject(proj);
    setName(proj.name);
    setDescription(proj.description || '');
    setCategoryTag(proj.categoryTag);
    setStatus(proj.status);
    setAssignedUserIds(proj.assignedMembers ? proj.assignedMembers.map(m => m.id) : []);
    setError('');
    setShowModal(true);
  };

  const toggleUserAssignment = (uid) => {
    setAssignedUserIds(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError('');
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        categoryTag: categoryTag.trim(),
        status,
        assignedUserIds
      };

      if (editingProject) {
        await api.projects.update(editingProject.id, payload);
        setNotice(`Project "${name}" updated successfully.`);
      } else {
        await api.projects.create(payload);
        setNotice(`Project "${name}" created successfully.`);
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (proj) => {
    if (!window.confirm(`Are you sure you want to delete or archive "${proj.name}"?`)) return;

    try {
      const res = await api.projects.delete(proj.id);
      if (res && res.message) {
        setNotice(res.message);
      } else {
        setNotice(`Project "${proj.name}" deleted.`);
      }
      loadData();
    } catch (err) {
      setError('Error deleting project: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderKanban size={26} color="#3b82f6" />
            <span>Projects & Category Management</span>
          </h1>
          <p style={{ fontSize: '0.86rem', marginTop: 4 }}>
            Create and organize work categories attached to weekly reports. Assign team members to track project workload.
          </p>
        </div>

        {isManager && (
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Add New Project</span>
          </button>
        )}
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

      {/* Projects Grid */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <FolderKanban size={40} color="var(--text-dim)" style={{ marginBottom: 12 }} />
          <h3 style={{ color: '#fff', marginBottom: 6 }}>No projects defined yet</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 16 }}>Create your first project category to allow report association.</p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {projects.map((proj) => (
            <div key={proj.id} className="card card-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    {proj.categoryTag}
                  </span>

                  <span className={`badge ${proj.status === 'Active' ? 'badge-approved' : 'badge-draft'}`}>
                    {proj.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: 8 }}>
                  {proj.name}
                </h3>

                <p style={{ fontSize: '0.84rem', lineHeight: 1.4, marginBottom: 16 }}>
                  {proj.description || 'No description provided.'}
                </p>

                {/* Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} color="#3b82f6" />
                    <strong style={{ color: '#fff' }}>{proj.reportsCount}</strong> reports
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} color="#10b981" />
                    <strong style={{ color: '#fff' }}>{proj.assignedMembersCount}</strong> members assigned
                  </span>
                </div>

                {/* Assigned Members avatars */}
                {proj.assignedMembers && proj.assignedMembers.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                    {proj.assignedMembers.slice(0, 5).map(m => (
                      <img
                        key={m.id}
                        src={m.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                        alt={m.fullName}
                        title={m.fullName}
                        style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--bg-card)' }}
                      />
                    ))}
                    {proj.assignedMembers.length > 5 && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        +{proj.assignedMembers.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {isManager && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 8 }}>
                  <button
                    onClick={() => openEditModal(proj)}
                    className="btn btn-sm btn-ghost"
                    title="Edit project"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => handleDelete(proj)}
                    className="btn btn-sm btn-ghost"
                    style={{ color: '#ef4444' }}
                    title="Delete or Archive project"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Mobile App v2.0"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Tag</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Client Project, Internal Tooling, R&D, Marketing"
                  value={categoryTag}
                  onChange={(e) => setCategoryTag(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Brief summary of the project scope and goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Assign Team Members (Section 5 requirement) */}
              <div className="form-group">
                <label className="form-label">Assign Team Members</label>
                <div style={{
                  maxHeight: 160,
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: 8,
                  backgroundColor: 'var(--bg-input)'
                }}>
                  {teamMembers.map((m) => {
                    const isSelected = assignedUserIds.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleUserAssignment(m.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                          marginBottom: 4
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img
                            src={m.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
                            alt={m.fullName}
                            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <span style={{ fontSize: '0.85rem', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                            {m.fullName} ({m.jobTitle || 'Engineer'})
                          </span>
                        </div>
                        {isSelected && <Check size={14} color="#60a5fa" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
