import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../services/api";

function Payroll() {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees' or 'processing'
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [batchData, setBatchData] = useState({ slips: [], summary: {} });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [salaryConfig, setSalaryConfig] = useState({ basicSalary: 0, allowances: [], deductions: [] });

  // 1. Sirf Staff Roles dikhane ke liye (No Patients)
  const allowedRoles = ['Admin', 'SuperAdmin', 'Doctor', 'Nurse', 'Accountant', 'Receptionist'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, batchRes] = await Promise.all([
        api.get('/payroll/employees'),
        api.get(`/payroll/batch?month=${selectedMonth}&year=${selectedYear}`)
      ]);
      
      // Filter Patients out
      const staffOnly = empRes.data.filter(emp => allowedRoles.includes(emp.user.role));
      setEmployees(staffOnly);
      setBatchData(batchRes.data);
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const generatePayroll = async () => {
    try {
      setLoading(true);
      await api.post('/payroll/generate', { month: selectedMonth, year: selectedYear });
      toast.success('Salary slips generated! Now check Monthly Slips tab.');
      fetchData();
      setActiveTab('processing'); // Auto switch to processing tab
    } catch (error) {
      toast.error('Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (slipId, status) => {
    try {
      await api.put(`/payroll/slips/${slipId}/status`, { status });
      toast.success(`Salary ${status} ✅`);
      fetchData(); // Refresh data to update Finance Reports
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const saveConfig = async () => {
    try {
      await api.post(`/payroll/config/${editingEmployee._id}`, salaryConfig);
      toast.success('Configuration saved');
      setEditingEmployee(null);
      fetchData();
    } catch (error) {
      toast.error('Error saving');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>💼 Payroll Management</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveTab('employees')} style={{ ...btn, background: activeTab === 'employees' ? '#2196F3' : '#ddd', color: activeTab === 'employees' ? 'white' : 'black' }}>
            1. Staff Config
          </button>
          <button onClick={() => setActiveTab('processing')} style={{ ...btn, background: activeTab === 'processing' ? '#4CAF50' : '#ddd', color: activeTab === 'processing' ? 'white' : 'black' }}>
            2. Monthly Slips (Approve Here)
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', background: '#3f51b5', color: 'white', padding: '20px', borderRadius: '12px' }}>
        <div><strong>Total Payroll:</strong> ₨{batchData.summary?.totalPayroll?.toLocaleString() || 0}</div>
        <div><strong>Approved:</strong> {batchData.summary?.approved || 0}</div>
        <div><strong>Paid:</strong> {batchData.summary?.paid || 0}</div>
        <div style={{ marginLeft: 'auto' }}>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} style={{ padding: '5px', borderRadius: '4px' }}>
                <option value="5">May</option>
                <option value="6">June</option>
            </select>
            <button onClick={generatePayroll} style={{ marginLeft: '10px', padding: '5px 15px', background: 'white', color: '#3f51b5', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                Generate Slips
            </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'employees' ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="conf">
            <h3>Staff Configuration</h3>
            <table style={tbl}>
              <thead style={head}>
                <tr><th>Name</th><th>Role</th><th>Basic Salary</th><th>Net</th><th>Action</th></tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.user._id} style={row}>
                    <td>{emp.user.name}</td>
                    <td>{emp.user.role}</td>
                    <td>₨{emp.config?.basicSalary || 0}</td>
                    <td>₨{(emp.config?.basicSalary || 0) + (emp.config?.allowances?.reduce((a,b)=>a+b.amount,0)||0)}</td>
                    <td><button onClick={() => { setEditingEmployee(emp.user); setSalaryConfig(emp.config || { basicSalary: 40000 }); }} style={editBtn}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="proc">
            <h3>Generated Slips for Approval</h3>
            <table style={tbl}>
              <thead style={head}>
                <tr><th>Employee</th><th>Net Salary</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {batchData.slips?.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No slips generated yet. Go to Config and click Generate.</td></tr>
                ) : batchData.slips.map(slip => (
                  <tr key={slip._id} style={row}>
                    <td>{slip.userId?.name}</td>
                    <td>₨{slip.netSalary?.toLocaleString()}</td>
                    <td><b style={{ color: slip.status === 'Paid' ? 'green' : 'orange' }}>{slip.status}</b></td>
                    <td>
                      {slip.status === 'Draft' && <button onClick={() => updateStatus(slip._id, 'Approved')} style={apprvBtn}>Approve Now</button>}
                      {slip.status === 'Approved' && <button onClick={() => updateStatus(slip._id, 'Paid')} style={paidBtn}>Mark Paid</button>}
                      {slip.status === 'Paid' && <span>✅ Processed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimal Edit Modal */}
      {editingEmployee && (
        <div style={ovrl}>
          <div style={cnt}>
            <h4>Update Salary: {editingEmployee.name}</h4>
            <input type="number" value={salaryConfig.basicSalary} onChange={e => setSalaryConfig({...salaryConfig, basicSalary: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
            <button onClick={saveConfig} style={{ width: '100%', background: '#4CAF50', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}>Save Changes</button>
            <button onClick={() => setEditingEmployee(null)} style={{ width: '100%', background: '#999', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', marginTop: '5px' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal Styles
const btn = { padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
const tbl = { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' };
const head = { background: '#f5f5f5', textAlign: 'left' };
const row = { borderBottom: '1px solid #eee' };
const editBtn = { background: '#2196F3', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' };
const apprvBtn = { background: '#FF9800', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' };
const paidBtn = { background: '#4CAF50', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' };
const ovrl = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const cnt = { background: 'white', padding: '30px', borderRadius: '12px', width: '300px' };

export default Payroll;