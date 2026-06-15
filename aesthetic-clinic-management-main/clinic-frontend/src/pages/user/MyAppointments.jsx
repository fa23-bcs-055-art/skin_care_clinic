import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./user.css";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

  const statuses = ["All", "Pending", "Confirmed", "Completed", "Cancelled"];

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      const user = JSON.parse(userStr);
      
      console.log("Current user:", user);
      
      // Use the my-appointments endpoint
      const res = await api.get("/appointments/my-appointments");
      
      console.log("Appointments response:", res.data);
      
      setAppointments(res.data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.response?.data?.error || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await api.put(`/appointments/${id}`, { status: "Cancelled" });
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error) {
      console.error("Cancel error:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (filterStatus === "All") return true;
    return app.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "#FF9800";
      case "Confirmed": return "#4CAF50";
      case "Completed": return "#2196F3";
      case "Cancelled": return "#f44336";
      default: return "#666";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    return new Date(dateString).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Time not set";
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = timeString.split(':');
    let hour = parseInt(hours);
    const minute = minutes || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minute} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading your appointments...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="my-appointments"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-header">
        <h1>📋 My Appointments</h1>
        <Link to="/user/book-appointment" className="book-new-btn">
          + Book New Appointment
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {statuses.map((status) => (
          <motion.button
            key={status}
            className={`filter-tab ${filterStatus === status ? "active" : ""}`}
            onClick={() => setFilterStatus(status)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {status}
            <span className="count">
              {status === "All"
                ? appointments.length
                : appointments.filter((a) => a.status === status).length}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="appointments-list">
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment._id}
              className="appointment-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() =>
                setExpandedId(expandedId === appointment._id ? null : appointment._id)
              }
            >
              <div className="appointment-header">
                <div className="appointment-info">
                  <h3>📅 {formatDate(appointment.appointmentDate)}</h3>
                  <p className="appointment-time">⏰ {formatTime(appointment.startTime)}</p>
                </div>
                <div className="appointment-status">
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(appointment.status) }}
                  >
                    {appointment.status}
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === appointment._id && (
                <motion.div
                  className="appointment-details-expanded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Doctor</label>
                      <p>Dr. {appointment.doctorName || appointment.doctorId?.name || "Not assigned"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Service</label>
                      <p>{appointment.serviceName || "Consultation"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Customer Name</label>
                      <p>{appointment.customerName || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Phone</label>
                      <p>{appointment.customerPhone || "N/A"}</p>
                    </div>
                    <div className="detail-item">
                      <label>Payment Status</label>
                      <p style={{ color: appointment.paymentStatus === "Paid" ? "#4CAF50" : "#FF9800" }}>
                        {appointment.paymentStatus || "Unpaid"}
                      </p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="notes-section">
                      <label>Notes</label>
                      <p>{appointment.notes}</p>
                    </div>
                  )}

                  <div className="appointment-actions">
                    {appointment.status === "Pending" && (
                      <motion.button
                        className="cancel-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelAppointment(appointment._id);
                        }}
                      >
                        Cancel Appointment
                      </motion.button>
                    )}
                    {appointment.paymentStatus === "Unpaid" && appointment.status !== "Cancelled" && (
                      <Link
                        to="/user/payments"
                        className="pay-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Make Payment
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h2>No Appointments Found</h2>
          <p>You haven't booked any appointments yet.</p>
          <Link to="/user/book-appointment" className="book-new-btn">
            Book Your First Appointment
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default MyAppointments;