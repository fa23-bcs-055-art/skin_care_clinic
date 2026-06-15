import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./admin.css";
import api from "../services/api";
import toast from "react-hot-toast";
import NotificationBell from "../components/common/NotificationBell";

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
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
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { path: "/admin", icon: "📊", label: "Dashboard" },
    { path: "/admin/patients", icon: "👥", label: "Patients" },
    { path: "/admin/appointments", icon: "📅", label: "Appointments" },
    { path: "/admin/finance", icon: "💰", label: "Finance" },
    { path: "/admin/inventory", icon: "📦", label: "Inventory" },
    { path: "/admin/users", icon: "👤", label: "Users" },
    { path: "/admin/settings", icon: "⚙️", label: "Settings" }
  ];

  const contentItems = [
    { path: "/admin/services", icon: "💆", label: "Services" },
    { path: "/admin/gallery", icon: "🖼️", label: "Gallery" },
    { path: "/admin/blogs", icon: "📝", label: "Blogs" },
    { path: "/admin/testimonials", icon: "⭐", label: "Testimonials" }
  ];

  return (
    <div className="admin-layout-container">
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
        className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}
      >
        {/* Sidebar Header */}
        <div className="admin-sidebar-header">
          {!sidebarCollapsed && (
            <div className="admin-sidebar-brand">
              <h2>Clinic Admin</h2>
              {user && (
                <div className="admin-sidebar-user">
                  <div className="admin-sidebar-name">{user.name}</div>
                  <div className="admin-sidebar-role">{user.role}</div>
                </div>
              )}
            </div>
          )}
          <button 
            className="sidebar-collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <div className="admin-sidebar-nav">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="admin-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="admin-nav-label">{item.label}</span>}
            </Link>
          ))}

          {/* Content Dropdown */}
          <div
            onClick={() => !sidebarCollapsed && setContentDropdownOpen(!contentDropdownOpen)}
            className={`admin-nav-link dropdown-trigger ${contentDropdownOpen ? 'active' : ''}`}
          >
            <span className="admin-nav-icon">📋</span>
            {!sidebarCollapsed && (
              <>
                <span className="admin-nav-label">Content</span>
                <span className="dropdown-arrow">{contentDropdownOpen ? '▼' : '▶'}</span>
              </>
            )}
          </div>

          {contentDropdownOpen && !sidebarCollapsed && (
            <div className="admin-dropdown-menu">
              {contentItems.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className="admin-nav-link dropdown-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="admin-nav-icon-small">{item.icon}</span>
                  <span className="admin-nav-label">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`admin-main-content ${sidebarCollapsed ? 'content-collapsed' : ''}`}>
        <div className="admin-top-bar">
          <div className="admin-welcome">
            Welcome back, <b>{user?.name || "Admin"}</b>
          </div>
          {/* ✅ NotificationBell added correctly */}
          <NotificationBell />
        </div>
        <div className="admin-page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;