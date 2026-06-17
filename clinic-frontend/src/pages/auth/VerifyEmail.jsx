import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import "./auth.css";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: false, success: false, message: '' });
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter the verification code.');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/auth/verify-email', {
        token: code.trim(),
        email: email || undefined
      });
      if (response.data.success) {
        setStatus({ loading: false, success: true, message: response.data.message });
        toast.success(response.data.message || 'Email verified successfully');
      } else {
        setStatus({ loading: false, success: false, message: response.data.message || 'Verification failed' });
        toast.error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Verification code is invalid or expired.';
      setStatus({ loading: false, success: false, message });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-page-wrapper">
        <motion.div
          className="auth-center-wrapper"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="auth-card-single"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="auth-form-content">
              <div className="auth-header">
                <h1>
                  {status.loading
                    ? 'Verifying...'
                    : status.success
                    ? 'Email Verified ✅'
                    : 'Verify Your Email'}
                </h1>
                <p>
                  {status.loading
                    ? 'Please wait while we verify your email.'
                    : status.message || 'Enter the OTP sent to your email and submit below.'}
                </p>
              </div>

              {!status.success && !status.loading && (
                <form className="auth-form" onSubmit={handleVerifyCode}>
                  {!email && (
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label>Enter Verification Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Paste the 6-digit code from email"
                      maxLength={6}
                    />
                  </div>
                  <button type="submit" className="auth-btn" disabled={submitting}>
                    {submitting ? 'Verifying...' : 'Verify Email'}
                  </button>
                </form>
              )}

              {!status.loading && (
                <div className="auth-footer">
                  {status.success ? (
                    <>
                      <button className="auth-btn" onClick={() => navigate('/login')}>
                        Go to Login
                      </button>
                      <p>
                        Need help? <Link to="/forgot-password">Reset password</Link> or contact support.
                      </p>
                    </>
                  ) : (
                    <>
                      <button className="auth-btn" onClick={() => navigate('/register')}>
                        Create New Account
                      </button>
                      <p>
                        <Link to="/login">Back to Login</Link>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

export default VerifyEmail;
