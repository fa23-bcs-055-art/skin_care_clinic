import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import "./auth.css";

// Import your images
import beautyImg from "../../assets/main.avif";
import goldShape from "../../assets/gold.jpg";
import tealBlob from "../../assets/teal.jpg";

function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const availableRoles = {
    superadmin: {
      label: "Super Admin",
      icon: "👑",
      description: "Full System Access & Control",
      color: "#9b59b6",
      gradient: "linear-gradient(135deg, #9b59b6, #8e44ad)"
    },
    admin: {
      label: "Admin",
      icon: "👨‍💼",
      description: "Manage Clinic Operations",
      color: "#e74c3c",
      gradient: "linear-gradient(135deg, #e74c3c, #c0392b)"
    },
    patient: {
      label: "Patient",
      icon: "👤",
      description: "Book Appointments & View Records",
      color: "#2ecc71",
      gradient: "linear-gradient(135deg, #2ecc71, #27ae60)"
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          redirectBasedOnRole(user.role);
        } catch (e) {
          console.error('Error parsing user data');
        }
      }
    }
  }, []);

  const redirectBasedOnRole = (role) => {
    if (role === 'Admin' || role === 'SuperAdmin') {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep('credentials');
    setFormData({
      email: "",
      password: "",
      rememberMe: false
    });
    setErrors({});
  };

  const handleBackToRoles = () => {
    setStep('role');
    setSelectedRole(null);
    setFormData({
      email: "",
      password: "",
      rememberMe: false
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (!response.data.success) {
        toast.error(response.data.message || 'Login failed');
        return;
      }

      const token = response.data.token;
      const user = response.data.user;

      if (!token || !user) {
        toast.error('Invalid response from server');
        return;
      }

      const userRoleLower = user.role.toLowerCase();
      const selectedRoleLower = selectedRole.toLowerCase();

      if (selectedRoleLower === 'superadmin' && userRoleLower !== 'superadmin') {
        toast.error('Invalid credentials for Super Admin access');
        setLoading(false);
        return;
      }

      if (selectedRoleLower === 'admin' && !['admin', 'superadmin'].includes(userRoleLower)) {
        toast.error('Invalid credentials for Admin access');
        setLoading(false);
        return;
      }

      if (selectedRoleLower === 'patient' && userRoleLower !== 'patient') {
        toast.error('Invalid credentials for Patient access');
        setLoading(false);
        return;
      }

      if (formData.rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === 'Admin' || user.role === 'SuperAdmin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page-wrapper">
        {step === 'credentials' && (
          <motion.button
            className="global-back-btn"
            onClick={handleBackToRoles}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            ← Back to Roles
          </motion.button>
        )}

        <div className="auth-center-wrapper">
          {/* SINGLE CARD - NOT TWO CONTAINERS */}
          <motion.div 
            className="auth-card-single"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* LEFT SIDE - FORM CONTENT */}
            <div className="auth-form-content">
              <AnimatePresence mode="wait">
                {step === 'role' && (
                  <motion.div
                    key="role-selection"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="auth-header">
                      <h1>Welcome Back! 👋</h1>
                      <p>Select your portal to continue</p>
                    </div>

                    <div className="role-grid">
                      {Object.entries(availableRoles).map(([key, role]) => (
                        <motion.div
                          key={key}
                          className="role-card"
                          whileHover={{ scale: 1.02, y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleRoleSelect(key)}
                          style={{
                            background: `linear-gradient(135deg, ${role.color}15, ${role.color}05)`,
                            borderLeft: `4px solid ${role.color}`
                          }}
                        >
                          <div className="role-icon" style={{ fontSize: "40px" }}>
                            {role.icon}
                          </div>
                          <div className="role-info">
                            <h3 style={{ color: role.color }}>{role.label}</h3>
                            <p>{role.description}</p>
                          </div>
                          <div className="role-arrow">→</div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="auth-footer">
                      <p>New patient? <Link to="/register">Create an account</Link></p>
                      <p className="footer-note">Staff members: Contact administrator for access</p>
                    </div>
                  </motion.div>
                )}

                {step === 'credentials' && selectedRole && (
                  <motion.div
                    key="credentials"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="auth-header">
                      <div
                        className="selected-role-badge"
                        style={{
                          background: availableRoles[selectedRole]?.gradient || availableRoles[selectedRole]?.color
                        }}
                      >
                        {availableRoles[selectedRole]?.icon} {availableRoles[selectedRole]?.label} Portal
                      </div>
                      <h2>Sign in to your account</h2>
                      <p>Enter your credentials to access the {availableRoles[selectedRole]?.label} Portal</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                      <motion.div
                        className="form-group"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label>Email Address</label>
                        <div className="input-with-icon">
                          <span className="input-icon">📧</span>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            className={errors.email ? 'error' : ''}
                            autoFocus
                          />
                        </div>
                        {errors.email && <span className="error-text">{errors.email}</span>}
                      </motion.div>

                      <motion.div
                        className="form-group"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label>Password</label>
                        <div className="input-with-icon">
                          <span className="input-icon">🔒</span>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={errors.password ? 'error' : ''}
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? "🙈" : "👁️"}
                          </button>
                        </div>
                        {errors.password && <span className="error-text">{errors.password}</span>}
                      </motion.div>

                      <motion.div
                        className="form-options"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="checkbox">
                          <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                          />
                          <span>Remember me for 30 days</span>
                        </label>
                        <Link to="/forgot-password" className="forgot-link">
                          Forgot Password?
                        </Link>
                      </motion.div>

                      <motion.button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                          background: availableRoles[selectedRole]?.gradient || availableRoles[selectedRole]?.color
                        }}
                      >
                        {loading ? (
                          <span className="loading-spinner">⏳</span>
                        ) : (
                          `Sign In as ${availableRoles[selectedRole]?.label}`
                        )}
                      </motion.button>
                    </form>

                    {selectedRole === 'patient' && (
                      <div className="auth-footer register-prompt">
                        <p>
                          Don't have an account? <Link to="/register">Register here</Link>
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT SIDE - MERGED IMAGE (NOT SEPARATE CONTAINER) */}
            <div className="auth-image-layer">
              <img src={beautyImg} alt="Luxury Clinic" className="auth-bg-image" />
              <img src={goldShape} alt="" className="gold-overlay-img" />
              <img src={tealBlob} alt="" className="teal-overlay-img" />
              <div className="image-gradient-overlay"></div>
              
              {/* Decorative Text Overlay */}
              <div className="image-text-overlay">
                <div className="overlay-badge">✦ PREMIUM AESTHETICS ✦</div>
                <h3>Your Beauty Journey<br />Starts Here</h3>
                <p>Experience luxury skincare with Dr. Hira Iftikhar</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default Login;