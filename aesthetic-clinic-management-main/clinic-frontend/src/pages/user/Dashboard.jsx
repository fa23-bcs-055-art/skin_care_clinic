import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./user.css";

function UserDashboard() {
  const [dashboardData, setDashboardData] = useState({
    stats: { upcomingAppointments: 0, totalVisits: 0, pendingPayments: 0 },
    nextAppointment: null,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/user");
      console.log("Dashboard data:", res.data);
      setDashboardData(res.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      toast.error(error.response?.data?.error || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function to format time in 12-hour format
  const formatTime12Hour = (timeString) => {
    if (!timeString) return "3:00 PM";
    
    // If time is in "HH:MM" format (e.g., "15:30")
    if (timeString.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      let [hours, minutes] = timeString.split(':');
      hours = parseInt(hours);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    
    // If it's a full datetime string
    try {
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      }
    } catch (e) {
      console.error("Time parsing error:", e);
    }
    
    return timeString || "3:00 PM";
  };

  // ✅ Helper function to format date in readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const { stats, nextAppointment, recentActivity } = dashboardData;

  return (
    <motion.div
      className="user-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Quick Stats */}
      <div className="stats-grid">
        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Upcoming</h3>
            <p className="stat-value">{stats.upcomingAppointments || 0}</p>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>Total Visits</h3>
            <p className="stat-value">{stats.totalVisits || 0}</p>
          </div>
        </motion.div>

        <motion.div className="stat-card" whileHover={{ y: -5 }}>
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Pending Payments</h3>
            <p className="stat-value">{stats.pendingPayments || 0}</p>
          </div>
        </motion.div>
      </div>

      {/* Next Appointment */}
      {nextAppointment ? (
        <motion.div 
          className="next-appointment-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Your Next Appointment</h3>
          <div className="appointment-details">
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">{formatDate(nextAppointment.appointmentDate)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Time:</span>
              <span className="value">{formatTime12Hour(nextAppointment.startTime)}</span>
            </div>
            <div className="detail-item">
              <span className="label">Doctor:</span>
              <span className="value">Dr. {nextAppointment.doctorName || "General"}</span>
            </div>
          </div>
          <Link to="/user/my-appointments" className="view-link">
            View Details →
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          className="no-appointment-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p>No upcoming appointments</p>
          <Link to="/user/book-appointment" className="book-btn">
            Book Appointment
          </Link>
        </motion.div>
      )}

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <motion.div 
          className="recent-activity"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <motion.div 
                key={`${activity.type}-${activity.id}`}
                className="activity-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="activity-icon">
                  {activity.type === 'appointment' ? '📅' : '💰'}
                </div>
                <div className="activity-details">
                  <p className="activity-title">{activity.title}</p>
                  <span className="activity-date">
                    {formatDate(activity.date)}
                  </span>
                </div>
                <span className={`activity-status ${activity.status?.toLowerCase() || 'pending'}`}>
                  {activity.status || 'Pending'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default UserDashboard;