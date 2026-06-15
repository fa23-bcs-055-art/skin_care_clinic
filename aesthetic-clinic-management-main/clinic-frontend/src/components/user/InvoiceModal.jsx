import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";

function InvoiceModal({ payment, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [payment]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/payment/${payment._id}`);
      setInvoice(response.data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast.error("Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("invoice-content");
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const handleDownload = () => {
    const invoiceElement = document.getElementById("invoice-content");
    const htmlContent = invoiceElement.innerHTML;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice?.invoiceNumber || payment._id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: "white",
          borderRadius: "16px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <div className="spinner"></div>
            <p>Loading invoice...</p>
          </div>
        ) : invoice ? (
          <>
            <div id="invoice-content" style={{ padding: "30px" }}>
              {/* Invoice Header */}
              <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "20px" }}>
                <h1 style={{ margin: 0, color: "#2A5CAA" }}>Aesthetics Clinic</h1>
                <p style={{ margin: "5px 0", color: "#666" }}>Invoice</p>
              </div>

              {/* Invoice Details */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div>
                    <strong>Invoice Number:</strong> {invoice.invoiceNumber}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Patient Name:</strong> {invoice.patientId?.name || "Patient"}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <span style={{ color: "#4CAF50", marginLeft: "5px" }}>{invoice.status}</span>
                </div>
              </div>

              {/* Invoice Items */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                <thead>
                  <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                    <th style={{ padding: "10px", textAlign: "left" }}>Description</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Quantity</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Unit Price</th>
                    <th style={{ padding: "10px", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{item.description}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>{item.quantity}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>₨{item.unitPrice?.toLocaleString()}</td>
                      <td style={{ padding: "10px", textAlign: "right" }}>₨{item.total?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "2px solid #ddd", fontWeight: "bold" }}>
                    <td colSpan="3" style={{ padding: "10px", textAlign: "right" }}>Total Amount:</td>
                    <td style={{ padding: "10px", textAlign: "right", color: "#4CAF50" }}>₨{invoice.total?.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Payment Details */}
              <div style={{ marginTop: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "8px" }}>
                <h4 style={{ margin: "0 0 10px", color: "#333" }}>Payment Details</h4>
                <div><strong>Amount Paid:</strong> ₨{payment.amount?.toLocaleString()}</div>
                <div><strong>Payment Method:</strong> {payment.paymentMethod}</div>
                <div><strong>Transaction ID:</strong> {payment.transactionId}</div>
                <div><strong>Payment Date:</strong> {new Date(payment.paymentDate).toLocaleString()}</div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: "30px", textAlign: "center", fontSize: "12px", color: "#999", borderTop: "1px solid #eee", paddingTop: "20px" }}>
                <p>Thank you for choosing Aesthetics Clinic!</p>
                <p>For any queries, please contact us at support@aestheticsclinic.com</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: "20px", borderTop: "1px solid #eee", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={handlePrint}
                style={{
                  padding: "10px 20px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                🖨️ Print
              </button>
              <button
                onClick={handleDownload}
                style={{
                  padding: "10px 20px",
                  background: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                📥 Download
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 20px",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px" }}>
            <p>No invoice found for this payment</p>
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginTop: "20px"
              }}
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default InvoiceModal;