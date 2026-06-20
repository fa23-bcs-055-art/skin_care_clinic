import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";
import "./public.css";

function Home() {
  console.log("🟢 HOME COMPONENT IS RENDERING - This should appear on screen!");
  
  const [clinicData, setClinicData] = useState({
    settings: {},
    services: [],
    doctor: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🟢 Home useEffect - Fetching data");
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      console.log("🟢 Fetching home data...");
      
      // Fetch all data in parallel
      const [settingsRes, servicesRes, doctorsRes] = await Promise.all([
        api.get('/settings/public').catch(() => ({ data: {} })),
        api.get('/services/public').catch(() => ({ data: [] })),
        api.get('/doctor').catch(() => ({ data: null }))
      ]);

      console.log("🟢 Data fetched:", {
        settings: !!settingsRes.data,
        services: servicesRes.data?.length,
        doctor: !!doctorsRes.data
      });

      // Updated doctor data with correct information
      const doctor = {
        name: "Dr. Hira Iftikhar",
        specialization: "Aesthetic Medicine Specialist",
        experience: "10+ years",
        image: "/dr.jpeg",
        qualification: "MBBS, MPH, CHPE, Fellowship in Aesthetic Medicine, RMP",
        bio: "Dr. Hira Iftikhar is a highly qualified aesthetic medicine specialist with extensive experience in dermatological and aesthetic treatments. With advanced certifications including MBBS, MPH, CHPE, and Fellowship in Aesthetic Medicine, she is dedicated to providing the highest quality skincare treatments with personalized care. Specializes in anti-aging, acne treatment, laser therapy, and cosmetic dermatology."
      };

      setClinicData({
        settings: settingsRes.data,
        services: servicesRes.data.slice(0, 4),
        doctor: doctorsRes.data || doctor
      });

    } catch (error) {
      console.error('🔴 Error fetching home data:', error);
    } finally {
      setLoading(false);
      console.log("🟢 Loading set to false");
    }
  };

  if (loading) {
    console.log("🟢 Showing loading spinner");
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  console.log("🟢 Rendering full home page content");
  
  return (
    <div className="home-page">
      {/* 🔥 MODERN HERO SECTION with Background Image */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Dark Overlay for better text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)',
          zIndex: 1
        }} />
        
        {/* Animated Background Circles */}
        <div className="hero-bg-animation" style={{ zIndex: 1 }}>
          <motion.div 
            className="circle circle-1"
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          <motion.div 
            className="circle circle-2"
            animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
        </div>

        <div className="hero-content">
          <motion.h1 
            className="hero-title"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              marginBottom: '1rem',
              fontWeight: 'bold'
            }}
          >
            Aesthetics by <br />
            <span style={{ color: '#FFD966' }}>Dr. Hira Iftikhar</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: '600px',
              margin: '0 auto 2rem',
              opacity: 0.9
            }}
          >
            Advanced aesthetic treatments by Dr. Hira Iftikhar, your trusted aesthetic medicine specialist
          </motion.p>
          
          <motion.div 
            className="hero-buttons"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/register'}
              style={{
                padding: '12px 32px',
                background: 'white',
                color: '#667eea',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
              }}
            >
              Book Consultation
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/services'}
              style={{
                padding: '12px 32px',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '50px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Our Services
            </motion.button>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            className="hero-stats"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="stat-item">
              <h3>10+</h3>
              <p>Years Experience</p>
            </div>
            <div className="stat-item">
              <h3>5000+</h3>
              <p>Happy Patients</p>
            </div>
            <div className="stat-item">
              <h3>5+</h3>
              <p>Specializations</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Doctor Section - Only place where doctor image appears */}
      <motion.section 
        className="doctor-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={{ 
          textAlign: 'center', 
          fontSize: 'clamp(2rem, 4vw, 2.5rem)',
          marginBottom: '2rem'
        }}>
          Meet Your <span style={{ color: '#667eea' }}>Doctor</span>
        </h2>
        <div className="doctor-profile">
          <motion.div 
            className="doctor-image-large"
            whileHover={{ scale: 1.05 }}
          >
            {clinicData.doctor?.image && clinicData.doctor.image !== '👩‍⚕️' ? (
              <img 
                src={clinicData.doctor.image} 
                alt={clinicData.doctor.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{ fontSize: '150px' }}>👩‍⚕️</div>
            )}
          </motion.div>
          <div className="doctor-details">
            <h3 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#2A5CAA' }}>
              {clinicData.doctor?.name}
            </h3>
            <p className="specialization" style={{ color: '#667eea', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {clinicData.doctor?.specialization}
            </p>
            <p className="qualification" style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {clinicData.doctor?.qualification}
            </p>
            <p className="experience" style={{ color: '#666', marginBottom: '1rem' }}>
              <strong>Experience:</strong> {clinicData.doctor?.experience}
            </p>
            <p className="doctor-bio" style={{ color: '#666', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {clinicData.doctor?.bio}
            </p>
            <Link to="/about" className="btn-outline">
              Know More →
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section 
        className="services-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
            marginBottom: '1rem'
          }}>
            Our <span style={{ color: '#667eea' }}>Services</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center', color: '#666', marginBottom: '3rem' }}>
            Professional skincare treatments tailored for you
          </p>
          
          <div className="services-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '30px'
          }}>
            {clinicData.services.map((service, index) => (
              <motion.div 
                key={service._id}
                className="service-card"
                whileHover={{ y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: 'white',
                  borderRadius: '15px',
                  textAlign: 'center',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="service-icon" style={{ fontSize: '48px', marginBottom: '15px' }}>
                  {service.icon || '✨'}
                </div>
                <h3 style={{ marginBottom: '10px' }}>{service.name}</h3>
                <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
                  {service.shortDescription || service.description?.substring(0, 100)}
                </p>
                <div className="service-footer">
                  <span className="price">
                    ₨{service.price?.toLocaleString()}
                  </span>
                  <span className="duration">
                    ⏱️ {service.duration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="view-all">
            <Link to="/services" className="btn-outline">
              View All Services →
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section 
        className="cta-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="cta-content">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>
            Ready to Transform Your Skin?
          </h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
            Book a consultation with Dr. Hira Iftikhar today
          </p>
          <motion.button
            className="btn-large"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/register'}
          >
            Book Appointment
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;
