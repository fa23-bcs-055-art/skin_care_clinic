import { useState, useEffect } from "react";
import api, { getImageUrl } from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ImageUpload from "../../components/common/ImageUpload";

function GalleryManager() {
  const [images, setImages] = useState([]);
  const [beforeAfter, setBeforeAfter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [baModalOpen, setBAModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "Clinic",
    isActive: true,
    isFeatured: false
  });

  const [baForm, setBAForm] = useState({
    patientId: "",
    patientName: "",
    treatmentId: "",
    treatmentName: "",
    beforeImage: "",
    afterImage: "",
    description: "",
    isPublished: true
  });

  const [patients, setPatients] = useState([]);
  const [treatments, setTreatments] = useState([]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gallery');
      setImages(res.data);
    } catch (error) {
      toast.error("Failed to fetch gallery");
    } finally {
      setLoading(false);
    }
  };

  const fetchBeforeAfter = async () => {
    try {
      const res = await api.get('/gallery/before-after');
      setBeforeAfter(res.data);
    } catch (error) {
      console.error("Failed to fetch before/after");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients');
      setPatients(res.data);
    } catch (error) {
      console.error("Failed to fetch patients");
    }
  };

  const fetchTreatments = async () => {
    try {
      const res = await api.get('/treatments');
      setTreatments(res.data);
    } catch (error) {
      console.error("Failed to fetch treatments");
    }
  };

  useEffect(() => {
    fetchGallery();
    fetchBeforeAfter();
    fetchPatients();
    fetchTreatments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.image) {
      return toast.error("Title and image are required");
    }

    try {
      if (editData) {
        await api.put(`/gallery/${editData._id}`, form);
        toast.success("Image updated ✅");
      } else {
        await api.post("/gallery", form);
        toast.success("Image added ✅");
      }
      
      fetchGallery();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed ❌");
    }
  };

  const handleBASubmit = async (e) => {
    e.preventDefault();

    console.log('🐾 handleBASubmit baForm:', baForm);
    
    if (!baForm.patientId || !baForm.treatmentId || !baForm.beforeImage || !baForm.afterImage) {
      return toast.error("All fields are required");
    }

    try {
      await api.post("/gallery/before-after", baForm);
      toast.success("Before/After images added ✅");
      fetchBeforeAfter();
      setBAModalOpen(false);
      resetBAForm();
    } catch (error) {
      console.error('❌ handleBASubmit error:', error);
      toast.error(error.response?.data?.error || "Operation failed ❌");
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    
    try {
      await api.delete(`/gallery/${id}`);
      toast.success("Image deleted ✅");
      fetchGallery();
    } catch (error) {
      toast.error("Failed to delete image");
    }
  };

  const deleteBeforeAfter = async (id) => {
    if (!window.confirm("Delete this before/after pair?")) return;
    
    try {
      await api.delete(`/gallery/before-after/${id}`);
      toast.success("Before/After deleted ✅");
      fetchBeforeAfter();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      image: "",
      category: "Clinic",
      isActive: true,
      isFeatured: false
    });
    setEditData(null);
  };

  const resetBAForm = () => {
    setBAForm({
      patientId: "",
      patientName: "",
      treatmentId: "",
      treatmentName: "",
      beforeImage: "",
      afterImage: "",
      description: "",
      isPublished: true
    });
  };

  const filteredImages = images.filter(img => {
    if (filter === 'active') return img.isActive;
    if (filter === 'inactive') return !img.isActive;
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.header}>
        <h1>🖼️ Gallery Management</h1>
        <div style={styles.headerActions}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Images</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBAModalOpen(true)}
            style={{ ...styles.addButton, background: "#9C27B0" }}
          >
            + Add Before/After
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            style={styles.addButton}
          >
            + Add Image
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Images</h3>
          <p style={styles.statValue}>{images.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Before/After</h3>
          <p style={styles.statValue}>{beforeAfter.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Active</h3>
          <p style={{ ...styles.statValue, color: '#4CAF50' }}>
            {images.filter(i => i.isActive).length}
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.loader} />
        </div>
      ) : (
        <>
          {/* Before/After Section */}
          {beforeAfter.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>📸 Before & After Results</h2>
              </div>
              <div style={styles.baGrid}>
                {beforeAfter.map(ba => (
                  <motion.div
                    key={ba._id}
                    whileHover={{ scale: 1.02 }}
                    style={styles.baCard}
                  >
                    <div style={styles.baImages}>
                      <div style={styles.baImageContainer}>
                        <img src={getImageUrl(ba.beforeImage)} alt="Before" style={styles.baImage} />
                        <span style={styles.baLabel}>Before</span>
                      </div>
                      <div style={styles.baImageContainer}>
                        <img src={getImageUrl(ba.afterImage)} alt="After" style={styles.baImage} />
                        <span style={styles.baLabel}>After</span>
                      </div>
                    </div>
                    <div style={styles.baInfo}>
                      <p><strong>{ba.patientName || 'Patient'}</strong></p>
                      <p>{ba.treatmentName || 'Treatment'}</p>
                      <div style={styles.baActions}>
                        <button
                          onClick={() => deleteBeforeAfter(ba._id)}
                          style={styles.deleteBtn}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Gallery Section */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>📷 Gallery Images</h2>
            <div style={styles.grid}>
              {filteredImages.map(image => (
                <motion.div
                  key={image._id}
                  whileHover={{ scale: 1.02 }}
                  style={styles.card}
                >
                  <img src={getImageUrl(image.image)} alt={image.title} style={styles.image} />
                  <div style={styles.cardContent}>
                    <h3 style={styles.cardTitle}>{image.title}</h3>
                    <p style={styles.cardCategory}>{image.category}</p>
                    <div style={styles.cardFooter}>
                      <span style={{
                        ...styles.status,
                        background: image.isActive ? '#4CAF50' : '#f44336'
                      }}>
                        {image.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div style={styles.actions}>
                        <button
                          onClick={() => {
                            setEditData(image);
                            setForm({
                              title: image.title,
                              description: image.description || "",
                              image: image.image,
                              category: image.category,
                              isActive: image.isActive,
                              isFeatured: image.isFeatured
                            });
                            setModalOpen(true);
                          }}
                          style={styles.editBtn}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteImage(image._id)}
                          style={styles.deleteBtn}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add Image Modal */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              {editData ? "✏️ Edit Image" : "➕ Add New Image"}
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
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  style={{ ...styles.input, minHeight: '80px' }}
                />
              </div>

              {/* Image Upload */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Image *</label>
                <ImageUpload 
                  onUpload={(url) => setForm({...form, image: url})}
                  currentImage={form.image}
                  folder="gallery"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  style={styles.input}
                >
                  <option value="Clinic">Clinic</option>
                  <option value="Treatments">Treatments</option>
                  <option value="Before-After">Before-After</option>
                  <option value="Events">Events</option>
                  <option value="Team">Team</option>
                  <option value="Facilities">Facilities</option>
                </select>
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
                    checked={form.isFeatured}
                    onChange={(e) => setForm({...form, isFeatured: e.target.checked})}
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ ...styles.button, background: '#f44336' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...styles.button, background: '#4CAF50' }}
                >
                  {editData ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Before/After Modal */}
      {baModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setBAModalOpen(false)}>
          <div style={{ ...styles.modalContent, width: '700px' }} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>📸 Add Before/After Images</h2>
            <form onSubmit={handleBASubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Patient *</label>
                  <select
                    value={baForm.patientId}
                    onChange={(e) => {
                      const patient = patients.find(p => p._id === e.target.value);
                      setBAForm({
                        ...baForm,
                        patientId: e.target.value,
                        patientName: patient?.name || ''
                      });
                    }}
                    style={styles.input}
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Treatment *</label>
                  <select
                    value={baForm.treatmentId}
                    onChange={(e) => {
                      const treatment = treatments.find(t => t._id === e.target.value);
                      setBAForm({
                        ...baForm,
                        treatmentId: e.target.value,
                        treatmentName: treatment?.name || ''
                      });
                    }}
                    style={styles.input}
                    required
                  >
                    <option value="">Select Treatment</option>
                    {treatments.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Before Image *</label>
                  <ImageUpload 
                    onUpload={(url) => setBAForm(prev => ({ ...prev, beforeImage: url }))}
                    currentImage={baForm.beforeImage}
                    folder="before-after"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>After Image *</label>
                  <ImageUpload 
                    onUpload={(url) => setBAForm(prev => ({ ...prev, afterImage: url }))}
                    currentImage={baForm.afterImage}
                    folder="before-after"
                  />
                </div>

                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    value={baForm.description}
                    onChange={(e) => setBAForm({...baForm, description: e.target.value})}
                    style={{ ...styles.input, minHeight: '80px' }}
                    placeholder="Details about this case..."
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setBAModalOpen(false)}
                  style={{ ...styles.button, background: '#f44336' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...styles.button, background: '#4CAF50' }}
                >
                  Save Before/After
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}

const styles = {
  container: {
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  filterSelect: {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    cursor: 'pointer'
  },
  addButton: {
    padding: '10px 20px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    padding: '20px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statTitle: {
    margin: '0 0 10px 0',
    color: '#666',
    fontSize: '14px'
  },
  statValue: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
  },
  section: {
    marginBottom: '40px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '24px',
    color: '#333'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  baGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  baCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '15px'
  },
  baImages: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  baImageContainer: {
    flex: 1,
    position: 'relative'
  },
  baImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  baLabel: {
    position: 'absolute',
    bottom: '5px',
    left: '5px',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  baInfo: {
    textAlign: 'center',
    fontSize: '14px'
  },
  baActions: {
    marginTop: '10px'
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  cardContent: {
    padding: '15px'
  },
  cardTitle: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  cardCategory: {
    margin: '0 0 10px 0',
    color: '#666',
    fontSize: '13px'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  status: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px'
  },
  actions: {
    display: 'flex',
    gap: '5px'
  },
  editBtn: {
    padding: '5px 10px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteBtn: {
    padding: '5px 10px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '500px',
    maxWidth: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalTitle: {
    margin: '0 0 20px 0',
    color: '#333'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  checkboxGroup: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end'
  },
  button: {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  loaderContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  }
};

export default GalleryManager;