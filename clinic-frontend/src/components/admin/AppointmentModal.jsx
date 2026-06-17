import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

function AppointmentModal({ isOpen, onClose, refresh, editData }) {

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    date: "",
    status: "Pending",
    notes: ""
  });

  // 🔹 Load patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get("/patients");
        setPatients(res.data);
      } catch (error) {
        toast.error("Failed to load patients");
      }
    };

    if (isOpen) {
      fetchPatients();
    }
  }, [isOpen]);

  // 🔹 Edit data fill
  useEffect(() => {
    if (editData) {
      setForm({
        patientId: editData.patientId || "",
        date: editData.date ? new Date(editData.date).toISOString().slice(0, 16) : "",
        status: editData.status || "Pending",
        notes: editData.notes || ""
      });
    } else {
      setForm({
        patientId: "",
        date: "",
        status: "Pending",
        notes: ""
      });
    }
  }, [editData]);

  // 🔹 Submit
  const handleSubmit = async () => {
    try {
      // Validate
      if (!form.patientId) {
        return toast.error("Please select a patient");
      }
      
      if (!form.date) {
        return toast.error("Please select date and time");
      }

      setLoading(true);

      // Prepare data for API
      const appointmentData = {
        patientId: form.patientId,
        appointmentDate: form.date,
        status: form.status,
        notes: form.notes
      };

      if (editData) {
        await api.put(`/appointments/${editData._id}`, appointmentData);
        toast.success("Appointment updated ✅");
      } else {
        await api.post("/appointments", appointmentData);
        toast.success("Appointment created ✅");
      }

      refresh();
      onClose();

    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.error || "Failed to save appointment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
        width: '450px',
        maxWidth: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          {editData ? "✏️ Edit Appointment" : "📅 New Appointment"}
        </h2>

        {/* 👤 Patient Select */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Patient *
          </label>
          <select
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
            required
          >
            <option value="">Select Patient</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} - {p.phone || 'No phone'}
              </option>
            ))}
          </select>
        </div>

        {/* 📅 Date Time */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Date & Time *
          </label>
          <input
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
            required
          />
        </div>

        {/* 📌 Status */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd'
            }}
          >
            <option value="Pending">⏳ Pending</option>
            <option value="Confirmed">✅ Confirmed</option>
            <option value="Completed">🎉 Completed</option>
            <option value="Cancelled">❌ Cancelled</option>
          </select>
        </div>

        {/* 📝 Notes */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Notes (Optional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Additional notes..."
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ddd',
              minHeight: '80px'
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : (editData ? 'Update' : 'Save')}
          </button>
          <button 
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppointmentModal;