import { useState, useEffect } from "react";
import api, { getImageUrl } from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ServiceModal from "../../components/admin/ServiceModal";
import ImageUpload from "../../components/common/ImageUpload";

function ServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, inactive

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services/admin');
      setServices(res.data);
    } catch (error) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/services/admin/${id}/toggle`);
      toast.success(`Service ${currentStatus ? 'deactivated' : 'activated'} ✅`);
      fetchServices();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      await api.delete(`/services/admin/${id}`);
      toast.success('Service deleted ✅');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = services.filter(service => {
    if (filter === 'active') return service.isActive;
    if (filter === 'inactive') return !service.isActive;
    return true;
  });

  const formatCurrency = (value) => {
    return `₨${value?.toLocaleString() || 0}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.header}>
        <h1>💆 Service Management</h1>
        <div style={styles.headerActions}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Services</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            style={styles.addButton}
          >
            + Add New Service
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Services</h3>
          <p style={styles.statValue}>{services.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Active</h3>
          <p style={{ ...styles.statValue, color: '#4CAF50' }}>
            {services.filter(s => s.isActive).length}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Inactive</h3>
          <p style={{ ...styles.statValue, color: '#f44336' }}>
            {services.filter(s => !s.isActive).length}
          </p>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.loader} />
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Duration</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(service => (
                <motion.tr 
                  key={service._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.tableRow}
                >
                  <td style={styles.td}>
                    {service.image ? (
                      <img 
                        src={getImageUrl(service.image)} 
                        alt={service.name}
                        style={styles.serviceImage}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div style={styles.serviceImagePlaceholder}>
                        {service.icon || '💆'}
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 'bold' }}>{service.name}</div>
                    <small style={{ color: '#666' }}>
                      {service.shortDescription?.substring(0, 30)}...
                    </small>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>
                      {service.category || 'General'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.price}>{formatCurrency(service.price)}</span>
                  </td>
                  <td style={styles.td}>{service.duration}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => toggleStatus(service._id, service.isActive)}
                      style={{
                        ...styles.statusButton,
                        background: service.isActive ? '#4CAF50' : '#f44336'
                      }}
                    >
                      {service.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => {
                          setEditData(service);
                          setModalOpen(true);
                        }}
                        style={styles.editButton}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteService(service._id)}
                        style={styles.deleteButton}
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

      {/* Service Modal */}
      <ServiceModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        refresh={fetchServices}
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
    borderBottom: '1px solid #eee'
  },
  td: {
    padding: '15px'
  },
  serviceImage: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  serviceImagePlaceholder: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#999'
  },
  categoryBadge: {
    padding: '4px 8px',
    background: '#e3f2fd',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#1976d2'
  },
  price: {
    fontWeight: 'bold',
    color: '#4CAF50'
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

export default ServicesManager;