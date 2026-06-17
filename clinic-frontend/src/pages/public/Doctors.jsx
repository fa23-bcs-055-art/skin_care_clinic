import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../services/api";

function Doctors() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    try {
      setLoading(true);
      // Since it's a single doctor clinic
      const res = await api.get('/doctor');
      setDoctor(res.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      // Fallback data if API fails
      setDoctor({
        name: "Dr. Sarah Johnson",
        specialization: "Dermatologist",
        qualification: "MBBS, MD (Dermatology)",
        experience: "10+ years",
        bio: "Dr. Sarah Johnson is a renowned dermatologist with over 10 years of experience in skincare treatments. She specializes in anti-aging therapies, acne treatment, and cosmetic dermatology.",
        image: "👩‍⚕️",
        education: [
          "MBBS - All India Institute of Medical Sciences",
          "MD (Dermatology) - Stanford University",
          "Fellowship in Cosmetic Dermatology"
        ],
        achievements: [
          "Best Dermatologist Award 2023",
          "Published 15+ research papers",
          "Member of American Academy of Dermatology"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh' 
      }}>
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="doctors-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '40px 20px' }}
    >
      {/* Hero Section */}
      <motion.section 
        className="page-hero"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          Meet Your <span style={{ color: '#667eea' }}>Doctor</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          Expert dermatologist dedicated to your skincare journey
        </p>
      </motion.section>

      {/* Doctor Profile */}
      <motion.div 
        className="doctor-profile"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          padding: '40px'
        }}>
          {/* Left Column - Image & Basic Info */}
          <motion.div 
            className="doctor-left"
            whileHover={{ scale: 1.02 }}
            style={{
              textAlign: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              color: 'white'
            }}
          >
            <div style={{
              fontSize: '120px',
              marginBottom: '20px'
            }}>
              {doctor.image || '👩‍⚕️'}
            </div>
            <h2 style={{ fontSize: '28px', margin: '10px 0' }}>{doctor.name}</h2>
            <p style={{ fontSize: '18px', opacity: 0.9 }}>{doctor.specialization}</p>
            <p style={{ fontSize: '16px', marginTop: '15px' }}>{doctor.qualification}</p>
            <p style={{ fontSize: '16px', marginTop: '10px' }}>⭐ {doctor.experience} Experience</p>
          </motion.div>

          {/* Right Column - Details */}
          <div className="doctor-right" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '22px', marginBottom: '15px', color: '#333' }}>About</h3>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#666', marginBottom: '25px' }}>
              {doctor.bio}
            </p>

            <h3 style={{ fontSize: '22px', marginBottom: '15px', color: '#333' }}>Education</h3>
            <ul style={{ marginBottom: '25px' }}>
              {doctor.education?.map((edu, index) => (
                <motion.li 
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  style={{ 
                    marginBottom: '10px',
                    listStyle: 'none',
                    padding: '8px',
                    background: '#f8f9fa',
                    borderRadius: '5px'
                  }}
                >
                  🎓 {edu}
                </motion.li>
              ))}
            </ul>

            <h3 style={{ fontSize: '22px', marginBottom: '15px', color: '#333' }}>Achievements</h3>
            <ul>
              {doctor.achievements?.map((achievement, index) => (
                <motion.li 
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  style={{ 
                    marginBottom: '10px',
                    listStyle: 'none',
                    padding: '8px',
                    background: '#f8f9fa',
                    borderRadius: '5px'
                  }}
                >
                  🏆 {achievement}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Booking Button */}
        <motion.div 
          className="booking-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            padding: '30px',
            textAlign: 'center',
            borderTop: '1px solid #eee',
            background: '#f8f9fa'
          }}
        >
          <h3 style={{ marginBottom: '20px', color: '#333' }}>
            Ready to start your skincare journey?
          </h3>
          <Link 
            to="/register"
            style={{
              display: 'inline-block',
              padding: '15px 40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Book Appointment
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Doctors;