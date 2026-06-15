import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [screenshotModal, setScreenshotModal] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success(`Appointment ${status.toLowerCase()} successfully ✅`);
      fetchAppointments();
      setActionModal(null);
    } catch (error) {
      toast.error("Update failed ❌");
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await api.delete(`/appointments/${id}`);
      toast.success("Appointment Deleted ✅");
      fetchAppointments();
    } catch (error) {
      toast.error("Delete failed ❌");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return '#4CAF50';
      case 'Completed': return '#2196F3';
      case 'Pending': return '#FF9800';
      case 'Cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'Confirmed': return '#e8f5e9';
      case 'Completed': return '#e3f2fd';
      case 'Pending': return '#fff3e0';
      case 'Cancelled': return '#ffebee';
      default: return '#f5f5f5';
    }
  };

  const getAvailableActions = (status) => {
    switch(status) {
      case 'Pending':
        return ['Confirmed', 'Cancelled'];
      case 'Confirmed':
        return ['Completed', 'Cancelled'];
      case 'Completed':
        return [];
      case 'Cancelled':
        return [];
      default:
        return ['Confirmed', 'Completed', 'Cancelled'];
    }
  };

  const filtered = statusFilter
    ? appointments.filter(a => a.status === statusFilter)
    : appointments;

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    confirmed: appointments.filter(a => a.status === 'Confirmed').length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    cancelled: appointments.filter(a => a.status === 'Cancelled').length
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px", color: "#2c3e50" }}>📅 Appointments Management</h1>

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "15px",
        marginBottom: "25px"
      }}>
        <div style={{ padding: "15px", background: "white", borderRadius: "10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2A5CAA" }}>{stats.total}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Total</div>
        </div>
        <div style={{ padding: "15px", background: "white", borderRadius: "10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#FF9800" }}>{stats.pending}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Pending</div>
        </div>
        <div style={{ padding: "15px", background: "white", borderRadius: "10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4CAF50" }}>{stats.confirmed}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Confirmed</div>
        </div>
        <div style={{ padding: "15px", background: "white", borderRadius: "10px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2196F3" }}>{stats.completed}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Completed</div>
        </div>
      </div>

      {/* Filter and Actions */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
        <select 
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            minWidth: "150px",
            fontSize: "14px"
          }}
        >
          <option value="">All Appointments</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          onClick={() => { setStatusFilter(""); fetchAppointments(); }}
          style={{
            padding: "10px 20px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #2A5CAA",
            borderRadius: "50%",
            margin: "0 auto 15px",
            animation: "spin 1s linear infinite"
          }} />
          <p>Loading appointments...</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                <th style={{ padding: "15px", textAlign: "left" }}>Patient</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Contact</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Date & Time</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Doctor</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Service</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Payment</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Status</th>
                <th style={{ padding: "15px", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(app => (
                  <motion.tr 
                    key={app._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "15px" }}>
                      <div style={{ fontWeight: "bold" }}>{app.patientName || app.customerName || 'N/A'}</div>
                    </td>
                    <td style={{ padding: "15px", fontSize: "13px", color: "#666" }}>
                      {app.patientPhone || app.customerPhone || 'N/A'}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div>{new Date(app.appointmentDate).toLocaleDateString()}</div>
                      <small style={{ color: "#666" }}>{app.startTime || '3:00 PM'}</small>
                    </td>
                    <td style={{ padding: "15px" }}>Dr. {app.doctorName || 'General'}</td>
                    <td style={{ padding: "15px" }}>{app.serviceName || 'Consultation'}</td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        background: app.paymentStatus === 'Paid' ? '#e8f5e9' : '#fff3e0',
                        color: app.paymentStatus === 'Paid' ? '#4CAF50' : '#FF9800'
                      }}>
                        {app.paymentStatus || 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "bold",
                        background: getStatusBg(app.status),
                        color: getStatusColor(app.status)
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => setSelectedAppointment(app)}
                          style={{
                            padding: "6px 12px",
                            background: "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          👁️ View
                        </button>
                        
                        {getAvailableActions(app.status).map(action => (
                          <button
                            key={action}
                            onClick={() => setActionModal({ appointment: app, action })}
                            style={{
                              padding: "6px 12px",
                              background: action === 'Confirmed' ? '#4CAF50' : action === 'Completed' ? '#2196F3' : '#f44336',
                              color: "white",
                              border: "none",
                              borderRadius: "5px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                          >
                            {action === 'Confirmed' ? '✓ Confirm' : action === 'Completed' ? '✔ Complete' : '✕ Cancel'}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => deleteAppointment(app._id)}
                          style={{
                            padding: "6px 12px",
                            background: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "60px", color: "#999" }}>
                    <div style={{ fontSize: "48px", marginBottom: "10px" }}>📅</div>
                    <p>No appointments found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ View Appointment Modal WITH SCREENSHOT */}
      {selectedAppointment && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setSelectedAppointment(null)}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "25px",
            width: "550px",
            maxWidth: "90%",
            maxHeight: "80vh",
            overflowY: "auto"
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px", color: "#2A5CAA" }}>📋 Appointment Details</h3>
            
            <div style={{ marginBottom: "15px" }}>
              <strong>Patient:</strong> {selectedAppointment.patientName || selectedAppointment.customerName}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Phone:</strong> {selectedAppointment.patientPhone || selectedAppointment.customerPhone}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Email:</strong> {selectedAppointment.customerEmail || 'N/A'}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Date:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Time:</strong> {selectedAppointment.startTime || '3:00 PM'}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Doctor:</strong> Dr. {selectedAppointment.doctorName || 'General'}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Service:</strong> {selectedAppointment.serviceName || 'Consultation'}
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Status:</strong> 
              <span style={{
                marginLeft: "10px",
                padding: "4px 10px",
                borderRadius: "20px",
                background: getStatusBg(selectedAppointment.status),
                color: getStatusColor(selectedAppointment.status)
              }}>{selectedAppointment.status}</span>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Payment Status:</strong>
              <span style={{
                marginLeft: "10px",
                padding: "4px 10px",
                borderRadius: "20px",
                fontSize: "12px",
                background: selectedAppointment.paymentStatus === 'Paid' ? '#e8f5e9' : '#fff3e0',
                color: selectedAppointment.paymentStatus === 'Paid' ? '#4CAF50' : '#FF9800'
              }}>{selectedAppointment.paymentStatus || 'Unpaid'}</span>
            </div>
            
            {/* ✅ Payment Info Section */}
            {selectedAppointment.paymentAmount && (
              <div style={{ marginBottom: "15px", padding: "10px", background: "#f0f7ff", borderRadius: "8px" }}>
                <strong>Payment Amount:</strong> ₨{selectedAppointment.paymentAmount?.toLocaleString()}
                {selectedAppointment.paymentMethod && (
                  <span style={{ marginLeft: "15px" }}>
                    <strong>Method:</strong> {selectedAppointment.paymentMethod}
                  </span>
                )}
              </div>
            )}

            {/* ✅ SCREENSHOT DISPLAY SECTION */}
            {selectedAppointment.paymentScreenshot && (
              <div style={{ marginBottom: "20px" }}>
                <strong style={{ display: "block", marginBottom: "10px" }}>📸 Payment Screenshot:</strong>
                <div 
                  style={{ 
                    border: "2px solid #ddd", 
                    borderRadius: "8px", 
                    overflow: "hidden",
                    cursor: "pointer",
                    maxHeight: "200px",
                    display: "flex",
                    justifyContent: "center",
                    background: "#f5f5f5"
                  }}
                  onClick={() => setScreenshotModal(selectedAppointment.paymentScreenshot)}
                >
                  <img 
                   src={`http://localhost:5000${selectedAppointment.paymentScreenshot}`}
                    alt="Payment Screenshot"
                    style={{ 
                      maxWidth: "100%", 
                      maxHeight: "200px",
                      objectFit: "contain"
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<p style="padding:20px;color:#999">Screenshot not available</p>';
                    }}
                  />
                </div>
                <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
                  Click to view full size
                </small>
              </div>
            )}

            {selectedAppointment.notes && (
              <div style={{ marginBottom: "20px", padding: "10px", background: "#f5f5f5", borderRadius: "8px" }}>
                <strong>Notes:</strong> {selectedAppointment.notes}
              </div>
            )}
            
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                onClick={() => setSelectedAppointment(null)}
                style={{
                  padding: "10px 20px",
                  background: "#999",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Screenshot Full Size Modal */}
      {screenshotModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2000
        }} onClick={() => setScreenshotModal(null)}>
          <div style={{
            position: "relative",
            maxWidth: "90%",
            maxHeight: "90%"
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setScreenshotModal(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                background: "white",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
            <img 
             src={`http://localhost:5000${selectedAppointment.paymentScreenshot}`}
              alt="Payment Screenshot Full Size"
              style={{ 
                maxWidth: "100%", 
                maxHeight: "85vh",
                borderRadius: "8px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
              }}
            />
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }} onClick={() => setActionModal(null)}>
          <div style={{
            background: "white",
            borderRadius: "12px",
            padding: "25px",
            width: "350px",
            textAlign: "center"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>
              {actionModal.action === 'Confirmed' ? '✓' : actionModal.action === 'Completed' ? '✔' : '❌'}
            </div>
            <h3>Confirm Action</h3>
            <p>Are you sure you want to mark this appointment as <strong>{actionModal.action}</strong>?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <button
                onClick={() => updateStatus(actionModal.appointment._id, actionModal.action)}
                style={{
                  padding: "10px 20px",
                  background: actionModal.action === 'Confirmed' ? '#4CAF50' : actionModal.action === 'Completed' ? '#2196F3' : '#f44336',
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Yes, Confirm
              </button>
              <button
                onClick={() => setActionModal(null)}
                style={{
                  padding: "10px 20px",
                  background: "#999",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}

export default Appointments;