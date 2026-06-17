import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log('Sending reset password request with token:', token);
      
      const response = await api.put(`/auth/reset-password/${token}`, {
        password: formData.password
      });

      console.log('Reset password response:', response.data);

      if (response.data.success) {
        toast.success('Password reset successful!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="auth-page-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="auth-card-single"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-form-content">
          <motion.div 
            className="auth-header"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <h1>Reset Your Password</h1>
            <p>Secure your account with a strong new password.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="auth-form">
            <motion.div 
              className="form-group"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label>New Password</label>
              <div className="input-with-icon">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className={errors.password ? 'error' : ''}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <span className="form-hint">Use letters, numbers, and symbols for a stronger password.</span>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </motion.div>

            <motion.div 
              className="form-group"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <label>Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className={errors.confirmPassword ? 'error' : ''}
                required
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </motion.div>

            <motion.button
              type="submit"
              className="auth-btn"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </form>

          <motion.div 
            className="auth-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>
              <Link to="/login" className="back-link">← Return to Login</Link>
            </p>
          </motion.div>
        </div>

        <div className="auth-image-layer" style={{ background: 'linear-gradient(180deg, #1c2d52 0%, #09101f 100%)' }}>
          <div className="image-gradient-overlay"></div>
          <div className="image-text-overlay" style={{ left: '35px', right: '35px', bottom: '40px' }}>
            <span className="overlay-badge">SECURITY</span>
            <h3>Secure reset</h3>
            <p>Use a strong password that is easy for you to remember and hard for others to guess.</p>
            <div style={{ marginTop: '22px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: '18px' }}>🔒</span>
                <span style={{ color: '#f8f7f2' }}>Passwords are encrypted and private.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.08)', padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <span style={{ fontSize: '18px' }}>✅</span>
                <span style={{ color: '#f8f7f2' }}>You will be redirected to login after reset.</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ResetPassword;