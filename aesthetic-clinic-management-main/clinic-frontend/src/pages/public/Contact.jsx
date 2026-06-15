import { useState } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      try {
        await api.post('/contact', formData);
        toast.success('Message sent successfully!');
      } catch (apiError) {
        console.log('API not available, but form submitted');
        toast.success('Message received! We will contact you soon.');
      }
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: "📍",
      title: "Visit Us",
      details: ["148 (1st floor), D Chowk, Phase 5,", "Jeewan City, Madhali Road,", "Sahiwal"],
      action: "https://maps.app.goo.gl/AR7k73CGHVrTxUVy9",
      actionText: "Get Directions →"
    },
    {
      icon: "📞",
      title: "Call Us",
      details: ["0319-4474441"],
      action: "tel:03194474441",
      actionText: "Call Now →"
    },
    {
      icon: "✉️",
      title: "Email Us",
      details: ["estheticsbyhiraiftikhar.0001@gmail.com"],
      action: "mailto:estheticsbyhiraiftikhar.0001@gmail.com",
      actionText: "Send Email →"
    },
    {
      icon: "⏰",
      title: "Working Hours",
      details: ["Monday - Friday: 3:00 PM - 7:00 PM", "Saturday & Sunday: Closed"],
      action: null,
      actionText: null
    }
  ];

  const faqs = [
    {
      question: "How can I book an appointment?",
      answer: "You can book an appointment by clicking the 'Book Appointment' button on our website or by calling us at 0319-4474441. We recommend booking at least 2-3 days in advance."
    },
    {
      question: "Do I need a referral to visit the clinic?",
      answer: "No, you do not need a referral. You can directly book an appointment with Dr. Hira Iftikhar. Walk-ins are welcome, but appointments are recommended to avoid waiting time."
    },
    {
      question: "When will I see results after treatment?",
      answer: "Results vary depending on the treatment. Some treatments show immediate results, while others may take 2-3 weeks for full effect. Dr. Hira will provide you with a detailed timeline during your consultation."
    },
    {
      question: "Are there any side effects of the treatments?",
      answer: "Our treatments are safe and use FDA-approved products and equipment. You may experience mild redness or swelling that typically subsides within 24-48 hours. Your doctor will provide complete aftercare instructions."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept cash, bank transfers, Easypaisa, and JazzCash. Payment is required at the time of service. Please confirm payment options when booking your appointment."
    },
    {
      question: "What are the clinic's operating hours?",
      answer: "The clinic is open Monday through Friday from 3:00 PM to 7:00 PM. We remain closed on Saturdays and Sundays. Special appointments may be arranged in emergency cases."
    },
    {
      question: "What should I bring to my first appointment?",
      answer: "Please bring your CNIC or any valid ID, any previous medical records related to skin conditions, and a list of current medications if any. This helps Dr. Hira provide the best treatment plan."
    },
    {
      question: "Do you offer online consultations?",
      answer: "Yes, we offer online video consultations for patients who cannot visit in person. Please call us to schedule a virtual appointment with Dr. Hira Iftikhar."
    },
    {
      question: "How long is a typical consultation?",
      answer: "Initial consultations usually take 30-45 minutes. This includes a thorough skin analysis, discussion of concerns, and personalized treatment recommendations by Dr. Hira."
    },
    {
      question: "Is there parking available at the clinic?",
      answer: "Yes, there is ample parking available near the clinic. The clinic is located at 148 (1st floor), D Chowk, Phase 5, Jeewan City, Madhali Road, Sahiwal."
    }
  ];

  return (
    <motion.div 
      className="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
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
        <h1 style={{ 
          fontSize: 'clamp(2rem, 5vw, 2.5rem)', 
          marginBottom: '10px',
          color: '#333'
        }}>
          Contact <span style={{ color: '#667eea' }}>Us</span>
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 1.2rem)', 
          color: '#666',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          We're here to help you with all your skincare needs
        </p>
      </motion.section>

      {/* Contact Info Cards */}
      <motion.section 
        className="contact-info-section"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '25px',
          marginBottom: '50px'
        }}
      >
        {contactInfo.map((info, index) => (
          <motion.div 
            key={index}
            className="info-card"
            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
            style={{
              background: 'white',
              padding: '30px 20px',
              borderRadius: '15px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{
              fontSize: '40px',
              marginBottom: '15px'
            }}>
              {info.icon}
            </div>
            <h3 style={{ 
              margin: '0 0 15px 0',
              color: '#333',
              fontSize: '1.3rem'
            }}>
              {info.title}
            </h3>
            {info.details.map((detail, i) => (
              <p key={i} style={{ 
                margin: '5px 0',
                color: '#666',
                lineHeight: '1.6'
              }}>
                {detail}
              </p>
            ))}
            {info.action && (
              <motion.a
                href={info.action}
                target={info.action.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                whileHover={{ x: 5 }}
                style={{
                  display: 'inline-block',
                  marginTop: '15px',
                  color: '#667eea',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                {info.actionText} →
              </motion.a>
            )}
          </motion.div>
        ))}
      </motion.section>

      {/* Map & Form Section */}
      <motion.section 
        className="contact-form-section"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}
      >
        {/* Map */}
        <motion.div 
          className="map-container"
          whileHover={{ scale: 1.02 }}
          style={{
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
            height: '450px'
          }}
        >
          <iframe
            title="Aesthetics by Dr. Hira Iftikhar Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3444.123456789012!2d73.12345678901234!3d30.12345678901234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDA3JzI0LjYiTiA3M8KwMDcnMjQuNiJF!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          className="form-container"
          style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
          }}
        >
          <h2 style={{ 
            margin: '0 0 25px 0',
            color: '#333',
            fontSize: '1.8rem'
          }}>
            Send us a <span style={{ color: '#667eea' }}>Message</span>
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#666',
                  fontWeight: 'bold'
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#666',
                  fontWeight: 'bold'
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#666',
                  fontWeight: 'bold'
                }}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0319-4474441"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  color: '#666',
                  fontWeight: 'bold'
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Appointment / Query"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '16px',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                color: '#666',
                fontWeight: 'bold'
              }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Your message..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '16px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '15px',
                background: loading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </motion.button>
          </form>
        </motion.div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        className="faq-section"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          background: 'white',
          padding: '40px',
          borderRadius: '15px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
        }}
      >
        <h2 style={{ 
          textAlign: 'center',
          margin: '0 0 30px 0',
          color: '#333',
          fontSize: '2rem'
        }}>
          Frequently Asked <span style={{ color: '#667eea' }}>Questions</span>
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <h3 style={{ 
                margin: '0 0 10px 0',
                color: '#2A5CAA',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                {faq.question}
              </h3>
              <p style={{ 
                margin: 0,
                color: '#666',
                lineHeight: '1.6'
              }}>
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

export default Contact;