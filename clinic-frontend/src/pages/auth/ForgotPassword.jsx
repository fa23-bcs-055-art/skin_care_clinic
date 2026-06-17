import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import "./auth.css";

// Import images
import beautyImg from "../../assets/main.avif";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [errors, setErrors] = useState({});

  const validateEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setLoading(true);
    setResetLink("");

    try {
      console.log('Sending forgot password request for:', email);
      
      const response = await api.post('/auth/forgot-password', { email });

      console.log('Forgot password response:', response.data);

      if (response.data.success) {
        setSubmitted(true);
        if (response.data.resetLink) {
          setResetLink(response.data.resetLink);
          toast.success('✅ Reset link generated (email service unavailable). Copy it below.');
        } else {
          toast.success('✅ Reset link sent to your email! Check inbox or spam folder.');
        }
      } else {
        toast.error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page-wrapper">
        <motion.button
          className="global-back-btn"
          onClick={() => navigate('/login')}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ← Back to Login
        </motion.button>

        <div className="auth-center-wrapper">
          <motion.div 
            className="auth-card-single"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* LEFT SIDE - FORM CONTENT */}
            <div className="auth-form-content">
              {!submitted ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="auth-header">
                    <h1>Forgot Password? 🔐</h1>
                    <p>Enter your email and we'll send you a reset link</p>
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
                          value={email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className={errors.email ? 'error' : ''}
                          autoFocus
                        />
                      </div>
                      {errors.email && <span className="error-text">{errors.email}</span>}
                    </motion.div>

                    <motion.button
                      type="submit"
                      className="auth-btn"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}
                    >
                      {loading ? '⏳ Sending...' : '📬 Send Reset Link'}
                    </motion.button>
                  </form>

                  <motion.div 
                    className="auth-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p>Remember your password? <Link to="/login">Back to Login</Link></p>
                    <p className="footer-note">Need help? Contact support@clinic.com</p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="auth-header">
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
                    <h2>{resetLink ? 'Reset Link Generated' : 'Check Your Email!'}</h2>
                    <p>{resetLink ? 'Your reset link is below because email delivery is unavailable right now.' : "We've sent a password reset link."}</p>
                  </div>

                  <div className="success-box">
                    <div style={{
                      background: '#f0f4ff',
                      padding: '20px',
                      borderRadius: '12px',
                      marginBottom: '20px',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#333' }}>
                        {resetLink ? '🔗 Use this link:' : '📧 Email sent to:'}
                      </p>
                      <p style={{ margin: 0, color: '#667eea', fontWeight: '700', fontSize: '16px' }}>
                        {resetLink ? resetLink : email}
                      </p>
                    </div>

                    {resetLink && (
                      <div style={{
                        background: '#ffffff',
                        padding: '20px',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid #dbeafe'
                      }}>
                        <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#333' }}>
                          🔗 Development Reset Link:
                        </p>
                        <a href={resetLink} target="_blank" rel="noreferrer" style={{ color: '#2563eb', wordBreak: 'break-all' }}>
                          {resetLink}
                        </a>
                      </div>
                    )}

                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                      }}>
                        <span style={{ fontSize: '20px' }}>📁</span>
                        <div>
                          <p style={{ margin: '0 0 3px 0', fontWeight: '600', color: '#333' }}>
                            Check your spam folder
                          </p>
                          <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                            Sometimes emails end up there
                          </p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      onClick={() => navigate('/login')}
                      className="auth-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        marginBottom: '15px'
                      }}
                    >
                      Back to Login
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setSubmitted(false);
                        setEmail('');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: '#f0f4ff',
                        border: '2px solid #667eea',
                        borderRadius: '10px',
                        color: '#667eea',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      whileHover={{ backgroundColor: '#e8edff' }}
                    >
                      Try Another Email
                    </motion.button>

                    <motion.div 
                    className="auth-footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="footer-note">Didn't receive the email? Check your spam or contact support</p>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* RIGHT SIDE - IMAGE */}
            <div className="auth-image-layer" style={{
              backgroundImage: `url(${beautyImg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;