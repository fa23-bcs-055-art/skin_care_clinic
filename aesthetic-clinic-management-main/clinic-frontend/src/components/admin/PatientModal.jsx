import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

function PatientModal({ isOpen, onClose, refresh, editData }) {

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "",
    dateOfBirth: "",
    address: "",
    bloodGroup: ""
  });

  useEffect(() => {
    if (editData) {
      setForm(editData);
    } else {
      setForm({
        name: "",
        phone: "",
        email: "",
        gender: "",
        dateOfBirth: "",
        address: "",
        bloodGroup: ""
      });
    }
  }, [editData]);

  const handleSubmit = async () => {
    try {
      if (!form.name) {
        return toast.error("Name is required");
      }

      if (editData) {
        await api.put(`/patients/${editData._id}`, form);
        toast.success("Updated ✅");
      } else {
        await api.post("/patients", form);
        toast.success("Added ✅");
      }

      refresh();
      onClose();

    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || "Error ❌");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-box" style={{
        background: 'white',
        padding: '30px',
        borderRadius: '10px',
        width: '500px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          {editData ? "✏️ Edit Patient" : "➕ Add New Patient"}
        </h2>

        {/* Name - Required */}
        <input
          placeholder="Full Name *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={inputStyle}
          required
        />

        {/* Phone */}
        <input
          placeholder="Phone Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          style={inputStyle}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email (Optional)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={inputStyle}
        />

        {/* Gender */}
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        {/* Date of Birth */}
        <input
          type="date"
          placeholder="Date of Birth"
          value={form.dateOfBirth ? form.dateOfBirth.split('T')[0] : ''}
          onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          style={inputStyle}
        />

        {/* Address */}
        <textarea
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          style={{ ...inputStyle, minHeight: '80px' }}
        />

        {/* Blood Group */}
        <select
          value={form.bloodGroup}
          onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
          style={inputStyle}
        >
          <option value="">Select Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '12px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {editData ? 'Update' : 'Save'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  boxSizing: 'border-box'
};

export default PatientModal;