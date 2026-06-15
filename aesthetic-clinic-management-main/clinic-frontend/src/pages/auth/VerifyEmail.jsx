import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import "./auth.css";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        if (response.data.success) {
          setStatus({ loading: false, success: true, message: response.data.message });
          toast.success(response.data.message || 'Email verified successfully');
        } else {
          setStatus({ loading: false, success: false, message: response.data.message || 'Verification failed' });
          toast.error(response.data.message || 'Verification failed');
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Verification link is invalid or expired.';
        setStatus({ loading: false, success: false, message });
        toast.error(message);
      }
    };

    if (token) verify();
  }, [token]);

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
                <h1>{status.loading ? 'Verifying...' : status.success ? 'Email Verified ✅' : 'Verification Failed'}</h1>
                <p>{status.loading ? 'Please wait while we verify your email.' : status.message}</p>
              </div>

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
