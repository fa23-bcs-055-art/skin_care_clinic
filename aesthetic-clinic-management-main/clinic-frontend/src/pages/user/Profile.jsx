import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./user.css";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    address: '',
    medicalHistory: '',
    profileImage: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Pehle localStorage se data le lo
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        window.location.href = '/login';
        return;
      }
      
      const localUser = JSON.parse(userStr);
      
      // Local storage se data set karo pehle
      setFormData({
        name: localUser.name || '',
        email: localUser.email || '',
        phone: localUser.phone || '',
        dateOfBirth: localUser.dateOfBirth || '',
        gender: localUser.gender || '',
        bloodType: localUser.bloodType || '',
        address: localUser.address || '',
        medicalHistory: localUser.medicalHistory || '',
        profileImage: localUser.profileImage || ''
      });
      
      // Phir API se fresh data lao
      try {
        const response = await api.get(`/users/${localUser.id}`);
        if (response.data) {
          const apiData = {
            name: response.data.name || localUser.name || '',
            email: response.data.email || localUser.email || '',
            phone: response.data.phone || localUser.phone || '',
            dateOfBirth: response.data.dateOfBirth || '',
            gender: response.data.gender || '',
            bloodType: response.data.bloodType || response.data.bloodGroup || '',
            address: response.data.address || '',
            medicalHistory: response.data.medicalHistory || '',
            profileImage: response.data.profileImage || ''
          };
          setFormData(apiData);
          
          // Update localStorage bhi kar do
          const updatedUser = { ...localUser, ...apiData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (apiError) {
        console.log("API error, using local data only");
      }
      
    } catch (error) {
      console.error("Load profile error:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setSaving(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        bloodType: formData.bloodType,
        medicalHistory: formData.medicalHistory,
        profileImage: formData.profileImage
      };
      
      await api.put(`/users/${user.id}`, updateData);
      
      // Update localStorage
      const updatedUser = { ...user, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    return formData.name ? formData.name.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <motion.div className="user-profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="page-header">
        <h1>👤 My Profile</h1>
        {!isEditing && (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Edit Profile
          </button>
        )}
      </div>

      <div className="profile-container">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="avatar-container">
            {formData.profileImage ? (
              <img src={formData.profileImage} alt="Profile" className="profile-img" />
            ) : (
              <div className="avatar-placeholder">{getInitials()}</div>
            )}
            {isEditing && (
              <label className="avatar-upload">
                📷 Change Photo
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
              </label>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          {!isEditing ? (
            <div className="profile-display">
              <div className="info-card">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{formData.name || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{formData.email || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <p>{formData.phone || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Date of Birth</label>
                  <p>{formData.dateOfBirth || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Gender</label>
                  <p>{formData.gender || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Blood Type</label>
                  <p>{formData.bloodType || "Not provided"}</p>
                </div>
                <div className="info-item full-width">
                  <label>Address</label>
                  <p>{formData.address || "Not provided"}</p>
                </div>
                <div className="info-item full-width">
                  <label>Medical History</label>
                  <p>{formData.medicalHistory || "Not provided"}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" value={formData.email} disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth?.split('T')[0] || ''} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Blood Type</label>
                    <select name="bloodType" value={formData.bloodType} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address</h3>
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
              </div>

              <div className="form-section">
                <h3>Medical History</h3>
                <textarea name="medicalHistory" value={formData.medicalHistory} onChange={handleChange} rows="4" placeholder="Any allergies or medical conditions?" />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;