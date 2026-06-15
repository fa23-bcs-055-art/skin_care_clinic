import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function RoleModal({ isOpen, onClose, refresh }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState(null); // 'add', 'edit', null
  const [editData, setEditData] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [form, setForm] = useState({
    roleName: "",
    description: "",
    level: 0,
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (error) {
      toast.error("Failed to fetch roles");
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await api.get('/roles/permissions');
      setPermissions(res.data);
    } catch (error) {
      console.error("Failed to fetch permissions");
    }
  };

  const handleEdit = (role) => {
    setEditData(role);
    setForm({
      roleName: role.roleName,
      description: role.description || "",
      level: role.level || 0,
      permissions: role.permissions || []
    });
    setModalMode('edit');
  };

  const handleDelete = async (roleId, roleName) => {
    if (roleName === 'SuperAdmin') {
      toast.error("Cannot delete SuperAdmin role");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${roleName} role?`)) return;
    
    try {
      await api.delete(`/roles/${roleId}`);
      toast.success("Role deleted ✅");
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete role");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.roleName) {
      return toast.error("Role name is required");
    }

    setLoading(true);

    try {
      if (modalMode === 'edit') {
        await api.put(`/roles/${editData._id}`, form);
        toast.success("Role updated ✅");
      } else {
        await api.post("/roles", form);
        toast.success("Role created ✅");
      }
      
      fetchRoles();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      roleName: "",
      description: "",
      level: 0,
      permissions: []
    });
    setEditData(null);
    setModalMode(null);
  };

  const togglePermission = (permission) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.modalOverlay}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={styles.modalContent}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={styles.modalTitle}>⚙️ Role Management</h2>

        {/* Add Role Button */}
        {!modalMode && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setModalMode('add')}
            style={styles.addButton}
          >
            + Create New Role
          </motion.button>
        )}

        {/* Role Form */}
        {modalMode && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3>{modalMode === 'edit' ? 'Edit Role' : 'Create New Role'}</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Role Name *</label>
              <input
                type="text"
                value={form.roleName}
                onChange={(e) => setForm({...form, roleName: e.target.value})}
                style={styles.input}
                required
                disabled={modalMode === 'edit' && form.roleName === 'SuperAdmin'}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Level (higher = more priority)</label>
              <input
                type="number"
                value={form.level}
                onChange={(e) => setForm({...form, level: parseInt(e.target.value)})}
                style={styles.input}
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Permissions</label>
              <div style={styles.permissionsGrid}>
                {permissions.map(perm => (
                  <label key={perm} style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      disabled={form.roleName === 'SuperAdmin'}
                    />
                    <span>{perm.replace(/_/g, ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={resetForm}
                style={{ ...styles.button, background: "#f44336" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ ...styles.button, background: "#4CAF50" }}
                disabled={loading}
              >
                {loading ? "Saving..." : (modalMode === 'edit' ? "Update" : "Create")}
              </button>
            </div>
          </form>
        )}

        {/* Roles List */}
        {!modalMode && (
          <div style={styles.rolesList}>
            <h3>Existing Roles</h3>
            {roles.map(role => (
              <motion.div
                key={role._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.roleItem}
              >
                <div style={styles.roleInfo}>
                  <strong>{role.roleName}</strong>
                  {role.description && (
                    <small style={{ color: '#666', display: 'block' }}>
                      {role.description}
                    </small>
                  )}
                  <small style={{ color: '#999' }}>
                    Level: {role.level} | Permissions: {role.permissions?.length || 0}
                  </small>
                </div>
                {role.roleName !== 'SuperAdmin' && (
                  <div style={styles.roleActions}>
                    <button
                      onClick={() => handleEdit(role)}
                      style={{ ...styles.smallButton, background: '#2196F3' }}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(role._id, role.roleName)}
                      style={{ ...styles.smallButton, background: '#f44336' }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    width: "600px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalTitle: {
    margin: "0 0 20px 0",
    color: "#333"
  },
  addButton: {
    width: "100%",
    padding: "12px",
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "20px"
  },
  form: {
    marginBottom: "30px",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "8px"
  },
  formGroup: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  permissionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "10px",
    maxHeight: "300px",
    overflowY: "auto",
    padding: "10px",
    background: "white",
    borderRadius: "6px",
    border: "1px solid #ddd"
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
    fontSize: "13px"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "20px"
  },
  button: {
    padding: "10px 20px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  rolesList: {
    marginTop: "20px"
  },
  roleItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #eee"
  },
  roleInfo: {
    flex: 1
  },
  roleActions: {
    display: "flex",
    gap: "5px"
  },
  smallButton: {
    width: "30px",
    height: "30px",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};

export default RoleModal;