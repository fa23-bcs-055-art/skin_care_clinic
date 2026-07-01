import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./user.css";
// Client-side image compression helper
const compressImage = (file, maxWidth = 1024, maxHeight = 1024, quality = 0.7) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.HTMLCanvasElement) {
      resolve(file);
      return;
    }
    if (!file || !file.type || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type || 'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

function BookAppointment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [serviceError, setServiceError] = useState(null);
  const [doctorError, setDoctorError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const CLINIC_NUMBER = "03194474441";
  const FIXED_FEE = 1500;

  const [formData, setFormData] = useState({
    serviceId: "",
    serviceName: "",
    servicePrice: 0,
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    customerName: "",
    customerPhone: "",
    paymentMethod: "JazzCash",
    transactionId: ""
  });

  const steps = [
    { number: 1, title: "Select Service" },
    { number: 2, title: "Select Doctor" },
    { number: 3, title: "Choose Date & Time" },
    { number: 4, title: "Your Details" },
    { number: 5, title: "Payment" },
    { number: 6, title: "Confirm" }
  ];

  useEffect(() => {
    fetchServices();
    fetchDoctors();
    checkForPendingService();
  }, []);

  // Clear screenshot and transaction fields when user selects Cash
  useEffect(() => {
    if (formData.paymentMethod === 'Cash') {
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setFormData(prev => ({ ...prev, transactionId: '' }));
    }
  }, [formData.paymentMethod]);

  const checkForPendingService = () => {
    try {
      const pendingService = localStorage.getItem('pendingService');
      if (pendingService) {
        const service = JSON.parse(pendingService);
        console.log('✅ Found pending service:', service.name);
        setFormData(prev => ({
          ...prev,
          serviceId: service._id,
          serviceName: service.name,
          servicePrice: service.price || 0
        }));
        setCurrentStep(2);
        toast.success(`Service "${service.name}" selected! Now choose a doctor.`, { duration: 3000 });
        localStorage.removeItem('pendingService');
      }
    } catch (error) {
      console.error('Error retrieving pending service:', error);
      localStorage.removeItem('pendingService');
    }
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    setServiceError(null);
    try {
      const res = await api.get('/services/public');
      const data = res.data.services || res.data || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      setServiceError('Failed to load services. Please try again.');
      toast.error('Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    setDoctorError(null);
    try {
      const res = await api.get('/users?role=Doctor');
      const users = res.data.users || res.data || [];
      setDoctors(Array.isArray(users) ? users : []);
    } catch (error) {
      setDoctorError('Failed to load doctors. Please try again.');
      toast.error('Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    if (!doctorId || !date) return;
    setLoadingSlots(true);
    try {
      const res = await api.get(`/appointments/available-slots?doctorId=${doctorId}&date=${date}`);
      const slots = res.data.availableSlots || [];
      setAvailableSlots(slots);
      if (slots.length === 0) {
        toast("No available slots on this date. Please select another date.", { icon: '📅', duration: 4000 });
      }
    } catch (error) {
      console.error('Slots error:', error);
      setAvailableSlots([
        '03:00 PM - 03:30 PM', '03:30 PM - 04:00 PM', '04:00 PM - 04:30 PM',
        '04:30 PM - 05:00 PM', '05:00 PM - 05:30 PM', '05:30 PM - 06:00 PM',
        '06:00 PM - 06:30 PM', '06:30 PM - 07:00 PM'
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleServiceSelect = (service) => {
    setFormData({
      ...formData,
      serviceId: service._id,
      serviceName: service.name,
      servicePrice: service.price || service.cost || 0
    });
    setCurrentStep(2);
    toast.success(`Selected: ${service.name}`);
  };

  const handleDoctorSelect = (doctorId) => {
    setFormData({ ...formData, doctorId });
    setCurrentStep(3);
    const doctor = doctors.find(d => d._id === doctorId);
    toast.success(`Selected: Dr. ${doctor?.name || 'Doctor'}`);
  };

  const handleDateTimeSelect = (date, time) => {
    setFormData({ ...formData, date, time });
    setCurrentStep(4);
    toast.success(`Appointment scheduled for ${new Date(date).toLocaleDateString()} at ${time}`);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only image files are allowed (JPEG, PNG, GIF, WEBP)');
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  // ========== ✅ COMPLETELY FIXED HANDLE PAYMENT ==========
  const handlePayment = async () => {
    // Validate customer details
    if (!formData.customerName || formData.customerName.trim().length < 2) {
      toast.error("Please enter your full name");
      setCurrentStep(4);
      return;
    }
    if (!formData.customerPhone || formData.customerPhone.length < 10) {
      toast.error("Please enter a valid phone number");
      setCurrentStep(4);
      return;
    }
    // For non-cash payments require transaction details
    if (formData.paymentMethod !== 'Cash') {
      if (!formData.transactionId || formData.transactionId.trim().length < 5) {
        toast.error("Please enter transaction ID from your payment");
        return;
      }
      if (!screenshotFile) {
        toast.error("Please upload payment screenshot");
        return;
      }
    }

    setPaymentProcessing(true);
    setUploading(true);

    try {
      // Step 1: Upload screenshot only for non-cash payments
      let screenshotUrl = null;
      if (formData.paymentMethod !== 'Cash') {
        const compressedFile = await compressImage(screenshotFile);
        const formDataFile = new FormData();
        formDataFile.append('screenshot', compressedFile);

        const uploadRes = await api.post('/payments/upload-screenshot', formDataFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000, // 120 seconds timeout for image uploads
        });

        console.log("✅ Screenshot uploaded:", uploadRes.data);
        screenshotUrl = uploadRes.data.uploadedUrl || uploadRes.data.screenshotUrl;

        if (!screenshotUrl) {
          throw new Error("Failed to get screenshot URL");
        }
      }

      // Step 2: Get user info
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      let patientId = null;
      let userEmail = "";

      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          patientId = user.id;
          userEmail = user.email || "";
        } catch (e) {
          console.error("Parse error:", e);
        }
      }

      // Step 3: Create appointment
      const appointmentData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: userEmail,
        patientId: patientId,
        doctorId: formData.doctorId || null,
        serviceId: formData.serviceId || null,
        appointmentDate: new Date(formData.date),
        appointmentTime: formData.time,
        notes: formData.reason || "No additional notes",
        status: 'Pending',
        paymentStatus: formData.paymentMethod === 'Cash' ? 'Unpaid' : 'Pending'
      };

      const appointmentRes = await api.post('/appointments', appointmentData);
      const appointmentId = appointmentRes.data._id || appointmentRes.data.id;
      console.log("✅ Appointment created:", appointmentId);

      // Step 4: Calculate total amount
      const totalAmount = FIXED_FEE + (formData.servicePrice || 0);

      // Step 5: Create payment record with screenshot URL
      const paymentData = {
        patientId: patientId,
        appointmentId: appointmentId,
        amount: totalAmount,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.paymentMethod === 'Cash' ? (formData.transactionId || 'CASH') : formData.transactionId,
        screenshot: screenshotUrl || null,
        status: formData.paymentMethod === 'Cash' ? 'Approved' : 'Pending',
        notes: `Payment for appointment on ${formData.date} at ${formData.time}`
      };

      console.log("💰 Payment Data being sent:", JSON.stringify(paymentData, null, 2));

      const paymentRes = await api.post('/payments', paymentData);
      console.log("✅ Payment saved:", paymentRes.data);

      // ✅ If cash, immediately mark appointment as paid
      if (formData.paymentMethod === 'Cash') {
        await api.put(`/appointments/${appointmentId}`, { paymentStatus: 'Paid' });
      }

      toast.success(formData.paymentMethod === 'Cash' ? "Appointment confirmed! Payment will be collected at clinic." : "Payment recorded successfully! Admin will verify your payment.");
      setCurrentStep(6);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.error || "Payment recording failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
      setUploading(false);
    }
  };

  const totalAmount = FIXED_FEE + (formData.servicePrice || 0);
  const getMinDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max.toISOString().split('T')[0];
  };

  return (
    <motion.div className="book-appointment" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#2c3e50' }}>Book Appointment</h1>

      <div className="booking-steps" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', flexWrap: 'wrap', gap: '10px' }}>
        {steps.map((step) => (
          <div key={step.number} className="step-wrapper" style={{ flex: 1, minWidth: '100px', textAlign: 'center' }}>
            <div className={`step ${currentStep >= step.number ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span className="step-number" style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: currentStep >= step.number ? '#4CAF50' : '#e0e0e0',
                color: currentStep >= step.number ? 'white' : '#999',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>{step.number}</span>
              <span className="step-title" style={{
                fontSize: '12px', fontWeight: currentStep >= step.number ? 'bold' : 'normal',
                color: currentStep >= step.number ? '#4CAF50' : '#999'
              }}>{step.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="booking-content">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Select a Service</h2>
              {loadingServices ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading services...</p></div>
              ) : serviceError ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#f44336' }}>
                  <p>{serviceError}</p>
                  <button onClick={fetchServices} style={{ marginTop: '10px', padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
                </div>
              ) : (
                <div className="services-grid">
                  {services.map(service => (
                    <motion.div
                      key={service._id}
                      className={`service-card ${formData.serviceId === service._id ? 'selected' : ''}`}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <div className="service-icon">{service.icon || '✨'}</div>
                      <h3>{service.name}</h3>
                      <p>{service.duration || '30 mins'}</p>
                      <h4 className="service-price">Rs. {service.price || service.cost}</h4>
                    </motion.div>
                  ))}
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <button onClick={() => { setFormData({ ...formData, serviceId: null, serviceName: 'General Consultation', servicePrice: 0 }); setCurrentStep(2); }} style={{
                  background: '#f8f9fa', border: '2px solid #ddd', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                }}>Skip / Consultation Only (Rs. {FIXED_FEE})</button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setCurrentStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', color: '#666' }}>← Back</button>
              <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Select Doctor</h2>
              {loadingDoctors ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><p>Loading doctors...</p></div>
              ) : doctorError ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#f44336' }}>
                  <p>{doctorError}</p>
                  <button onClick={fetchDoctors} style={{ marginTop: '10px', padding: '8px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
                  {doctors.map(doctor => (
                    <motion.div key={doctor._id} whileHover={{ scale: 1.02 }} onClick={() => handleDoctorSelect(doctor._id)} style={{
                      padding: '20px', border: '1px solid #e0e0e0', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', background: 'white'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>👨‍⚕️</div>
                      <h3>Dr. {doctor.name}</h3>
                      <p>{doctor.specialization || 'General Physician'}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setCurrentStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', color: '#666' }}>← Back</button>
              <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Select Date & Time</h2>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Select Date</label>
                <input type="date" min={getMinDate()} max={getMaxDate()} value={formData.date} onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (!selectedDate) {
                    setFormData({ ...formData, date: "", time: "" });
                    setAvailableSlots([]);
                    return;
                  }

                  const [year, month, day] = selectedDate.split('-');
                  const dateObj = new Date(year, month - 1, day);
                  const dayOfWeek = dateObj.getDay();

                  if (dayOfWeek === 5 || dayOfWeek === 6) {
                    toast.error("Clinic is closed on Fridays and Saturdays. Please select another date.");
                    setFormData({ ...formData, date: "", time: "" });
                    setAvailableSlots([]);
                    return;
                  }

                  setFormData({ ...formData, date: selectedDate, time: "" });
                  if (formData.doctorId) fetchAvailableSlots(formData.doctorId, selectedDate);
                }} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }} />
              </div>
              {formData.date && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Available Time Slots</label>
                  {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}><div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #4CAF50', borderRadius: '50%', margin: '0 auto 10px', animation: 'spin 1s linear infinite' }} /><p>Loading available slots...</p></div>
                  ) : availableSlots.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginTop: '10px' }}>
                      {availableSlots.map(slot => (
                        <button key={slot} onClick={() => handleDateTimeSelect(formData.date, slot)} style={{
                          padding: '14px', background: formData.time === slot ? '#4CAF50' : '#f8f9fa', color: formData.time === slot ? 'white' : '#333',
                          border: formData.time === slot ? 'none' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer'
                        }}>{slot}</button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', background: '#fff3e0', borderRadius: '8px', color: '#FF9800' }}>⚠️ No slots available on this date. Please select another date.</div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setCurrentStep(3)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '20px', color: '#666' }}>← Back</button>
              <h2 style={{ marginBottom: '20px', color: '#2c3e50' }}>Your Details</h2>
              <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Full Name *</label>
                  <input type="text" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} placeholder="Enter your full name" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }} required />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Phone Number *</label>
                  <input type="tel" value={formData.customerPhone} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 11) })} placeholder="03xxxxxxxxx" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }} required />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Additional Notes (Optional)</label>
                  <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Describe your symptoms or any special requests..." rows="4" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', resize: 'vertical' }} />
                </div>
                <button onClick={() => setCurrentStep(5)} style={{ width: '100%', padding: '14px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>Continue to Payment</button>
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <button onClick={() => setCurrentStep(4)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', cursor: 'pointer', marginBottom: '24px', color: '#4CAF50', fontWeight: 600 }}>← Back</button>

              <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                <div style={{ background: 'linear-gradient(135deg, #2A5CAA 0%, #1e3a6b 100%)', color: 'white', padding: '30px', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏦</div>
                  <h2 style={{ margin: '0 0 10px' }}>Manual Payment Instructions</h2>
                  <p style={{ margin: '0', opacity: 0.9 }}>Please send payment to the following account:</p>
                </div>

                <div style={{ padding: '30px' }}>
                  <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '20px', marginBottom: '25px', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Send payment to:</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2A5CAA', letterSpacing: '2px', marginBottom: '10px' }}>{CLINIC_NUMBER}</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>JazzCash / EasyPaisa / Bank Transfer</div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Payment Method *</label>
                    <select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }}>
                      <option value="Cash">Cash (Pay at Clinic)</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Transaction ID and Screenshot only required for non-cash methods */}
                  {formData.paymentMethod !== 'Cash' && (
                    <>
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Transaction ID / Reference Number *</label>
                        <input type="text" value={formData.transactionId} onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })} placeholder="Enter transaction ID from your payment" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px' }} required />
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Upload Payment Screenshot *</label>
                        <input type="file" accept="image/*" onChange={handleScreenshotChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                        {screenshotPreview && (
                          <div style={{ marginTop: '10px', textAlign: 'center' }}>
                            <img src={screenshotPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ddd' }} />
                          </div>
                        )}
                        <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>Upload screenshot of payment confirmation (JPEG, PNG, max 5MB)</p>
                      </div>
                    </>
                  )}

                  <div style={{ background: '#e8f5e9', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 15px', color: '#2e7d32' }}>Payment Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span>Consultation Fee</span>
                      <span>Rs. {FIXED_FEE}</span>
                    </div>
                    {formData.servicePrice > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>{formData.serviceName}</span>
                        <span>Rs. {formData.servicePrice}</span>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #c8e6c9', margin: '10px 0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' }}>
                      <span>Total Amount</span>
                      <span style={{ color: '#2e7d32' }}>Rs. {totalAmount}</span>
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handlePayment} disabled={paymentProcessing} style={{
                    width: '100%', padding: '16px', background: paymentProcessing ? '#ccc' : '#4CAF50', color: 'white', border: 'none',
                    borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: paymentProcessing ? 'not-allowed' : 'pointer'
                  }}>
                    {paymentProcessing ? (uploading ? 'Uploading screenshot...' : 'Processing...') : `Submit Payment for Rs. ${totalAmount}`}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 6 && (
            <motion.div key="step6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ color: '#4CAF50', marginBottom: '10px' }}>Payment Submitted!</h2>
                <p style={{ fontSize: '16px', marginBottom: '10px' }}>Your payment has been recorded and will be verified by admin.</p>
                <p style={{ color: '#666', marginBottom: '30px' }}>You will receive confirmation once payment is approved.</p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate('/user/my-appointments')} style={{ padding: '12px 24px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>View My Appointments</button>
                  <button onClick={() => { setCurrentStep(1); setFormData({ serviceId: "", serviceName: "", servicePrice: 0, doctorId: "", date: "", time: "", reason: "", easypaisaNumber: "", customerName: "", customerPhone: "" }); setScreenshotFile(null); setScreenshotPreview(null); }} style={{ padding: '12px 24px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Book Another Appointment</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
}

export default BookAppointment;