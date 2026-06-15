import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import PatientModal from "../../components/admin/PatientModal";
import { motion } from "framer-motion";

function Patients() {
  // State declarations
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  
  // 🔥 FILTER STATES
  const [filterType, setFilterType] = useState('all'); // 'all', 'recent', 'month'
  
  // 🔥 PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(5);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      console.log('📊 Fetched patients:', res.data.length, 'records');
      // Log patient timestamps for debugging
      if (res.data && res.data.length > 0) {
        console.log('Sample patient:', {
          name: res.data[0].name,
          createdAt: res.data[0].createdAt,
          updatedAt: res.data[0].updatedAt
        });
      }
      setPatients(res.data);
    } catch (error) {
      toast.error("Failed to fetch patients");
      console.error('Patient fetch error:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const deletePatient = async (id) => {
    if (!window.confirm("Delete patient?")) return;

    try {
      await api.delete(`/patients/${id}`);
      toast.success("Deleted Successfully ✅");
      fetchPatients();
    } catch (error) {
      toast.error("Error deleting ❌");
    }
  };

  // 🔥 ADVANCED FILTER FUNCTION
  const getFilteredPatients = () => {
    let filtered = patients;

    // Apply search filter
    filtered = filtered.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
    );

    // Apply date filters
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    if (filterType === 'recent') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      filtered = filtered.filter(p => {
        // Handle patients without createdAt (legacy records)
        if (!p.createdAt) {
          return false;
        }
        const createdAt = new Date(p.createdAt);
        createdAt.setHours(0, 0, 0, 0); // Reset time to start of day
        return createdAt >= sevenDaysAgo;
      });
    }
    
    if (filterType === 'month') {
      filtered = filtered.filter(p => {
        // Handle patients without createdAt (legacy records)
        if (!p.createdAt) {
          return false;
        }
        const createdAt = new Date(p.createdAt);
        return createdAt.getMonth() === today.getMonth() &&
               createdAt.getFullYear() === today.getFullYear();
      });
    }

    return filtered;
  };

  // Get filtered patients
  const filteredPatients = getFilteredPatients();

  // 🔥 PAGINATION LOGIC
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredPatients.length / patientsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setFilterType('all');
    setCurrentPage(1);
    toast.success("Filters cleared");
  };

  // Helper to count recent patients (last 7 days)
  const getRecentCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return patients.filter(p => {
      if (!p.createdAt) return false;
      const createdAt = new Date(p.createdAt);
      createdAt.setHours(0, 0, 0, 0);
      return createdAt >= sevenDaysAgo;
    }).length;
  };

  // Helper to count this month's patients
  const getMonthCount = () => {
    const today = new Date();
    return patients.filter(p => {
      if (!p.createdAt) return false;
      const createdAt = new Date(p.createdAt);
      return createdAt.getMonth() === today.getMonth() && createdAt.getFullYear() === today.getFullYear();
    }).length;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="patients-container"
      style={{ padding: "20px" }}
    >
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>👥 Patient Management</h1>
        
        {/* ADD Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          style={{
            padding: "10px 20px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          + Add New Patient
        </motion.button>
      </div>

      {/* 🔍 SEARCH BAR */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="🔍 Search by name or phone..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "5px",
            border: "1px solid #ddd"
          }}
        />
        <span style={{ marginLeft: "10px", color: "#666" }}>
          Total: {filteredPatients.length} patients
        </span>
        
        {/* Reset Filters Button - Shows when filters are active */}
        {(search || filterType !== 'all') && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={resetFilters}
            style={{
              marginLeft: "10px",
              padding: "6px 12px",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            ✕ Clear Filters
          </motion.button>
        )}
      </div>

      {/* 🔥 WORKING FILTER BUTTONS */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <button
          onClick={() => {
            setFilterType('all');
            setCurrentPage(1);
          }}
          style={{
            padding: '8px 16px',
            background: filterType === 'all' ? '#2196F3' : '#f0f0f0',
            color: filterType === 'all' ? 'white' : '#333',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filterType === 'all' ? 'bold' : 'normal',
            transition: 'all 0.3s ease',
            boxShadow: filterType === 'all' ? '0 2px 8px rgba(33, 150, 243, 0.3)' : 'none'
          }}
        >
          📋 All Patients <span style={{ 
            background: filterType === 'all' ? 'rgba(255,255,255,0.2)' : '#ddd',
            padding: '2px 8px',
            borderRadius: '12px',
            marginLeft: '5px',
            fontSize: '12px'
          }}>{patients.length}</span>
        </button>
        
        <button
          onClick={() => {
            setFilterType('recent');
            setCurrentPage(1);
            const recentCount = patients.filter(p => {
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return new Date(p.createdAt) >= sevenDaysAgo;
            }).length;
            toast.success(`📅 Showing ${recentCount} patients from last 7 days`);
          }}
          style={{
            padding: '8px 16px',
            background: filterType === 'recent' ? '#FF9800' : '#f0f0f0',
            color: filterType === 'recent' ? 'white' : '#333',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filterType === 'recent' ? 'bold' : 'normal',
            transition: 'all 0.3s ease',
            boxShadow: filterType === 'recent' ? '0 2px 8px rgba(255, 152, 0, 0.3)' : 'none'
          }}
        >
          🔥 Recent (7 days) <span style={{ 
            background: filterType === 'recent' ? 'rgba(255,255,255,0.2)' : '#ddd',
            padding: '2px 8px',
            borderRadius: '12px',
            marginLeft: '5px',
            fontSize: '12px'
          }}>
            {patients.filter(p => {
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return new Date(p.createdAt) >= sevenDaysAgo;
            }).length}
          </span>
        </button>
        
        <button
          onClick={() => {
            setFilterType('month');
            setCurrentPage(1);
            const monthCount = patients.filter(p => {
              const today = new Date();
              const createdAt = new Date(p.createdAt);
              return createdAt.getMonth() === today.getMonth() &&
                     createdAt.getFullYear() === today.getFullYear();
            }).length;
            toast.success(`📆 Showing ${monthCount} patients from this month`);
          }}
          style={{
            padding: '8px 16px',
            background: filterType === 'month' ? '#4CAF50' : '#f0f0f0',
            color: filterType === 'month' ? 'white' : '#333',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filterType === 'month' ? 'bold' : 'normal',
            transition: 'all 0.3s ease',
            boxShadow: filterType === 'month' ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 'none'
          }}
        >
          📆 This Month <span style={{ 
            background: filterType === 'month' ? 'rgba(255,255,255,0.2)' : '#ddd',
            padding: '2px 8px',
            borderRadius: '12px',
            marginLeft: '5px',
            fontSize: '12px'
          }}>
            {patients.filter(p => {
              const today = new Date();
              const createdAt = new Date(p.createdAt);
              return createdAt.getMonth() === today.getMonth() &&
                     createdAt.getFullYear() === today.getFullYear();
            }).length}
          </span>
        </button>
      </div>

      {/* Active Filter Indicator */}
      {filterType !== 'all' && (
        <div style={{
          marginBottom: '15px',
          padding: '8px 15px',
          background: '#e3f2fd',
          borderRadius: '8px',
          color: '#1976d2',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🔍 Active Filter:</span>
          <strong>
            {filterType === 'recent' ? 'Last 7 Days' : 'This Month'}
          </strong>
          <span style={{ marginLeft: 'auto' }}>
            Found {filteredPatients.length} patients
          </span>
        </div>
      )}

      {/* 📋 PATIENTS TABLE */}
      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Phone</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Joined</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {currentPatients.length > 0 ? (
            currentPatients.map(p => (
              <motion.tr 
                key={p._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ borderBottom: "1px solid #eee" }}
              >
                <td style={{ padding: "12px" }}>
                  <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                  {p.email && <small style={{ color: '#666' }}>{p.email}</small>}
                </td>
                <td style={{ padding: "12px" }}>{p.phone || 'N/A'}</td>
                <td style={{ padding: "12px", color: '#666' }}>
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                  <br />
                  <small>{p.createdAt ? new Date(p.createdAt).toLocaleTimeString() : ''}</small>
                </td>
                <td style={{ padding: "12px" }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setEditData(p);
                      setModalOpen(true);
                    }}
                    style={{
                      padding: "5px 10px",
                      marginRight: "10px",
                      background: "#2196F3",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    Edit
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deletePatient(p._id)}
                    style={{
                      padding: "5px 10px",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </motion.button>
                </td>
              </motion.tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>👥</span>
                  <p>No patients found</p>
                  {(search || filterType !== 'all') && (
                    <button
                      onClick={resetFilters}
                      style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        background: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </motion.div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔥 PAGINATION CONTROLS */}
      {filteredPatients.length > 0 && (
        <div style={{ 
          marginTop: "20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px"
        }}>
          
          {/* Previous Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevPage}
            disabled={currentPage === 1}
            style={{
              padding: "8px 15px",
              background: currentPage === 1 ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer"
            }}
          >
            ← Previous
          </motion.button>

          {/* Page Numbers */}
          {[...Array(totalPages)].map((_, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(index + 1)}
              style={{
                padding: "8px 12px",
                background: currentPage === index + 1 ? "#2196F3" : "#f0f0f0",
                color: currentPage === index + 1 ? "white" : "#333",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                fontWeight: currentPage === index + 1 ? "bold" : "normal"
              }}
            >
              {index + 1}
            </motion.button>
          ))}

          {/* Next Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 15px",
              background: currentPage === totalPages ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer"
            }}
          >
            Next →
          </motion.button>
        </div>
      )}

      {/* Showing X of Y results */}
      <div style={{ textAlign: "center", marginTop: "10px", color: "#666" }}>
        Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
      </div>

      {/* MODAL */}
      <PatientModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        refresh={fetchPatients}
        editData={editData}
      />
    </motion.div>
  );
}

export default Patients;