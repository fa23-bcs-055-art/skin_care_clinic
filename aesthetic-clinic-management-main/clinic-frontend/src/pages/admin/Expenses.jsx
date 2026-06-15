import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "Cash",
    notes: ""
  });

  const categories = [
    "Rent",
    "Utilities",
    "Salaries",
    "Equipment",
    "Supplies",
    "Maintenance",
    "Marketing",
    "Other"
  ];

  const paymentMethods = ["Cash", "Card", "Bank Transfer", "Cheque"];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (error) {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.description || !form.amount) {
      return toast.error("Please fill required fields");
    }

    try {
      if (editData) {
        await api.put(`/expenses/${editData._id}`, form);
        toast.success("Expense updated ✅");
      } else {
        await api.post("/expenses", form);
        toast.success("Expense added ✅");
      }
      
      fetchExpenses();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Operation failed ❌");
    }
  };

  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    
    try {
      await api.delete(`/expenses/${id}`);
      toast.success("Expense deleted ✅");
      fetchExpenses();
    } catch (error) {
      toast.error("Delete failed ❌");
    }
  };

  const resetForm = () => {
    setForm({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "Cash",
      notes: ""
    });
    setEditData(null);
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const thisMonth = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  }).reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>💰 Expenses Management</h1>
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
          + Add Expense
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "20px"
      }}>
        <motion.div whileHover={{ scale: 1.02 }} style={cardStyle}>
          <h3>Total Expenses</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>₹{totalExpenses.toLocaleString()}</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} style={cardStyle}>
          <h3>This Month</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>₹{thisMonth.toLocaleString()}</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} style={cardStyle}>
          <h3>Average per Expense</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold" }}>
            ₹{expenses.length ? (totalExpenses / expenses.length).toFixed(2) : 0}
          </p>
        </motion.div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Payment Method</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <motion.tr 
                  key={expense._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={tdStyle}>{new Date(expense.date).toLocaleDateString()}</td>
                  <td style={tdStyle}>{expense.description}</td>
                  <td style={tdStyle}>
                    <span style={categoryBadgeStyle}>
                      {expense.category || "Other"}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: "bold", color: "#f44336" }}>
                    ₹{expense.amount?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>{expense.paymentMethod || "Cash"}</td>
                  <td style={tdStyle}>{expense.notes || "-"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditData(expense);
                          setForm({
                            description: expense.description,
                            amount: expense.amount,
                            category: expense.category || "",
                            date: expense.date.split('T')[0],
                            paymentMethod: expense.paymentMethod || "Cash",
                            notes: expense.notes || ""
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
                        onClick={() => deleteExpense(expense._id)}
                        style={deleteButtonStyle}
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
            <h2>{editData ? "Edit Expense" : "Add New Expense"}</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Description *</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  style={inputStyle}
                  required
                />
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
                <label style={labelStyle}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({...form, category: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({...form, date: e.target.value})}
                  style={inputStyle}
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
                <label style={labelStyle}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  style={{ ...inputStyle, minHeight: "80px" }}
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
                  {editData ? "Update" : "Save"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Styles
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
  cursor: "pointer",
  marginRight: "5px"
};

const deleteButtonStyle = {
  padding: "5px 10px",
  background: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "3px",
  cursor: "pointer"
};

const categoryBadgeStyle = {
  padding: "4px 8px",
  background: "#e3f2fd",
  color: "#1976d2",
  borderRadius: "12px",
  fontSize: "12px"
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

export default Expenses;