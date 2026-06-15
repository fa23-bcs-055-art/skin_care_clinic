import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const statuses = ["All", "Approved", "Pending"];

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments/my-payments");
      setPayments(res.data || []);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (paymentId) => {
    try {
      console.log("Fetching invoice for payment:", paymentId);
      const response = await api.get(`/invoices/payment/${paymentId}`);
      console.log("Invoice response:", response.data);
      
      if (response.data) {
        setSelectedInvoice(response.data);
        setShowInvoiceModal(true);
      } else {
        toast.error("No invoice found for this payment");
      }
    } catch (error) {
      console.error("Invoice fetch error:", error);
      toast.error(error.response?.data?.error || "Failed to load invoice");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "#4CAF50";
      case "Pending": return "#FF9800";
      default: return "#999";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "Approved": return "#e8f5e9";
      case "Pending": return "#fff3e0";
      default: return "#f5f5f5";
    }
  };

  const filteredPayments = payments.filter(
    p => filterStatus === "All" || p.status === filterStatus
  );
  
  const totalPaid = payments
    .filter(p => p.status === "Approved")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const handlePrintInvoice = () => {
    const printContent = document.getElementById("invoice-print-content");
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      
      <h1 style={{ marginBottom: "20px" }}>💰 Payment History</h1>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ padding: "20px", background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "14px", color: "#666" }}>Total Paid</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4CAF50" }}>₨{totalPaid.toLocaleString()}</div>
        </div>
        <div style={{ padding: "20px", background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: "14px", color: "#666" }}>Total Transactions</div>
          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2A5CAA" }}>{payments.length}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
              background: filterStatus === status ? "#2A5CAA" : "#f0f0f0",
              color: filterStatus === status ? "white" : "#333"
            }}
          >
            {status} ({payments.filter(p => status === "All" || p.status === status).length})
          </button>
        ))}
      </div>

      {/* Payments List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : filteredPayments.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {filteredPayments.map(payment => (
            <motion.div
              key={payment._id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${getStatusColor(payment.status)}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                    {new Date(payment.paymentDate).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>
                    {payment.paymentMethod} • {payment.appointment?.serviceName || "Consultation"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#4CAF50" }}>
                    ₨{payment.amount?.toLocaleString()}
                  </div>
                  <div style={{ marginTop: "8px" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      background: getStatusBg(payment.status),
                      color: getStatusColor(payment.status)
                    }}>
                      {payment.status}
                    </span>
                    {payment.status === "Approved" && (
                      <button
                        onClick={() => handleViewInvoice(payment._id)}
                        style={{
                          marginLeft: "10px",
                          padding: "6px 14px",
                          background: "#2196F3",
                          color: "white",
                          border: "none",
                          borderRadius: "20px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        📄 View Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "60px", background: "#f9f9f9", borderRadius: "12px" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>💳</div>
          <h3>No Payment History</h3>
          <p>When your appointments are confirmed, payments will appear here.</p>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, padding: "20px"
        }} onClick={() => setShowInvoiceModal(false)}>
          <div style={{ 
            background: "white", borderRadius: "16px", maxWidth: "600px", 
            width: "100%", maxHeight: "90vh", overflow: "auto",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
          }} onClick={e => e.stopPropagation()}>
            
            {/* Invoice Content for Printing */}
            <div id="invoice-print-content" style={{ padding: "30px" }}>
              {/* Header */}
              <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
                <h2 style={{ margin: 0, color: "#2A5CAA" }}>Aesthetics Clinic</h2>
                <p style={{ margin: "5px 0", color: "#666" }}>123 Healthcare Street, Lahore</p>
                <p style={{ margin: 0, color: "#666" }}>Phone: +92 300 1234567</p>
                <h3 style={{ margin: "15px 0 0", color: "#333" }}>INVOICE</h3>
              </div>

              {/* Invoice Details */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap" }}>
                  <div><strong>Invoice #:</strong> {selectedInvoice.invoiceNumber}</div>
                  <div><strong>Date:</strong> {new Date(selectedInvoice.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Patient Name:</strong> {selectedInvoice.patientId?.name || "Patient"}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Patient Phone:</strong> {selectedInvoice.patientId?.phone || "N/A"}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span style={{ color: "#4CAF50", marginLeft: "5px", fontWeight: "bold" }}>{selectedInvoice.status}</span>
                </div>
              </div>

              {/* Invoice Items Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>Description</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Qty</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Unit Price</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{item.description}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>{item.quantity}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>₨{item.unitPrice?.toLocaleString()}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>₨{item.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {selectedInvoice.subtotal > 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: "8px", textAlign: "right" }}>Subtotal:</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>₨{selectedInvoice.subtotal?.toLocaleString()}</td>
                    </tr>
                  )}
                  {selectedInvoice.tax > 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: "8px", textAlign: "right" }}>Tax ({selectedInvoice.taxRate || 0}%):</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>₨{selectedInvoice.tax?.toLocaleString()}</td>
                    </tr>
                  )}
                  {selectedInvoice.discount > 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: "8px", textAlign: "right" }}>Discount:</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>-₨{selectedInvoice.discount?.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr style={{ borderTop: "2px solid #ddd", fontWeight: "bold" }}>
                    <td colSpan="3" style={{ padding: "10px", textAlign: "right", fontSize: "16px" }}>Total Amount:</td>
                    <td style={{ padding: "10px", textAlign: "right", fontSize: "16px", color: "#4CAF50" }}>
                      ₨{selectedInvoice.total?.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Footer */}
              <div style={{ marginTop: "30px", textAlign: "center", fontSize: "12px", color: "#999", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                <p>Thank you for choosing Aesthetics Clinic!</p>
                <p>For any queries, please contact us at support@aestheticsclinic.com</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: "20px", borderTop: "1px solid #eee", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={handlePrintInvoice}
                style={{
                  padding: "10px 20px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                style={{
                  padding: "10px 20px",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default Payments;