import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logoutUser } from "../../services/api";
import toast from "react-hot-toast";
import "./Navbar.css";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // Check login status
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user');
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, [location]);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Logged out successfully');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/about", label: "ABOUT" },
    { to: "/services", label: "SERVICES" },
    { to: "/gallery", label: "GALLERY" },
    { to: "/before-after", label: "RESULTS" },
    { to: "/blogs", label: "BLOG" },
    { to: "/contact", label: "CONTACT" },
  ];

  return (
    <>
      <motion.nav 
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="logo">
            <motion.div 
              className="logo-wrapper"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Logo Icon */}
              <div className="logo-icon-wrapper">
                <img
                  src="/src/assets/favicon.png"
                  alt="Dr. Hira Iftikhar Logo"
                  className="logo-icon-img"
                />
              </div>

              {/* Logo Text */}
              <div className="logo-text-wrapper">
                <span className="logo-text-main">Aesthetics by</span>
                <span className="logo-text-name">Dr. Hira Iftikhar</span>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="nav-menu desktop-menu">
            {navLinks.map((item) => (
              <motion.div
                key={item.to}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to={item.to} 
                  className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
                >
                  {item.label}
                  {location.pathname === item.to && (
                    <motion.div 
                      className="active-indicator"
                      layoutId="activeNav"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="nav-actions">
            {isLoggedIn ? (
              <>
                <motion.button
                  className="btn-dashboard-icon"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const userRole = user?.role?.toLowerCase();
                    if (userRole === 'admin' || userRole === 'superadmin') {
                      navigate('/admin');
                    } else {
                      navigate('/user');
                    }
                  }}
                >
                  <i className="fa-regular fa-user"></i>
                </motion.button>
                <motion.button
                  className="btn-logout"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  className="btn-login"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </motion.button>
                <motion.button
                  className="btn-appointment"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                >
                  GET APPOINTMENT
                </motion.button>
              </>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              className="mobile-menu-btn"
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {navLinks.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={item.to} 
                    className={`mobile-nav-link ${location.pathname === item.to ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              {isLoggedIn ? (
                <>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button 
                      className="mobile-dashboard-btn"
                      onClick={() => {
                        const userRole = user?.role?.toLowerCase();
                        if (userRole === 'admin' || userRole === 'superadmin') {
                          navigate('/admin');
                        } else {
                          navigate('/user');
                        }
                        setMobileMenuOpen(false);
                      }}
                    >
                      Dashboard
                    </button>
                  </motion.div>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <button 
                      className="mobile-logout-btn"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button 
                      className="mobile-login-btn"
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Login
                    </button>
                  </motion.div>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button 
                      className="mobile-appointment-btn"
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                    >
                      GET APPOINTMENT
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      {/* Spacer to prevent content hiding under fixed navbar */}
      <div className="navbar-spacer"></div>
    </>
  );
}

export default Navbar;