import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "../../services/api";
import "./public.css";

function About() {
  const [settings, setSettings] = useState({});
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      setLoading(true);
      
      const [settingsRes, doctorRes] = await Promise.all([
        api.get('/settings/public').catch(() => ({ data: {} })),
        api.get('/doctor').catch(() => ({ data: null }))
      ]);

      setSettings(settingsRes.data);
      setDoctor(doctorRes.data || {
        name: "Dr. Hira Iftikhar",
        specialization: "Aesthetic Medicine Specialist",
        experience: "10+ years",
        image: "/dr.jpeg",
        qualification: "MBBS, MPH, CHPE, Fellowship in Aesthetic Medicine, RMP",
        bio: "Expert dermatologist dedicated to providing the best skincare treatments with personalized care."
      });
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setLoading(false);
    }
  };

  const technologies = [
    { name: "Diode Laser Hair Removal System", description: "Advanced diode laser technology for safe, effective, and long-term hair reduction. Suitable for multiple skin types with integrated cooling for patient comfort.", icon: "⚡" },
    { name: "Q-Switched Nd:YAG Laser", description: "Used for pigmentation correction, carbon facial, and tattoo removal. Delivers precise energy with minimal damage to surrounding skin.", icon: "🔫" },
    { name: "HIFU (High Intensity Focused Ultrasound)", description: "Ultherapy for face and body sculpting. Non-invasive lifting and tightening treatment.", icon: "📡" },
    { name: "Radiofrequency (RF) Skin Tightening System", description: "Non-invasive technology to stimulate collagen, improve skin laxity, and enhance facial contours.", icon: "📻" },
    { name: "Hydra Dermabrasion System", description: "A multi-step system for deep cleansing, exfoliation, hydration, and glow enhancement, suitable for all skin types.", icon: "💧" },
    { name: "Microneedling Device (Dermapen)", description: "Medical-grade microneedling for acne scars, pigmentation, fine lines, and PRP treatments, performed under strict aseptic protocols.", icon: "✍️" },
    { name: "PRP Centrifuge System", description: "High-precision centrifuge for Platelet-Rich Plasma preparation, used in facial rejuvenation and hair restoration procedures.", icon: "🩸" },
    { name: "LED Light Therapy Unit", description: "Clinically proven light wavelengths used to reduce acne, inflammation, pigmentation, and signs of aging.", icon: "💡" },
    { name: "High-Frequency Therapy Machine", description: "Used post-extractions and acne procedures to control bacteria, reduce inflammation, and promote healing.", icon: "⚡" },
    { name: "Ultrasonic Skin Scrubber", description: "Gentle ultrasonic exfoliation for comedone removal and improved skin texture.", icon: "🌀" },
    { name: "Oxygen Infusion Facial System", description: "Delivers oxygen and active serums to revitalize dull, stressed skin and enhance post-procedure recovery.", icon: "💨" },
    { name: "Electrocautery / RF Cautery", description: "Used for minor dermatological procedures such as skin tags and benign lesions, performed by a qualified physician.", icon: "🔥" },
    { name: "EMS Muscle Sculpting Machine", description: "Non-invasive body contouring and muscle toning for enhanced results.", icon: "💪" },
    { name: "Plasma Pen (Fibroblast)", description: "Advanced skin tightening and rejuvenation technology.", icon: "✍️" }
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="about-page">
      <motion.section 
        className="page-hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1>About <span className="highlight">Us</span></h1>
        <p>{settings.clinicName || 'Aesthetics by Dr. Hira Iftikhar'}</p>
      </motion.section>

      {/* Our Story Section */}
      <motion.section 
        className="story-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <div className="story-grid">
            <div className="story-content">
              <h2>Our <span className="highlight">Story</span></h2>
              <p>Welcome to Aesthetics by Dr. Hira Iftikhar, a premier aesthetic medicine clinic dedicated to providing exceptional skincare treatments with personalized care. Led by Dr. Hira Iftikhar, a highly qualified aesthetic medicine specialist with advanced certifications including MBBS, MPH, CHPE, and Fellowship in Aesthetic Medicine.</p>
              <p>Our clinic is built on the philosophy of combining medical expertise with artistic vision to help our patients achieve their aesthetic goals naturally and safely. We believe in personalized treatment plans that address individual concerns while maintaining the highest standards of medical care.</p>
              <p>Located in the heart of Sahiwal, our state-of-the-art facility offers a welcoming environment where patients can feel comfortable and confident in their skincare journey.</p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">
                <img 
                  src="/procedure.jpeg" 
                  alt="Clinic Procedure"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '20px'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Doctor Section with Image */}
      <motion.section 
        className="doctor-detailed-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <h2>Meet Our <span className="highlight">Expert</span></h2>
          <div className="doctor-detailed">
            <motion.div 
              className="doctor-image-large"
              whileHover={{ scale: 1.05 }}
            >
              <img src={doctor.image || "/dr.jpeg"} alt={doctor.name} />
            </motion.div>
            <div className="doctor-info">
              <h3>{doctor.name}</h3>
              <p className="specialization">{doctor.specialization}</p>
              <p className="qualification">{doctor.qualification}</p>
              <p className="experience">Experience: {doctor.experience}</p>
              <p className="bio">{doctor.bio}</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Technology & Equipment Section */}
      <motion.section 
        className="technology-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="container">
          <h2>Our <span className="highlight">Technology</span> & Equipment</h2>
          <p className="section-subtitle">Advanced medical-grade technology for exceptional results</p>
          
          <div className="technology-grid">
            {technologies.map((tech, index) => (
              <motion.div 
                key={index}
                className="technology-card"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="tech-icon">{tech.icon}</div>
                <h3>{tech.name}</h3>
                <p>{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default About;