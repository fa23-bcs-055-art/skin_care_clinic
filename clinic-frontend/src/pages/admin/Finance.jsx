import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

function Finance() {
  const [activeTab, setActiveTab] = useState('payments');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    methodBreakdown: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load financial stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPKR = (amount) => {
    return `₨${amount?.toLocaleString() || 0}`;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "20px", color: "#2c3e50" }}>💰 Finance Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <motion.div whileHover={{ scale: 1.02, y: -5 }} style={{ padding: "25px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "15px", color: "white", boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)" }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Total Revenue (All Time)</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>{formatPKR(stats.totalRevenue)}</div>
          <div style={{ fontSize: "12px", marginTop: "10px", opacity: 0.8 }}>{stats.successfulTransactions} transactions</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -5 }} style={{ padding: "25px", background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)", borderRadius: "15px", color: "white", boxShadow: "0 10px 30px rgba(253, 160, 133, 0.3)" }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>This Month Revenue</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>{formatPKR(stats.monthlyRevenue)}</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -5 }} style={{ padding: "25px", background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)", borderRadius: "15px", color: "white", boxShadow: "0 10px 30px rgba(132, 250, 176, 0.3)" }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Today's Revenue</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>{formatPKR(stats.todayRevenue)}</div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02, y: -5 }} style={{ padding: "25px", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", borderRadius: "15px", color: "white", boxShadow: "0 10px 30px rgba(240, 147, 251, 0.3)" }}>
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>Pending Amount</div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>{formatPKR(stats.pendingAmount)}</div>
        </motion.div>
      </div>

      {/* Payment Method Breakdown */}
      {Object.keys(stats.methodBreakdown || {}).length > 0 && (
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px", padding: "20px", background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>Payment Methods:</h3>
          {Object.entries(stats.methodBreakdown).map(([method, amount]) => (
            <div key={method}><strong>{method}:</strong> {formatPKR(amount)}</div>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px", flexWrap: "wrap" }}>
        {[
          { id: 'payments', label: '💵 Payments', color: '#2196F3' },
          { id: 'reports', label: '📊 Reports', color: '#FF9800' },
          { id: 'payroll', label: '💼 Payroll', color: '#9c27b0' }
        ].map(tab => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            style={{ padding: "10px 24px", background: activeTab === tab.id ? tab.color : "white", color: activeTab === tab.id ? "white" : "#333", border: activeTab === tab.id ? "none" : "1px solid #ddd", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", boxShadow: activeTab === tab.id ? `0 4px 10px ${tab.color}40` : "none" }}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: "500px" }}>
        <AnimatePresence mode="wait">
          {activeTab === 'payments' && (
            <motion.div key="payments" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <PaymentsModule onRefresh={fetchStats} />
            </motion.div>
          )}
          {activeTab === 'reports' && (
            <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ReportsModule />
            </motion.div>
          )}
          {activeTab === 'payroll' && (
            <motion.div key="payroll" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <PayrollModule />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ==================== PAYMENTS MODULE ====================
// ==================== PAYMENTS MODULE (FIXED - Patient Name) ====================
function PaymentsModule({ onRefresh }) {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [approvalModal, setApprovalModal] = useState(null);
  const [form, setForm] = useState({
    patientId: "", appointmentId: "", serviceId: "", customServiceName: "", customServicePrice: "", amount: "", paymentMethod: "Cash", status: "Pending", notes: ""
  });

  const paymentMethods = ["Cash", "Card", "Easypaisa", "JazzCash", "Bank Transfer"];
  const statuses = ["Pending", "Approved", "Rejected"];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, patientsRes, appointmentsRes, servicesRes] = await Promise.all([
        api.get("/payments"),
        api.get("/patients"),
        api.get("/appointments"),
        api.get("/services")
      ]);
      
      console.log("🔍 Payments Response:", paymentsRes.data);
      
      setPayments(paymentsRes.data || []);
      setPatients(patientsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ FIXED: Better patient name extraction
  const getPatientName = (payment) => {
    // Case 1: patientId is populated object with name
    if (payment?.patientId && typeof payment.patientId === 'object') {
      if (payment.patientId.name) {
        return payment.patientId.name;
      }
      if (payment.patientId.patientName) {
        return payment.patientId.patientName;
      }
    }
    
    // Case 2: patientId is string ID - find in patients list
    if (payment?.patientId && typeof payment.patientId === 'string') {
      const patient = patients.find(p => p._id === payment.patientId);
      if (patient) {
        return patient.name || patient.patientName || "Unknown";
      }
    }
    
    // Case 3: Check if payment has direct patientName field
    if (payment?.patientName) {
      return payment.patientName;
    }
    
    return "Unknown Patient";
  };

  // ✅ FIXED: Better phone extraction
  const getPatientPhone = (payment) => {
    if (payment?.patientId && typeof payment.patientId === 'object') {
      return payment.patientId.phone || payment.patientId.mobile || "";
    }
    
    if (payment?.patientId && typeof payment.patientId === 'string') {
      const patient = patients.find(p => p._id === payment.patientId);
      return patient?.phone || patient?.mobile || "";
    }
    
    return "";
  };

  // ✅ FIXED: Debug function to see what data we have
  const debugPayment = (payment) => {
    console.log("Payment Data:", {
      id: payment._id,
      patientId: payment.patientId,
      patientIdType: typeof payment.patientId,
      amount: payment.amount,
      status: payment.status
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.amount || form.amount <= 0) {
      return toast.error("Please fill required fields with valid amount");
    }
    try {
      // Build payload — if custom service chosen, send as serviceLabel/servicePrice
      const payload = { ...form };
      if (payload.serviceId === '__custom__') {
        payload.serviceId = null;
        payload.serviceLabel = payload.customServiceName || '';
        payload.servicePrice = payload.customServicePrice ? Number(payload.customServicePrice) : null;
        // Auto-fill amount from custom price if amount not already set
        if (!payload.amount && payload.servicePrice) payload.amount = payload.servicePrice;
      } else if (payload.serviceId) {
        // Clear any custom fields if a real service is selected
        payload.serviceLabel = null;
        payload.servicePrice = null;
      }
      delete payload.customServiceName;
      delete payload.customServicePrice;

      if (editData) {
        await api.put(`/payments/${editData._id}`, payload);
        toast.success("Payment updated successfully ✅");
      } else {
        await api.post("/payments", payload);
        toast.success("Payment recorded successfully ✅");
      }
      fetchData();
      if (onRefresh) onRefresh();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.error || "Operation failed ❌");
    }
  };

  const handleApprovePayment = async (payment, remarks = "") => {
    try {
      await api.put(`/payments/${payment._id}/approve`, { remarks });
      toast.success("Payment approved successfully ✅");
      fetchData();
      if (onRefresh) onRefresh();
      setApprovalModal(null);
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(error.response?.data?.error || "Failed to approve payment");
    }
  };

  const handleRejectPayment = async (payment, remarks = "") => {
    try {
      await api.put(`/payments/${payment._id}/reject`, { remarks });
      toast.success("Payment rejected ❌");
      fetchData();
      if (onRefresh) onRefresh();
      setApprovalModal(null);
    } catch (error) {
      console.error("Reject error:", error);
      toast.error(error.response?.data?.error || "Failed to reject payment");
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) return;
    try {
      await api.delete(`/payments/${paymentId}`);
      toast.success("Payment deleted ✅");
      fetchData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Failed to delete payment");
    }
  };

  const resetForm = () => {
    setForm({
      patientId: "", appointmentId: "", serviceId: "", customServiceName: "", customServicePrice: "", amount: "", paymentMethod: "Cash", status: "Pending", notes: ""
    });
    setEditData(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Rejected': return '#f44336';
      default: return '#999';
    }
  };

  const getImageUrl = (screenshotPath) => {
    if (!screenshotPath) return null;
    let cleanPath = screenshotPath.replace(/^\/?api\/?/, '');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    const baseURL = import.meta.env.VITE_API_URL || "https://skin-care-clinic-1.onrender.com/api";
    const baseURLWithoutApi = baseURL.replace('/api', '');
    return `${baseURLWithoutApi}${cleanPath}`;
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ margin: 0 }}>Payment Transactions</h2>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetForm(); setModalOpen(true); }} style={{ padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>+ Record Payment</motion.button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading payments...</div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "8px" }}><p>No payments recorded yet. Click "Record Payment" to add one.</p></div>
      ) : (
        <div className="admin-table-responsive-wrapper" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Date</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Patient</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Service</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Amount</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Method</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Transaction ID</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Screenshot</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold", borderBottom: "2px solid #ddd" }}>Actions</th>
               </tr>
            </thead>
            <tbody>
              {payments.map(payment => {
                // Debug first payment
                if (payments.indexOf(payment) === 0) {
                  debugPayment(payment);
                }
                return (
                  <tr key={payment._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px" }}>{new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "12px" }}>
                      <strong>{getPatientName(payment)}</strong><br/>
                      <small style={{ color: "#666" }}>{getPatientPhone(payment)}</small>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                        {payment.serviceLabel || payment.serviceId?.name || payment.appointmentId?.serviceId?.name || '—'}
                        {(payment.servicePrice || payment.serviceId?.price) ? ` — ₨${(payment.servicePrice || payment.serviceId?.price)?.toLocaleString()}` : ''}
                      </span>
                    </td>
                    <td style={{ padding: "12px", fontWeight: "bold", color: "#4CAF50" }}>₨{payment.amount?.toLocaleString()}</td>
                    <td style={{ padding: "12px" }}><span style={{ padding: "4px 8px", background: "#e3f2fd", borderRadius: "12px", fontSize: "12px" }}>{payment.paymentMethod || "Cash"}</span></td>
                    <td style={{ padding: "12px" }}><small>{payment.transactionId || "N/A"}</small></td>
                    <td style={{ padding: "12px" }}><span style={{ padding: "4px 8px", background: getStatusColor(payment.status), color: "white", borderRadius: "12px", fontSize: "12px" }}>{payment.status || "Pending"}</span></td>
                    <td style={{ padding: "12px" }}>
                      {payment.screenshot ? (
                        <button onClick={() => window.open(getImageUrl(payment.screenshot), '_blank')} style={{ padding: "4px 8px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>📷 View</button>
                      ) : (<span style={{ color: "#999" }}>No file</span>)}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                        <button onClick={() => { setEditData(payment); setForm({ patientId: payment.patientId?._id || payment.patientId || "", appointmentId: payment.appointmentId?._id || "", amount: payment.amount, paymentMethod: payment.paymentMethod || "Cash", status: payment.status || "Pending", notes: payment.notes || "" }); setModalOpen(true); }} style={{ padding: "5px 10px", background: "#2196F3", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>Edit</button>
                        <button onClick={() => handleDeletePayment(payment._id)} style={{ padding: "5px 10px", background: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer" }}>Delete</button>
                        {payment.status === "Pending" && (
                          <>
                            <button onClick={() => setApprovalModal(payment)} style={{ padding: "4px 8px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Approve</button>
                            <button onClick={() => setApprovalModal(payment)} style={{ padding: "4px 8px", background: "#f44336", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "11px" }}>Reject</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal - Same as before */}
      {modalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setModalOpen(false)}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "550px", maxWidth: "90%", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: "20px" }}>{editData ? "Edit Payment" : "Record New Payment"}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Patient *</label><select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} required><option value="">Select Patient</option>{patients.map(p => (<option key={p._id} value={p._id}>{p.name} - {p.phone || 'No phone'}{p.mrNumber ? ` (MR: ${p.mrNumber})` : ''}</option>))}</select></div>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Service (Optional)</label>
                <select
                  value={form.serviceId}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setForm({ ...form, serviceId: '__custom__', customServiceName: '', customServicePrice: '' });
                    } else {
                      const svc = services.find(s => s._id === val);
                      setForm({ ...form, serviceId: val, customServiceName: '', customServicePrice: '', amount: svc?.price || form.amount });
                    }
                  }}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}
                >
                  <option value="">-- Select Service --</option>
                  {services.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name}{s.price ? ` — ₨${s.price.toLocaleString()}` : ''}
                    </option>
                  ))}
                  <option value="__custom__">✏️ Type Custom Service...</option>
                </select>
                {/* Custom service name + price fields */}
                {form.serviceId === '__custom__' && (
                  <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                    <div style={{ flex: 2 }}>
                      <input
                        type="text"
                        placeholder="Service name (e.g. Laser Treatment)"
                        value={form.customServiceName}
                        onChange={(e) => setForm({ ...form, customServiceName: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #4CAF50", boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        type="number"
                        placeholder="Price (₨)"
                        value={form.customServicePrice}
                        onChange={(e) => setForm({ ...form, customServicePrice: e.target.value, amount: e.target.value || form.amount })}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #4CAF50", boxSizing: "border-box" }}
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Appointment (Optional)</label><select value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}><option value="">Select Appointment</option>{appointments.map(app => (<option key={app._id} value={app._id}>{app.patientName} - {new Date(app.appointmentDate || app.date).toLocaleDateString()}</option>))}</select></div>
              <div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Amount (₨) *</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} required min="0" step="0.01" /></div>
              <div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Payment Method</label><select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}>{paymentMethods.map(method => (<option key={method} value={method}>{method}</option>))}</select></div>
              <div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}>{statuses.map(status => (<option key={status} value={status}>{status}</option>))}</select></div>
              <div style={{ marginBottom: "15px" }}><label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", minHeight: "80px" }} placeholder="Additional notes..." /></div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }} style={{ padding: "10px 20px", background: "#f44336", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>{editData ? "Update" : "Save Payment"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {approvalModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setApprovalModal(null)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", width: "500px", maxWidth: "90%", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px", color: "#2A5CAA" }}>🔍 Verify Payment</h3>
            {approvalModal.screenshot ? (
              <div style={{ marginBottom: "20px", textAlign: "center", border: "1px solid #ddd", borderRadius: "8px", padding: "10px", background: "#f8f9fa" }}>
                <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Payment Screenshot:</p>
                <img src={getImageUrl(approvalModal.screenshot)} alt="Payment Screenshot" style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px", border: "1px solid #ddd", cursor: "pointer" }} onClick={() => window.open(getImageUrl(approvalModal.screenshot), '_blank')} onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'; }} />
                <small style={{ color: "#666", display: "block", marginTop: "5px" }}>Click image to enlarge</small>
              </div>
            ) : (
              <div style={{ marginBottom: "20px", padding: "15px", background: "#fff3e0", borderRadius: "8px", textAlign: "center" }}><span style={{ fontSize: "32px" }}>⚠️</span><p style={{ margin: "5px 0 0", color: "#FF9800" }}>No screenshot uploaded</p></div>
            )}
            <div style={{ background: "#f8f9fa", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
              <p><strong>Patient:</strong> {getPatientName(approvalModal)}</p>
              <p><strong>Amount:</strong> <span style={{ color: "#4CAF50", fontWeight: "bold" }}>₨{approvalModal.amount?.toLocaleString()}</span></p>
              <p><strong>Method:</strong> {approvalModal.paymentMethod}</p>
              <p><strong>Service:</strong> {
                approvalModal.serviceLabel
                  ? `${approvalModal.serviceLabel}${approvalModal.servicePrice ? ' — ₨' + approvalModal.servicePrice.toLocaleString() : ''}`
                  : approvalModal.serviceId?.name || approvalModal.appointmentId?.serviceId?.name || 'General Consultation'
              }</p>
              <p><strong>Transaction ID:</strong> {approvalModal.transactionId || "N/A"}</p>
              <p><strong>Payment Date:</strong> {new Date(approvalModal.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
              {approvalModal.notes && <p><strong>Notes:</strong> {approvalModal.notes}</p>}
            </div>
            <div style={{ marginBottom: "20px" }}><label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Admin Remarks (optional)</label><input type="text" id="adminRemarks" placeholder="Add remarks..." style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} /></div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setApprovalModal(null)} style={{ padding: "10px 20px", background: "#999", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleApprovePayment(approvalModal, document.getElementById("adminRemarks")?.value)} style={{ padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>✅ Approve Payment</button>
              <button onClick={() => handleRejectPayment(approvalModal, document.getElementById("adminRemarks")?.value)} style={{ padding: "10px 20px", background: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>❌ Reject Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== REPORTS MODULE ====================
function ReportsModule() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/financial-summary?period=${period}&year=${selectedYear}&month=${selectedMonth}`);
      setSummary(res.data);
    } catch (error) {
      console.error('Failed to load summary:', error);
      toast.error('Failed to load financial summary');
      setSummary({ revenue: 0, expenses: 0, profit: 0, profitMargin: 0, expenseBreakdown: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [period, selectedYear, selectedMonth]);

  const formatPKR = (amount) => `₨${amount?.toLocaleString() || 0}`;

  if (loading) return <div style={{ textAlign: "center", padding: "40px" }}>Loading reports...</div>;
  if (!summary) return <div style={{ textAlign: "center", padding: "40px" }}>No data available</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", alignItems: "center", flexWrap: "wrap", padding: "20px", background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>Period:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>Year:</label>
          <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd", width: "80px" }} />
        </div>
        {(period === 'monthly' || period === 'daily') && (
          <div>
            <label style={{ marginRight: "10px", fontWeight: "bold" }}>Month:</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }}>
              {[...Array(12)].map((_, i) => (<option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>))}
            </select>
          </div>
        )}
        <button onClick={fetchSummary} style={{ padding: "10px 20px", background: "#2196F3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>Refresh</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", background: "#e3f2fd", borderRadius: "12px", borderLeft: "4px solid #2196f3" }}>
          <h3 style={{ color: "#1976d2", margin: 0 }}>💰 Total Revenue</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: "10px 0", color: "#1976d2" }}>{formatPKR(summary.revenue)}</p>
          <small>{summary.revenueCount || 0} transactions</small>
        </div>
        <div style={{ padding: "20px", background: "#fbe9e7", borderRadius: "12px", borderLeft: "4px solid #ff5722" }}>
          <h3 style={{ color: "#e64a19", margin: 0 }}>📉 Total Expenses</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: "10px 0", color: "#e64a19" }}>{formatPKR(summary.expenses)}</p>
          {summary.expenseBreakdown && Object.keys(summary.expenseBreakdown).length > 0 && (
            <small>
              Payroll: {formatPKR(summary.expenseBreakdown.payroll)} | 
              Inventory: {formatPKR(summary.expenseBreakdown.inventory)} |
              Other: {formatPKR(summary.expenseBreakdown.other)}
            </small>
          )}
        </div>
        <div style={{ padding: "20px", background: "#e8f5e9", borderRadius: "12px", borderLeft: "4px solid #4caf50" }}>
          <h3 style={{ color: "#388e3c", margin: 0 }}>📈 Net Profit</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: "10px 0", color: summary.profit >= 0 ? "#388e3c" : "#d32f2f" }}>{formatPKR(summary.profit)}</p>
          <small>Margin: {summary.profitMargin || 0}%</small>
        </div>
      </div>

      {summary.methodBreakdown && Object.keys(summary.methodBreakdown).length > 0 && (
        <div style={{ padding: "20px", background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "15px" }}>Payment Methods Breakdown</h3>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {Object.entries(summary.methodBreakdown).map(([method, amount]) => (
              <div key={method} style={{ padding: "10px 15px", background: "#f5f5f5", borderRadius: "8px" }}>
                <strong>{method}:</strong> {formatPKR(amount)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== PAYROLL MODULE ====================
// ==================== PAYROLL MODULE (FIXED FOR YOUR SCHEMA) ====================
function PayrollModule() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [formData, setFormData] = useState({ basicSalary: 0, allowances: [], deductions: [] });
  const [allowanceInput, setAllowanceInput] = useState({ name: '', amount: '' });
  const [deductionInput, setDeductionInput] = useState({ name: '', amount: '' });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salarySlips, setSalarySlips] = useState([]);
  const [summary, setSummary] = useState({ totalPayroll: 0, approved: 0, paid: 0 });
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Allowed staff roles (No Patients)
  const allowedRoles = ['Admin', 'SuperAdmin', 'Doctor', 'Nurse', 'Accountant', 'Receptionist', 'staff'];

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payroll/employees');
      const filteredEmployees = res.data.filter(emp => 
        allowedRoles.includes(emp.user.role)
      );
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryBatch = async () => {
    try {
      const res = await api.get(`/payroll/batch?month=${month}&year=${year}`);
      console.log('📊 Salary Slips Data:', res.data);
      
      // Handle both possible response structures
      const slips = res.data.slips || res.data || [];
      setSalarySlips(slips);
      setSummary(res.data.summary || { totalPayroll: 0, approved: 0, paid: 0 });
    } catch (error) {
      console.error('Failed to fetch salary batch:', error);
      setSalarySlips([]);
      setSummary({ totalPayroll: 0, approved: 0, paid: 0 });
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchSalaryBatch();
  }, [month, year]);

  const handleOpenConfig = (employee) => {
    setSelectedEmployee(employee);
    if (employee.config) {
      setFormData({
        basicSalary: employee.config.basicSalary || 0,
        allowances: employee.config.allowances || [],
        deductions: employee.config.deductions || []
      });
    } else {
      setFormData({ basicSalary: 40000, allowances: [], deductions: [] });
    }
    setAllowanceInput({ name: '', amount: '' });
    setDeductionInput({ name: '', amount: '' });
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedEmployee) return;
    if (formData.basicSalary <= 0) {
      toast.error('Please enter basic salary');
      return;
    }
    try {
      await api.post(`/payroll/config/${selectedEmployee.user._id}`, formData);
      toast.success('Salary configuration saved successfully');
      fetchEmployees();
      setShowConfigModal(false);
    } catch (error) {
      console.error('Save config error:', error);
      toast.error('Failed to save configuration');
    }
  };

  const handleGenerateSalary = async () => {
    setGenerating(true);
    try {
      await api.post('/payroll/generate', { month, year });
      toast.success('Salary slips generated successfully');
      await fetchSalaryBatch();
      setShowGenerateModal(false);
    } catch (error) {
      console.error('Generate error:', error);
      toast.error(error.response?.data?.error || 'Failed to generate salary slips');
    } finally {
      setGenerating(false);
    }
  };

  // ✅ FIXED: Correct API endpoint for status update
  const handleUpdateSalaryStatus = async (slipId, newStatus) => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      await api.put(`/payroll/slips/${slipId}/status`, { status: newStatus });
      toast.success(`Salary ${newStatus.toLowerCase()} successfully ✅`);
      await fetchSalaryBatch();
    } catch (error) {
      console.error('Failed to update salary status:', error);
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setActionInProgress(false);
    }
  };

  const addAllowance = () => {
    if (allowanceInput.name && allowanceInput.amount > 0) {
      setFormData({ ...formData, allowances: [...formData.allowances, { ...allowanceInput, amount: Number(allowanceInput.amount) }] });
      setAllowanceInput({ name: '', amount: '' });
    }
  };

  const removeAllowance = (index) => {
    const newAllowances = [...formData.allowances];
    newAllowances.splice(index, 1);
    setFormData({ ...formData, allowances: newAllowances });
  };

  const addDeduction = () => {
    if (deductionInput.name && deductionInput.amount > 0) {
      setFormData({ ...formData, deductions: [...formData.deductions, { ...deductionInput, amount: Number(deductionInput.amount) }] });
      setDeductionInput({ name: '', amount: '' });
    }
  };

  const removeDeduction = (index) => {
    const newDeductions = [...formData.deductions];
    newDeductions.splice(index, 1);
    setFormData({ ...formData, deductions: newDeductions });
  };

  const totalAllowances = formData.allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = formData.deductions.reduce((sum, d) => sum + d.amount, 0);
  const netSalary = formData.basicSalary + totalAllowances - totalDeductions;
  const totalPayroll = salarySlips.reduce((sum, slip) => sum + (slip.netSalary || 0), 0);

  const getSalaryStatusColor = (status) => {
    switch (status) {
      case 'Approved': return '#4CAF50';
      case 'Paid': return '#2196F3';
      case 'Draft': return '#FF9800';
      default: return '#FF9800';
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px" }}>
        <h2 style={{ margin: 0 }}>💼 Payroll Management</h2>
        <button onClick={() => setShowGenerateModal(true)} style={{ padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>📅 Generate Monthly Salary</button>
      </div>

      {/* Month/Year Selector */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "25px", alignItems: "center", flexWrap: "wrap", padding: "15px", background: "#f5f5f5", borderRadius: "8px" }}>
        <div>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>Month:</label>
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} style={{ padding: "8px 15px", borderRadius: "6px", border: "1px solid #ddd" }}>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>Year:</label>
          <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ padding: "8px 15px", borderRadius: "6px", border: "1px solid #ddd", width: "80px" }} />
        </div>
        <button onClick={fetchSalaryBatch} style={{ padding: "8px 20px", background: "#2196F3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>Refresh</button>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px", background: "#3f51b5", color: "white", padding: "20px", borderRadius: "12px", flexWrap: "wrap" }}>
        <div><strong>Total Payroll:</strong> ₨{(summary.totalPayroll || totalPayroll).toLocaleString()}</div>
        <div><strong>Approved:</strong> {summary.approved || salarySlips.filter(s => s.status === 'Approved').length}</div>
        <div><strong>Paid:</strong> {summary.paid || salarySlips.filter(s => s.status === 'Paid').length}</div>
        <div><strong>Draft:</strong> {salarySlips.filter(s => s.status === 'Draft').length}</div>
      </div>

      {/* Generated Salary Slips Section - FIXED for your schema */}
      {salarySlips.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <div style={{ padding: "20px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "12px", color: "white", marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0" }}>Salary Summary - {new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })} {year}</h3>
          </div>

          <h3 style={{ marginBottom: "15px" }}>Generated Salary Slips</h3>
          <div className="admin-table-responsive-wrapper" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Employee</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Role</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Basic Salary</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Allowances</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Deductions</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Net Salary</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {salarySlips.map((slip) => {
                  // ✅ FIXED: Use correct field names from your schema
                  // Your schema uses: allowanceDetails, deductionDetails, totalAllowances, totalDeductions
                  const allowanceDetails = slip.allowanceDetails || [];
                  const deductionDetails = slip.deductionDetails || [];
                  const totalAllow = slip.totalAllowances || allowanceDetails.reduce((s, a) => s + (a.amount || 0), 0);
                  const totalDed = slip.totalDeductions || deductionDetails.reduce((s, d) => s + (d.amount || 0), 0);
                  
                  return (
                    <tr key={slip._id} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "12px" }}>
                        <strong>{slip.userId?.name || 'Unknown'}</strong>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "4px 8px", background: "#e3f2fd", borderRadius: "12px", fontSize: "12px" }}>
                          {slip.userId?.role || '-'}
                        </span>
                      </td>
                      <td style={{ padding: "12px", fontWeight: "bold" }}>₨{(slip.basicSalary || 0).toLocaleString()}</td>
                      <td style={{ padding: "12px" }}>
                        <div><strong>₨{totalAllow.toLocaleString()}</strong></div>
                        {allowanceDetails.length > 0 && (
                          <small style={{ color: "#666", display: "block", fontSize: "11px" }}>
                            {allowanceDetails.map((a, idx) => (
                              <div key={idx}>📈 {a.name}: ₨{a.amount.toLocaleString()}</div>
                            ))}
                          </small>
                        )}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div><strong>₨{totalDed.toLocaleString()}</strong></div>
                        {deductionDetails.length > 0 && (
                          <small style={{ color: "#666", display: "block", fontSize: "11px" }}>
                            {deductionDetails.map((d, idx) => (
                              <div key={idx}>📉 {d.name}: ₨{d.amount.toLocaleString()}</div>
                            ))}
                          </small>
                        )}
                      </td>
                      <td style={{ padding: "12px", fontWeight: "bold", color: "#4CAF50", fontSize: "16px" }}>
                        ₨{(slip.netSalary || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "4px 8px", background: getSalaryStatusColor(slip.status), color: "white", borderRadius: "12px", fontSize: "12px" }}>
                          {slip.status || 'Draft'}
                        </span>
                      </td>
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {slip.status === 'Draft' && (
                            <button 
                              onClick={() => handleUpdateSalaryStatus(slip._id, 'Approved')} 
                              disabled={actionInProgress}
                              style={{ padding: "5px 12px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                            >
                              ✅ Approve
                            </button>
                          )}
                          {slip.status === 'Approved' && (
                            <button 
                              onClick={() => handleUpdateSalaryStatus(slip._id, 'Paid')} 
                              disabled={actionInProgress}
                              style={{ padding: "5px 12px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                            >
                              💰 Mark as Paid
                            </button>
                          )}
                          {slip.status === 'Paid' && (
                            <span style={{ color: "#4CAF50", fontSize: "12px", fontWeight: "bold" }}>✓ Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: "15px" }}>Employee Salary Configuration</h3>
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading employees...</div>
      ) : employees.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#f9f9f9", borderRadius: "8px" }}>
          <p>No employees found. Make sure users with admin/doctor/staff roles exist (patients are excluded).</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Role</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Basic Salary</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Allowances</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Deductions</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Net Salary</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Actions</th>
               </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const config = emp.config;
                const totalAllow = config?.allowances?.reduce((s, a) => s + a.amount, 0) || 0;
                const totalDed = config?.deductions?.reduce((s, d) => s + d.amount, 0) || 0;
                const net = (config?.basicSalary || 0) + totalAllow - totalDed;
                return (
                  <tr key={emp.user._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px" }}>{emp.user.name}</td>
                    <td style={{ padding: "12px" }}>{emp.user.role}</td>
                    <td style={{ padding: "12px" }}>₨{(config?.basicSalary || 0).toLocaleString()}</td>
                    <td style={{ padding: "12px" }}>
                      ₨{totalAllow.toLocaleString()}
                      {config?.allowances?.length > 0 && (
                        <small style={{ display: "block", color: "#666" }}>
                          {config.allowances.map(a => a.name).join(', ')}
                        </small>
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      ₨{totalDed.toLocaleString()}
                      {config?.deductions?.length > 0 && (
                        <small style={{ display: "block", color: "#666" }}>
                          {config.deductions.map(d => d.name).join(', ')}
                        </small>
                      )}
                    </td>
                    <td style={{ padding: "12px", fontWeight: "bold", color: "#4CAF50" }}>₨{net.toLocaleString()}</td>
                    <td style={{ padding: "12px" }}>
                      <button onClick={() => handleOpenConfig(emp)} style={{ padding: "6px 12px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                        {emp.config ? 'Edit Config' : 'Set Salary'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Salary Configuration Modal */}
      {showConfigModal && selectedEmployee && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowConfigModal(false)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", width: "600px", maxWidth: "90%", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "10px" }}>Salary Configuration</h3>
            <p style={{ marginBottom: "20px", color: "#666" }}><strong>{selectedEmployee.user.name}</strong> - {selectedEmployee.user.role}</p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Basic Salary (₨) *</label>
              <input type="number" value={formData.basicSalary} onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd" }} min="0" step="1000" />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Allowances (Additions)</label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input type="text" placeholder="Allowance name" value={allowanceInput.name} onChange={(e) => setAllowanceInput({ ...allowanceInput, name: e.target.value })} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
                <input type="number" placeholder="Amount" value={allowanceInput.amount} onChange={(e) => setAllowanceInput({ ...allowanceInput, amount: parseFloat(e.target.value) || 0 })} style={{ width: "120px", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
                <button onClick={addAllowance} style={{ padding: "8px 15px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Add</button>
              </div>
              {formData.allowances.map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", background: "#e8f5e9", borderRadius: "4px", marginBottom: "5px" }}>
                  <span>{a.name}: ₨{a.amount.toLocaleString()}</span>
                  <button onClick={() => removeAllowance(i)} style={{ background: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", padding: "2px 8px" }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Deductions (Deductions)</label>
              <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                <input type="text" placeholder="Deduction name" value={deductionInput.name} onChange={(e) => setDeductionInput({ ...deductionInput, name: e.target.value })} style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
                <input type="number" placeholder="Amount" value={deductionInput.amount} onChange={(e) => setDeductionInput({ ...deductionInput, amount: parseFloat(e.target.value) || 0 })} style={{ width: "120px", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }} />
                <button onClick={addDeduction} style={{ padding: "8px 15px", background: "#FF9800", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Add</button>
              </div>
              {formData.deductions.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", background: "#fff3e0", borderRadius: "4px", marginBottom: "5px" }}>
                  <span>{d.name}: ₨{d.amount.toLocaleString()}</span>
                  <button onClick={() => removeDeduction(i)} style={{ background: "#f44336", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", padding: "2px 8px" }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ padding: "15px", background: "#e3f2fd", borderRadius: "8px", marginBottom: "20px" }}>
              <strong>Net Salary Calculation:</strong><br />
              Basic: ₨{formData.basicSalary.toLocaleString()}<br />
              + Allowances: ₨{totalAllowances.toLocaleString()}<br />
              - Deductions: ₨{totalDeductions.toLocaleString()}<br />
              <hr style={{ margin: "8px 0" }} />
              <span style={{ fontSize: "18px", fontWeight: "bold", color: "#4CAF50" }}>Net Salary: ₨{netSalary.toLocaleString()}</span>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowConfigModal(false)} style={{ padding: "10px 20px", background: "#999", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSaveConfig} style={{ padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Salary Modal */}
      {showGenerateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowGenerateModal(false)}>
          <div style={{ background: "white", borderRadius: "12px", padding: "25px", width: "400px", maxWidth: "90%" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: "15px" }}>Generate Monthly Salary</h3>
            <p>Generate salary slips for {new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' })} {year}?</p>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "20px" }}>This will create salary slips for all employees with configured salaries.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowGenerateModal(false)} style={{ padding: "10px 20px", background: "#999", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleGenerateSalary} disabled={generating} style={{ padding: "10px 20px", background: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: generating ? "not-allowed" : "pointer", opacity: generating ? 0.6 : 1 }}>
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finance;
