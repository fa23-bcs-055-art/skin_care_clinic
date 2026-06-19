import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    patientId: "",
    appointmentId: "",
    amount: "",
    paymentMethod: "Cash",
    status: "Success",
    notes: ""
  });

  const paymentMethods = ["Cash", "Card", "UPI", "Bank Transfer", "Insurance"];
  const statuses = ["Success", "Pending", "Failed", "Refunded"];

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments");
      setPayments(res.data);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch (error) {
      console.error("Failed to fetch patients");
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch (error) {
      console.error("Failed to fetch appointments");
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPatients();
    fetchAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.patientId || !form.amount) {
      return toast.error("Please fill required fields");
    }

    try {
      if (editData) {
        await api.put(`/payments/${editData._id}`, form);
        toast.success("Payment updated ✅");
      } else {
        await api.post("/payments", form);
        toast.success("Payment recorded ✅");
      }
      
      fetchPayments();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Operation failed ❌");
    }
  };

  const resetForm = () => {
    setForm({
      patientId: "",
      appointmentId: "",
      amount: "",
      paymentMethod: "Cash",
      status: "Success",
      notes: ""
    });
    setEditData(null);
  };

  const deletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment record?")) return;
    try {
      await api.delete(`/payments/${paymentId}`);
      toast.success("Payment deleted ✅");
      fetchPayments();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete payment");
    }
  };

  // Calculate totals
  const totalRevenue = payments
    .filter(p => p.status === "Success")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const pendingPayments = payments
    .filter(p => p.status === "Pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Success': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Failed': return '#f44336';
      case 'Refunded': return '#9C27B0';
      default: return '#999';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>💵 Payments & Revenue</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            resetForm();
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
          + Record Payment
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
        gap: "20px",
        marginBottom: "20px"
      }}>
        <motion.div whileHover={{ scale: 1.02 }} style={cardStyle}>
          <h3>Total Revenue</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50" }}>
            ₹{totalRevenue.toLocaleString()}
          </p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} style={cardStyle}>
          <h3>Pending Amount</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#FF9800" }}>
            ₹{pendingPayments.toLocaleString()}
          </p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} style={cardStyle}>
          <h3>Total Transactions</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>{payments.length}</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} style={cardStyle}>
          <h3>Success Rate</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            {payments.length ? 
              ((payments.filter(p => p.status === "Success").length / payments.length) * 100).toFixed(1) 
              : 0}%
          </p>
        </motion.div>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Method</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <motion.tr 
                  key={payment._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={tdStyle}>
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: "bold" }}>
                      {payment.patientId?.name || "N/A"}
                    </div>
                    <small>{payment.patientId?.phone || ""}</small>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "bold" }}>
                    ₹{payment.amount?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>{payment.paymentMethod || "Cash"}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "4px 8px",
                      background: getStatusColor(payment.status),
                      color: "white",
                      borderRadius: "12px",
                      fontSize: "12px"
                    }}>
                      {payment.status}
                    </span>
                  </td>
                  <td style={tdStyle}>{payment.notes || "-"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditData(payment);
                          setForm({
                            patientId: payment.patientId?._id || "",
                            appointmentId: payment.appointmentId?._id || "",
                            amount: payment.amount,
                            paymentMethod: payment.paymentMethod || "Cash",
                            status: payment.status || "Success",
                            notes: payment.notes || ""
                          });
                          setModalOpen(true);
                        }}
                        style={editButtonStyle}
                      >
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => deletePayment(payment._id)}
                        style={{
                          ...editButtonStyle,
                          background: '#f44336',
                          color: 'white'
                        }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={modalOverlayStyle}
          onClick={() => setModalOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            style={modalContentStyle}
            onClick={e => e.stopPropagation()}
          >
            <h2>{editData ? "Edit Payment" : "Record New Payment"}</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Patient *</label>
                <select
                  value={form.patientId}
                  onChange={(e) => setForm({...form, patientId: e.target.value})}
                  style={inputStyle}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.name} - {p.phone}</option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Appointment (Optional)</label>
                <select
                  value={form.appointmentId}
                  onChange={(e) => setForm({...form, appointmentId: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">Select Appointment</option>
                  {appointments
                    .filter(a => a.status !== "Completed")
                    .map(app => (
                      <option key={app._id} value={app._id}>
                        {app.patientName} - {new Date(app.date).toLocaleDateString()}
                      </option>
                    ))}
                  
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Amount (₹) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({...form, amount: e.target.value})}
                  style={inputStyle}
                  required
                  min="0"
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={(e) => setForm({...form, paymentMethod: e.target.value})}
                  style={inputStyle}
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  style={inputStyle}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  style={{ ...inputStyle, minHeight: "80px" }}
                  placeholder="Additional notes..."
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  style={{ ...buttonStyle, background: "#f44336" }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...buttonStyle, background: "#4CAF50" }}
                >
                  {editData ? "Update" : "Save Payment"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Reuse styles from previous components
const cardStyle = {
  padding: "20px",
  background: "white",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const tableHeaderStyle = {
  background: "#f5f5f5"
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "bold"
};

const tdStyle = {
  padding: "12px"
};

const editButtonStyle = {
  padding: "5px 10px",
  background: "#2196F3",
  color: "white",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer"
};

const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContentStyle = {
  background: "white",
  padding: "30px",
  borderRadius: "12px",
  width: "500px",
  maxWidth: "90%",
  maxHeight: "90vh",
  overflowY: "auto"
};

const formGroupStyle = {
  marginBottom: "15px"
};

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold"
};

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ddd"
};

const buttonStyle = {
  padding: "10px 20px",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer"
};

export default Payments;
