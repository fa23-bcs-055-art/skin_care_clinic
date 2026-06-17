import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../services/api";

function AddEmployeeModal({ isOpen, onClose, refresh }) {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        roleId: "",
        department: "",
        baseSalary: 0,
        joiningDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen) {
            fetchRoles();
        }
    }, [isOpen]);

    const fetchRoles = async () => {
        try {
            const res = await api.get('/roles');
            // Filter only employee roles
            const employeeRoles = res.data.filter(role =>
                ['SuperAdmin', 'Admin', 'Doctor', 'Nurse', 'Receptionist', 'Accountant'].includes(role.roleName)
            );
            setRoles(employeeRoles);
        } catch (error) {
            toast.error("Failed to load roles");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.roleId) {
            toast.error("Please fill all required fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            // Create user
            const userData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                roleId: formData.roleId,
                department: formData.department,
                status: 'active'
            };

            const userRes = await api.post('/users', userData);
            const userId = userRes.data.user?._id || userRes.data._id;

            if (userId && formData.baseSalary > 0) {
                // Save salary configuration
                await api.post(`/payroll/config/${userId}`, {
                    basicSalary: formData.baseSalary,
                    allowances: [],
                    deductions: [],
                    bankDetails: { bankName: '', accountTitle: '', accountNumber: '' }
                });
            }

            toast.success(`Employee ${formData.name} added successfully!`);
            onClose();
            refresh();

        } catch (error) {
            console.error('Add employee error:', error);
            toast.error(error.response?.data?.error || "Failed to add employee");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={modalOverlay} onClick={onClose}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={modalContent}
                onClick={e => e.stopPropagation()}
            >
                <h2 style={modalTitle}>➕ Add New Employee</h2>

                <form onSubmit={handleSubmit}>
                    <div style={formGrid}>
                        <div style={formGroup}>
                            <label style={label}>Full Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={formGroup}>
                            <label style={label}>Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={formGroup}>
                            <label style={label}>Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={inputStyle}
                            />
                        </div>

                        <div style={formGroup}>
                            <label style={label}>Role *</label>
                            <select
                                value={formData.roleId}
                                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                                style={inputStyle}
                                required
                            >
                                <option value="">Select Role</option>
                                {roles.map(role => (
                                    <option key={role._id} value={role._id}>{role.roleName}</option>
                                ))}
                            </select>
                        </div>

                        <div style={formGroup}>
                            <label style={label}>Department</label>
                            <input
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                style={inputStyle}
                                placeholder="e.g., Cardiology, Emergency"
                            />
                        </div>

                        <div style={formGroup}>
                            <label style={label}>Base Salary (₨)</label>
                            <input
                                type="number"
                                value={formData.baseSalary}
                                onChange={(e) => setFormData({ ...formData, baseSalary: parseInt(e.target.value) })}
                                style={inputStyle}
                                placeholder="0"
                            />
                        </div>

                        <div style={formGroup}>
                            <label style={label}>Joining Date</label>
                            <input
                                type="date"
                                value={formData.joiningDate}
                                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                                style={inputStyle}
                            />
                        </div>

                        <div style={formGroup}>
                            <label style={label}>Password *</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>

                        <div style={formGroup}>
                            <label style={label}>Confirm Password *</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                style={inputStyle}
                                required
                            />
                        </div>
                    </div>

                    <div style={buttonGroup}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ ...buttonStyle, background: "#f44336" }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...buttonStyle, background: "#4CAF50" }}
                        >
                            {loading ? "Adding..." : "Add Employee"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

// Styles
const modalOverlay = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalContent = {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '700px',
    maxWidth: '90%',
    maxHeight: '90vh',
    overflowY: 'auto'
};

const modalTitle = {
    margin: '0 0 20px 0',
    color: '#333'
};

const formGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
};

const formGroup = {
    marginBottom: '10px'
};

const label = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box'
};

const buttonGroup = {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px'
};

const buttonStyle = {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
};

export default AddEmployeeModal;