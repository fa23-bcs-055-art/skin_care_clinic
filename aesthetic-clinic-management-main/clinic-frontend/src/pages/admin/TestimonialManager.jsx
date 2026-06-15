import { useState, useEffect } from "react";
import api, { getImageUrl } from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import TestimonialModal from "../../components/admin/TestimonialModal";

function TestimonialManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState('all'); // all, approved, pending

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await api.get('/testimonials/all');
      setTestimonials(res.data);
    } catch (error) {
      toast.error("Failed to fetch testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/testimonials/${id}/toggle`);
      toast.success(`Testimonial ${!currentStatus ? 'approved' : 'rejected'} ✅`);
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;
    
    try {
      await api.delete(`/testimonials/${id}`);
      toast.success("Testimonial deleted ✅");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to delete testimonial");
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'approved') return t.isActive;
    if (filter === 'pending') return !t.isActive;
    return true;
  });

  const pendingCount = testimonials.filter(t => !t.isActive).length;
  const approvedCount = testimonials.filter(t => t.isActive).length;

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.header}>
        <h1>⭐ Testimonial Management</h1>
        <div style={styles.headerActions}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Testimonials</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Testimonials</h3>
          <p style={styles.statValue}>{testimonials.length}</p>
        </div>
        <div 
          style={styles.statCard}
          onClick={() => setFilter('approved')}
          className="clickable"
        >
          <h3 style={styles.statTitle}>Approved</h3>
          <p style={{ ...styles.statValue, color: '#4CAF50' }}>
            {approvedCount}
          </p>
        </div>
        <div 
          style={styles.statCard}
          onClick={() => setFilter('pending')}
          className="clickable"
        >
          <h3 style={styles.statTitle}>Pending Review</h3>
          <p style={{ ...styles.statValue, color: '#FF9800' }}>
            {pendingCount}
          </p>
          {pendingCount > 0 && (
            <span style={styles.pendingBadge}>New!</span>
          )}
        </div>
      </div>

      {/* Testimonials Table */}
      {loading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.loader} />
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Patient</th>
                <th style={styles.th}>Testimonial</th>
                <th style={styles.th}>Rating</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestimonials.map(testimonial => (
                <motion.tr 
                  key={testimonial._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    ...styles.tableRow,
                    background: !testimonial.isActive ? '#fff9e6' : 'white'
                  }}
                >
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {testimonial.patientImage ? (
                        <img 
                          src={getImageUrl(testimonial.patientImage)} 
                          alt={testimonial.patientName}
                          style={styles.patientImage}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div style={styles.patientAvatar}>
                          {testimonial.patientName?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{testimonial.patientName}</div>
                        {testimonial.patientEmail && (
                          <small style={{ color: '#666' }}>{testimonial.patientEmail}</small>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.testimonialText}>
                      "{testimonial.text.length > 100 
                        ? testimonial.text.substring(0, 100) + '...' 
                        : testimonial.text}"
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.rating}>
                      {renderStars(testimonial.rating || 5)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(testimonial.createdAt).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => toggleStatus(testimonial._id, testimonial.isActive)}
                      style={{
                        ...styles.statusButton,
                        background: testimonial.isActive ? '#4CAF50' : '#FF9800'
                      }}
                    >
                      {testimonial.isActive ? 'Approved' : 'Pending'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => {
                          setEditData(testimonial);
                          setModalOpen(true);
                        }}
                        style={styles.editButton}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTestimonial(testimonial._id)}
                        style={styles.deleteButton}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Testimonial Modal */}
      <TestimonialModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        refresh={fetchTestimonials}
        editData={editData}
      />
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    padding: '20px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    position: 'relative'
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
  pendingBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#f44336',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  tableContainer: {
    overflowX: 'auto',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f5f5f5'
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333'
  },
  tableRow: {
    borderBottom: '1px solid #eee',
    transition: 'background 0.3s'
  },
  td: {
    padding: '15px'
  },
  patientImage: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  patientAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#2196F3',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  testimonialText: {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5',
    maxWidth: '300px'
  },
  rating: {
    color: '#FFC107',
    fontSize: '16px',
    letterSpacing: '2px'
  },
  statusButton: {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  editButton: {
    padding: '5px 10px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '5px 10px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
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

export default TestimonialManager;