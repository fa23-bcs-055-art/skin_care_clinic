import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import ImageUpload from "../../components/common/ImageUpload";

function BlogModal({ isOpen, onClose, refresh, editData }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    image: "",
    category: "General",
    tags: [],
    tagInput: "",
    isPublished: true
  });

  useEffect(() => {
    if (editData) {
      setForm({
        ...editData,
        tags: editData.tags || [],
        tagInput: ""
      });
    } else {
      setForm({
        title: "",
        content: "",
        excerpt: "",
        image: "",
        category: "General",
        tags: [],
        tagInput: "",
        isPublished: true
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.content) {
      return toast.error("Title and content are required");
    }

    console.log("📝 Submitting blog form:", {
      title: form.title,
      image: form.image,
      category: form.category,
      isPublished: form.isPublished
    });

    setLoading(true);

    try {
      if (editData) {
        await api.put(`/blogs/${editData._id}`, form);
        toast.success("Blog updated ✅");
      } else {
        await api.post("/blogs", form);
        toast.success("Blog created ✅");
      }
      
      refresh();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (form.tagInput && !form.tags.includes(form.tagInput)) {
      setForm({
        ...form,
        tags: [...form.tags, form.tagInput],
        tagInput: ""
      });
    }
  };

  const removeTag = (tagToRemove) => {
    setForm({
      ...form,
      tags: form.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>
          {editData ? "✏️ Edit Blog" : "📝 Write New Blog"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              style={styles.input}
              required
              placeholder="Enter blog title"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Excerpt</label>
            <input
              type="text"
              value={form.excerpt}
              onChange={(e) => setForm({...form, excerpt: e.target.value})}
              style={styles.input}
              placeholder="Short summary (max 200 chars)"
              maxLength="200"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({...form, category: e.target.value})}
              style={styles.input}
            >
              <option value="Skincare">Skincare</option>
              <option value="Treatments">Treatments</option>
              <option value="News">News</option>
              <option value="Tips">Tips</option>
              <option value="General">General</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Content *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({...form, content: e.target.value})}
              style={{ ...styles.input, minHeight: '200px' }}
              required
              placeholder="Write your blog content here..."
            />
          </div>

          {/* Image Upload - FIXED */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Featured Image</label>
            <ImageUpload 
              onUpload={(url) => setForm({...form, image: url})}
              currentImage={form.image}
              folder="blogs"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tags</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={form.tagInput}
                onChange={(e) => setForm({...form, tagInput: e.target.value})}
                style={{ ...styles.input, flex: 1 }}
                placeholder="Add tag and press +"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                style={styles.addTagButton}
              >
                +
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {form.tags.map(tag => (
                <span key={tag} style={styles.tag}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    style={styles.tagRemove}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <label style={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({...form, isPublished: e.target.checked})}
              />
              <span>Publish immediately</span>
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
              {loading ? "Saving..." : (editData ? "Update" : "Publish")}
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
    width: "700px",
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
  addTagButton: {
    padding: "10px 15px",
    background: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px"
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 10px",
    background: "#e3f2fd",
    borderRadius: "20px",
    fontSize: "13px",
    color: "#1976d2"
  },
  tagRemove: {
    marginLeft: "5px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#1976d2"
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

export default BlogModal;