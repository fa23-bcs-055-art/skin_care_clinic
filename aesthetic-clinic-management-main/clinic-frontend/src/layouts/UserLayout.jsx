import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import "./user.css";
import NotificationBell from "../components/common/NotificationBell";

function UserLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { path: "/user", icon: "📊", label: "Dashboard" },
    { path: "/user/book-appointment", icon: "📅", label: "Book Appointment" },
    { path: "/user/my-appointments", icon: "📋", label: "My Appointments" },
    { path: "/user/payments", icon: "💰", label: "Payments" },
  ];

  return (
    <div className="user-layout-container">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div 
        className={`user-sidebar-new ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header-new">
          {!sidebarCollapsed && <h2>Patient Portal</h2>}
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {user && !sidebarCollapsed && (
          <div className="user-info-new">
            <div className="user-avatar-new">
              {user.name?.charAt(0)}
            </div>
            <div className="user-details-new">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
            </div>
          </div>
        )}

        <nav className="user-nav-new">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className="nav-link-new"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon-new">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="logout-btn-new">
          <span>🚪</span>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Main Content */}
      <div className={`user-main-new ${sidebarCollapsed ? 'content-collapsed' : ''}`}>
        <div className="top-bar-new">
          <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          {/* ✅ NotificationBell added correctly */}
          <NotificationBell />
        </div>
        <div className="user-content-new">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default UserLayout;