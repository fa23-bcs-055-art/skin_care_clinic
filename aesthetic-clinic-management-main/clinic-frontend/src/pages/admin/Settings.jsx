import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import ImageUpload from "../../components/common/ImageUpload";

function Settings() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, security
  
  // Profile Settings
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load user profile on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setProfile(prev => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      profileImage: user.profileImage || ""
    }));
  }, []);

  // Handle profile change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (url) => {
    setProfile(prev => ({
      ...prev,
      profileImage: url
    }));
  };

  // Submit profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profile.name) {
      return toast.error("Name is required");
    }

    try {
      setLoading(true);
      await api.put('/users/profile', {
        name: profile.name,
        phone: profile.phone,
        profileImage: profile.profileImage
      });
      
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = profile.name;
      user.phone = profile.phone;
      user.profileImage = profile.profileImage;
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (profile.newPassword !== profile.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    if (profile.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    
    try {
      setLoading(true);
      await api.put('/users/change-password', {
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword
      });
      
      toast.success('Password changed successfully');
      setProfile(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      <h1 style={styles.pageTitle}>⚙️ Settings</h1>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            ...styles.tabButton,
            background: activeTab === 'profile' ? '#2196F3' : '#f5f5f5',
            color: activeTab === 'profile' ? 'white' : '#333'
          }}
        >
          👤 Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            ...styles.tabButton,
            background: activeTab === 'security' ? '#2196F3' : '#f5f5f5',
            color: activeTab === 'security' ? 'white' : '#333'
          }}
        >
          🔒 Security
        </button>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={styles.tabContent}
        >
          <h2 style={styles.sectionTitle}>👤 Profile Information</h2>
          
          <form onSubmit={handleProfileUpdate}>
            {/* Profile Image Upload - From Device */}
            <div style={styles.profileImageSection}>
              <ImageUpload 
                onUpload={handleImageUpload}
                currentImage={profile.profileImage}
                folder="profiles"
              />
            </div>

            {/* Basic Info */}
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  style={{ ...styles.input, background: '#f5f5f5' }}
                  disabled
                />
                <small style={styles.hint}>Email cannot be changed</small>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  style={styles.input}
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                background: loading ? '#999' : '#2196F3'
              }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={styles.tabContent}
        >
          <h2 style={styles.sectionTitle}>🔒 Change Password</h2>
          
          <form onSubmit={handlePasswordChange} style={styles.securityForm}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={profile.currentPassword}
                onChange={handleProfileChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={profile.newPassword}
                onChange={handleProfileChange}
                style={styles.input}
                required
                minLength="6"
              />
              <small style={styles.hint}>Minimum 6 characters</small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={profile.confirmPassword}
                onChange={handleProfileChange}
                style={styles.input}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                background: loading ? '#999' : '#f44336',
                width: '100%'
              }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>

          {/* Security Tips */}
          <div style={styles.securityTips}>
            <h3 style={styles.tipsTitle}>🔐 Password Tips</h3>
            <ul style={styles.tipsList}>
              <li>Use at least 6 characters</li>
              <li>Mix uppercase and lowercase letters</li>
              <li>Include numbers and special characters</li>
              <li>Don't use common words or phrases</li>
              <li>Use different passwords for different accounts</li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  pageTitle: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '30px'
  },
  tabContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px'
  },
  tabButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'all 0.3s'
  },
  tabContent: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '20px'
  },
  profileImageSection: {
    marginBottom: '30px',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '8px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  hint: {
    fontSize: '12px',
    color: '#999',
    marginTop: '5px',
    display: 'block'
  },
  submitButton: {
    padding: '12px 24px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'background 0.3s'
  },
  securityForm: {
    maxWidth: '400px',
    marginBottom: '30px'
  },
  securityTips: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '20px'
  },
  tipsTitle: {
    margin: '0 0 10px 0',
    color: '#333'
  },
  tipsList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#666',
    lineHeight: '1.8'
  }
};

export default Settings;