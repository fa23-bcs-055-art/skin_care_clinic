import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Charts from "../../components/admin/Charts";
import "./Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    stats: {
      totalPatients: 0,
      todayAppointments: 0,
      totalRevenue: 0,
      totalExpenses: 0
    },
    appointments: [],
    patients: [],
    alerts: [],
    charts: {}
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorCount, setDoctorCount] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard/full");
      setData(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard ❌");
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH LOW STOCK ITEMS - FIXED (removed notification generate call)
  const fetchLowStock = async () => {
    try {
      const res = await api.get("/inventory");
      // ✅ FIXED: Use stockQuantity field (matching your inventory model)
      const lowStock = res.data.filter(item => 
        (item.stockQuantity || 0) < (item.lowStockAlert || 10)
      );
      setLowStockItems(lowStock);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };

  const fetchTodayAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      const today = new Date().toDateString();
      const todayApps = res.data.filter(app => 
        new Date(app.appointmentDate).toDateString() === today
      );
      
      if (todayApps.length > 0) {
        toast.success(`📅 You have ${todayApps.length} appointments today`, {
          duration: 5000,
          icon: '📅'
        });
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchLowStock();
    fetchTodayAppointments();

    // ✅ Auto-refresh every 30 seconds (no generateSystemNotifications)
    const interval = setInterval(() => {
      fetchData();
      fetchLowStock();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPKR = (value) => {
    if (value === undefined || value === null) return "₨0";
    return `₨${value.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{
            width: '50px',
            height: '50px',
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #3498db',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* WELCOME SECTION */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '15px',
          marginBottom: '30px',
          color: 'white'
        }}
      >
        <h1 style={{ margin: '0 0 10px 0' }}>Welcome back, Admin! 👋</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Here's what's happening with your clinic today.
        </p>
      </motion.div>

      {/* Date & Time Display */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'white',
          padding: '15px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <div>
          <span style={{ fontSize: '18px', marginRight: '10px' }}>📅</span>
          <strong>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </strong>
        </div>
        <div>
          <span style={{ 
            background: '#e3f2fd', 
            padding: '5px 12px', 
            borderRadius: '20px',
            color: '#1976d2',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🕒 {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </span>
        </div>
      </motion.div>

      {/* TOP CARDS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))", 
          gap: "20px", 
          marginBottom: "30px" 
        }}
      >
        {[
          { 
            title: "Total Patients", 
            value: data.stats.totalPatients || 0, 
            color: "#2196F3",
            icon: "👥",
            change: "+12% from last month"
          },
          { 
            title: "Today's Appointments", 
            value: data.stats.todayAppointments || 0, 
            color: "#FF9800",
            icon: "📅",
            change: data.stats.todayAppointments > 0 ? `${data.stats.todayAppointments} scheduled` : 'No appointments'
          },
          { 
            title: "Revenue (This Month)", 
            value: formatPKR(data.stats.totalRevenue), 
            color: "#4CAF50",
            icon: "💰",
            change: "Monthly revenue"
          },
          { 
            title: "Expenses (This Month)", 
            value: formatPKR(data.stats.totalExpenses), 
            color: "#f44336",
            icon: "📉",
            change: "Monthly expenses"
          },
          { 
            title: "Pending Approvals", 
            value: data.appointments?.filter(a => a.status === 'Pending').length || 0, 
            color: "#FF9800",
            icon: "⏳",
            change: "Awaiting confirmation"
          }
        ].map((card, i) => (
          <motion.div 
            key={i} 
            whileHover={{ scale: 1.02, y: -5 }}
            className="stat-card"
            style={{
              padding: "25px",
              background: "white",
              borderRadius: "15px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              borderLeft: `4px solid ${card.color}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '20px', top: '20px', fontSize: '40px', opacity: 0.1 }}>
              {card.icon}
            </div>
            <h3 style={{ margin: "0 0 10px 0", color: "#666", fontSize: "14px", textTransform: "uppercase", letterSpacing: '1px' }}>
              {card.title}
            </h3>
            <p style={{ margin: "0", fontSize: "32px", fontWeight: "bold", color: card.color }}>
              {card.value}
            </p>
            <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>{card.change}</small>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          display: 'grid',
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          gap: '15px',
          marginBottom: '25px'
        }}
      >
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '24px' }}>🆕</span>
          <div>
            <small style={{ color: '#666' }}>New Patients (This Month)</small>
            <h3 style={{ margin: 0, color: '#2196F3' }}>
              {data.patients?.filter(p => {
                const month = new Date(p.createdAt).getMonth();
                return month === new Date().getMonth();
              }).length || 0}
            </h3>
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '24px' }}>💰</span>
          <div>
            <small style={{ color: '#666' }}>Today's Revenue (Est.)</small>
            <h3 style={{ margin: 0, color: '#4CAF50' }}>
              {formatPKR(data.stats?.todayRevenue || 0)}
            </h3>
          </div>
        </div>
        
        <div style={{
          padding: '15px',
          background: 'white',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <span style={{ fontSize: '24px' }}>👨‍⚕️</span>
          <div>
            <small style={{ color: '#666' }}>Available Doctors</small>
            <h3 style={{ margin: 0, color: '#FF9800' }}>{doctorCount}</h3>
          </div>
        </div>
      </motion.div>

      {/* ✅ FIXED LOW STOCK ALERT - Uses correct field names */}
      {lowStockItems.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ 
            marginBottom: "30px",
            padding: "20px",
            background: "linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%)",
            border: "1px solid #ffeeba",
            borderRadius: "15px",
            borderLeft: "4px solid #f44336",
            boxShadow: '0 4px 15px rgba(244, 67, 54, 0.2)'
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
            <span style={{ fontSize: "32px" }}>⚠️</span>
            <div>
              <h3 style={{ margin: 0, color: "#856404", fontSize: "18px" }}>
                Low Stock Alert!
              </h3>
              <p style={{ margin: "5px 0 0 0", color: "#856404", opacity: 0.9 }}>
                {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'items'} need immediate attention
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", 
            gap: "15px",
            marginBottom: "15px"
          }}>
            {lowStockItems.slice(0, 4).map(item => (
              <motion.div 
                key={item._id}
                whileHover={{ scale: 1.02, x: 5 }}
                style={{
                  padding: "15px",
                  background: "white",
                  borderRadius: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}
              >
                <div>
                  <strong style={{ fontSize: '16px' }}>{item.productName || item.name}</strong>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: '4px' }}>
                    Current Stock: <span style={{ fontWeight: 'bold', color: '#f44336' }}>{item.stockQuantity || item.quantity}</span>
                  </div>
                </div>
                <span style={{
                  padding: "6px 12px",
                  background: "#f44336",
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  Low Stock
                </span>
              </motion.div>
            ))}
          </div>
          
          {lowStockItems.length > 4 && (
            <div style={{ marginTop: "10px", textAlign: "center" }}>
              <small style={{ color: "#856404" }}>
                + {lowStockItems.length - 4} more items low in stock
              </small>
            </div>
          )}
          
          <div style={{ marginTop: "15px", textAlign: "right" }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/admin/inventory")}
              style={{
                padding: "10px 20px",
                background: "#856404",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold"
              }}
            >
              View Inventory →
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* APPOINTMENTS & PATIENTS */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))", 
        gap: "25px", 
        marginBottom: "30px" 
      }}>
        {/* LEFT - APPOINTMENTS */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card" 
          style={{ 
            padding: "25px", 
            background: "white", 
            borderRadius: "15px", 
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)" 
          }}
        >
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "20px" 
          }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>📅 Recent Appointments</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <motion.span 
                whileHover={{ scale: 1.1 }}
                style={{ 
                  padding: "6px 12px", 
                  background: "#e3f2fd", 
                  color: "#1976d2",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "bold"
                }}
              >
                {data.appointments?.length || 0} Total
              </motion.span>
              <motion.button
                whileHover={{ x: 3 }}
                onClick={() => navigate('/admin/appointments')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2196F3',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}
              >
                View All →
              </motion.button>
            </div>
          </div>

          {data.appointments?.length > 0 ? (
            <div className="admin-table-responsive-wrapper" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: "400px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: "12px 0", color: '#666' }}>Patient</th>
                    <th style={{ textAlign: "left", padding: "12px 0", color: '#666' }}>Date</th>
                    <th style={{ textAlign: "left", padding: "12px 0", color: '#666' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.appointments.slice(0, 5).map(a => (
                    <motion.tr 
                      key={a._id} 
                      whileHover={{ backgroundColor: '#f9f9f9' }}
                      style={{ borderBottom: "1px solid #eee", cursor: 'pointer' }}
                      onClick={() => navigate(`/admin/appointments`)}
                    >
                      <td style={{ padding: "12px 0", fontWeight: '500' }}>{a.patientName || a.customerName || "Unknown"}</td>
                      <td style={{ padding: "12px 0", color: '#666' }}>
                        {a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td style={{ padding: "12px 0" }}>
                        <span style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: a.status === "Completed" ? "#e8f5e8" : 
                                      a.status === "Pending" ? "#fff3e0" : 
                                      a.status === "Cancelled" ? "#ffebee" : 
                                      a.status === "Confirmed" ? "#e3f2fd" : "#f5f5f5",
                          color: a.status === "Completed" ? "#4CAF50" : 
                                 a.status === "Pending" ? "#FF9800" : 
                                 a.status === "Cancelled" ? "#f44336" : 
                                 a.status === "Confirmed" ? "#2196F3" : "#999"
                        }}>
                          {a.status || "Pending"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📅</span>
              <p style={{ color: "#999", margin: 0 }}>No appointments found</p>
            </div>
          )}
        </motion.div>

        {/* RIGHT - RECENT PATIENTS */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card" 
          style={{ 
            padding: "25px", 
            background: "white", 
            borderRadius: "15px", 
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)" 
          }}
        >
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "20px" 
          }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>👥 Recent Patients</h3>
            <motion.span 
              whileHover={{ scale: 1.1 }}
              style={{ 
                padding: "6px 12px", 
                background: "#e8f5e8", 
                color: "#4CAF50",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "bold"
              }}
            >
              {data.patients?.length || 0} Total
            </motion.span>
          </div>

          {data.patients?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.patients.slice(0, 5).map(p => (
                <motion.div 
                  key={p._id} 
                  whileHover={{ x: 5, backgroundColor: '#f9f9f9' }}
                  style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "12px",
                    background: "#f9f9f9",
                    borderRadius: "10px",
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate(`/admin/patients`)}
                >
                  <div>
                    <p style={{ margin: "0", fontWeight: "600", fontSize: '16px' }}>{p.name || "Unknown"}</p>
                    <small style={{ color: "#999" }}>{p.phone || "No phone"}</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#4CAF50"
                    }} />
                    <span style={{ color: '#999', fontSize: '12px' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>👥</span>
              <p style={{ color: "#999", margin: 0 }}>No patients found</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* CHARTS */}
      {data.charts && Object.keys(data.charts).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ marginBottom: "30px" }}
        >
          <Charts data={data.charts} />
        </motion.div>
      )}

      {/* ALERTS SECTION */}
      {(data.alerts && data.alerts.length > 0) && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card" 
          style={{ 
            padding: "25px", 
            background: "white", 
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
            <span style={{ fontSize: "28px" }}>🔔</span>
            <h3 style={{ margin: 0, color: "#f44336", fontSize: '18px' }}>Notifications & Alerts</h3>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {data.alerts.map((alert, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 5 }}
                style={{ 
                  padding: "15px", 
                  background: "#fff3f3", 
                  borderRadius: "10px",
                  color: "#d32f2f",
                  borderLeft: "4px solid #f44336",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  cursor: 'pointer'
                }}
                onClick={() => {
                  if (alert.includes('appointment')) navigate('/admin/appointments');
                  if (alert.includes('stock')) navigate('/admin/inventory');
                  if (alert.includes('payment')) navigate('/admin/finance');
                }}
              >
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <span style={{ flex: 1 }}>{alert}</span>
                <span style={{ fontSize: '12px', color: '#999' }}>Click to view</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Dashboard;
