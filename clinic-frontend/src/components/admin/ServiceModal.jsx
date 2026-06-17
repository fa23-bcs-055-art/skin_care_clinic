import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import ImageUpload from "../../components/common/ImageUpload";

function ServiceModal({ isOpen, onClose, refresh, editData }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    discountedPrice: "",
    duration: "",
    icon: "✨",
    image: "",
    category: "Treatment",
    isActive: true,
    isPopular: false
  });

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm({
        name: "",
        description: "",
        shortDescription: "",
        price: "",
        discountedPrice: "",
        duration: "",
        icon: "✨",
        image: "",
        category: "Treatment",
        isActive: true,
        isPopular: false
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.description || !form.price || !form.duration) {
      return toast.error("Name, description, price and duration are required");
    }

    console.log("💆 Submitting service form:", {
      name: form.name,
      image: form.image,
      category: form.category,
      price: form.price
    });

    setLoading(true);

    try {
      if (editData) {
        await api.put(`/services/admin/${editData._id}`, form);
        toast.success("Service updated ✅");
      } else {
        await api.post("/services/admin", form);
        toast.success("Service added ✅");
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
          {editData ? "✏️ Edit Service" : "➕ Add New Service"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Service Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                style={styles.input}
              >
                <option value="Facial">Facial</option>
                <option value="Laser">Laser</option>
                <option value="Treatment">Treatment</option>
                <option value="Consultation">Consultation</option>
                <option value="Surgery">Surgery</option>
                <option value="Wellness">Wellness</option>
              </select>
            </div>

            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.label}>Short Description</label>
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => setForm({...form, shortDescription: e.target.value})}
                style={styles.input}
                placeholder="Brief description (optional)"
                maxLength="150"
              />
            </div>

            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.label}>Full Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                style={{ ...styles.input, minHeight: "100px" }}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Price (₨) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({...form, price: e.target.value})}
                style={styles.input}
                required
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Discounted Price</label>
              <input
                type="number"
                value={form.discountedPrice}
                onChange={(e) => setForm({...form, discountedPrice: e.target.value})}
                style={styles.input}
                min="0"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Duration *</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({...form, duration: e.target.value})}
                style={styles.input}
                required
                placeholder="e.g., 30 mins, 1 hour"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Icon</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm({...form, icon: e.target.value})}
                style={styles.input}
                placeholder="✨"
              />
            </div>

            {/* Image Upload - FIXED */}
            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.label}>Service Image</label>
              <ImageUpload 
                onUpload={(url) => setForm({...form, image: url})}
                currentImage={form.image}
                folder="services"
              />
            </div>

            <div style={styles.checkboxGroup}>
              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({...form, isActive: e.target.checked})}
                />
                <span>Active</span>
              </label>

              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.isPopular}
                  onChange={(e) => setForm({...form, isPopular: e.target.checked})}
                />
                <span>Popular</span>
              </label>
            </div>
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
    width: "600px",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalTitle: {
    margin: "0 0 20px 0",
    color: "#333"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "15px"
  },
  formGroup: {
    marginBottom: "10px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  checkboxGroup: {
    gridColumn: "span 2",
    display: "flex",
    gap: "20px",
    marginTop: "10px"
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
    justifyContent: "flex-end",
    marginTop: "20px"
  },
  button: {
    padding: "10px 20px",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px"
  }
};

export default ServiceModal;