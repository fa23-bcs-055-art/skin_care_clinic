import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function UserModal({ isOpen, onClose, refresh, editData, roles }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    roleId: "",
    department: "",
    status: "active"
  });

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        email: editData.email || "",
        password: "",
        phone: editData.phone || "",
        roleId: editData.roleId?._id || editData.roleId || "",
        department: editData.department || "",
        status: editData.status || "active"
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        roleId: "",
        department: "",
        status: "active"
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || (!editData && !form.password) || !form.roleId) {
      return toast.error("Please fill all required fields");
    }

    setLoading(true);

    try {
      if (editData) {
        // For edit, don't send password if empty
        const updateData = { ...form };
        if (!updateData.password) delete updateData.password;
        
        await api.put(`/users/${editData._id}`, updateData);
        toast.success("User updated ✅");
      } else {
        await api.post("/users", form);
        toast.success("User created ✅");
      }
      
      refresh();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed ❌");
    } finally {
      setLoading(false);
    }
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
        <h2 style={styles.modalTitle}>
          {editData ? "✏️ Edit User" : "➕ Add New User"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              style={styles.input}
              required
              disabled={editData} // Email can't be changed
            />
          </div>

          {!editData && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                style={styles.input}
                required
                minLength="6"
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role *</label>
            <select
              value={form.roleId}
              onChange={(e) => setForm({...form, roleId: e.target.value})}
              style={styles.input}
              required
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role._id} value={role._id}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Department</label>
            <select
              value={form.department}
              onChange={(e) => setForm({...form, department: e.target.value})}
              style={styles.input}
            >
              <option value="">Select Department</option>
              <option value="Administration">Administration</option>
              <option value="Medical">Medical</option>
              <option value="Finance">Finance</option>
              <option value="Inventory">Inventory</option>
              <option value="Reception">Reception</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({...form, status: e.target.value})}
              style={styles.input}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, background: "#f44336" }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...styles.button, background: "#4CAF50" }}
              disabled={loading}
            >
              {loading ? "Saving..." : (editData ? "Update" : "Save")}
            </button>
          </div>
        </form>
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
    width: "500px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalTitle: {
    margin: "0 0 20px 0",
    color: "#333"
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
  }
};

export default UserModal;