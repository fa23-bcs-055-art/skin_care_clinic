import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import Navbar from "../../components/common/Navbar";
import "./auth.css";

function VerifyPhone() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-phone/${token}`);
        if (response.data.success) {
          setStatus({ loading: false, success: true, message: response.data.message });
          toast.success(response.data.message || 'Phone verification successful');
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
                <h1>{status.loading ? 'Verifying...' : status.success ? 'Verified ✅' : 'Verification Failed'}</h1>
                <p>{status.loading ? 'Please wait while we verify your phone.' : status.message}</p>
              </div>

              {!status.loading && (
                <div className="auth-footer">
                  {status.success ? (
                    <>
                      <button className="auth-btn" onClick={() => navigate('/login')}>
                        Go to Login
                      </button>
                      <p>
                        If you did not receive a verification email, <Link to="/forgot-password">reset password</Link>.
                      </p>
                    </>
                  ) : (
                    <>
                      <button className="auth-btn" onClick={() => navigate('/register')}>
                        Try Again
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

export default VerifyPhone;
