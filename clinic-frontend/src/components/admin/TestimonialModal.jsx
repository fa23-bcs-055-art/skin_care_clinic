import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

function TestimonialModal({ isOpen, onClose, refresh, editData }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patientName: "",
    patientImage: "",
    text: "",
    rating: 5,
    isActive: true
  });

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm({
        patientName: "",
        patientImage: "",
        text: "",
        rating: 5,
        isActive: true
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.patientName || !form.text) {
      return toast.error("Patient name and testimonial text are required");
    }

    setLoading(true);

    try {
      if (editData) {
        await api.put(`/testimonials/${editData._id}`, form);
        toast.success("Testimonial updated ✅");
      } else {
        await api.post("/testimonials", form);
        toast.success("Testimonial added ✅");
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
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>
          {editData ? "✏️ Edit Testimonial" : "➕ Add New Testimonial"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Patient Name *</label>
            <input
              type="text"
              value={form.patientName}
              onChange={(e) => setForm({...form, patientName: e.target.value})}
              style={styles.input}
              required
              placeholder="e.g., John Doe"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Patient Image URL</label>
            <input
              type="text"
              value={form.patientImage}
              onChange={(e) => setForm({...form, patientImage: e.target.value})}
              style={styles.input}
              placeholder="https://example.com/patient.jpg"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Testimonial Text *</label>
            <textarea
              value={form.text}
              onChange={(e) => setForm({...form, text: e.target.value})}
              style={{ ...styles.input, minHeight: '120px' }}
              required
              placeholder="Write the testimonial here..."
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Rating</label>
            <select
              value={form.rating}
              onChange={(e) => setForm({...form, rating: parseInt(e.target.value)})}
              style={styles.input}
            >
              <option value={5}>5 Stars ⭐⭐⭐⭐⭐</option>
              <option value={4}>4 Stars ⭐⭐⭐⭐</option>
              <option value={3}>3 Stars ⭐⭐⭐</option>
              <option value={2}>2 Stars ⭐⭐</option>
              <option value={1}>1 Star ⭐</option>
            </select>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({...form, isActive: e.target.checked})}
              />
              <span>Approve and show on website</span>
            </label>
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
      </div>
    </div>
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
  checkboxGroup: {
    marginBottom: "20px"
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end"
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

export default TestimonialModal;