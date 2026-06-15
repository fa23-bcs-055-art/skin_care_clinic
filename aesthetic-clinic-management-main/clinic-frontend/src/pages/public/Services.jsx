import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "../../services/api";
import "./public.css";

// Helper to construct full image URL
function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/public'); // Public route
      console.log("📦 Services API Response:", res.data);
      res.data.forEach(service => {
        console.log(`  Service: ${service.name}`, {
          image: service.image,
          imageUrl: getImageUrl(service.image)
        });
      });
      setServices(res.data);
    } catch (error) {
      console.error('❌ Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (service) => {
    // Store the selected service in localStorage for post-login retrieval
    localStorage.setItem('pendingService', JSON.stringify({
      _id: service._id,
      name: service.name,
      price: service.price || 0,
      description: service.description
    }));
    // Navigate to register page - service will be preselected after login
    navigate('/register', { state: { selectedService: service.name } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 20px', background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          color: '#333',
          marginBottom: '15px',
          fontWeight: 'bold'
        }}>
          Our Premium Services
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Discover our comprehensive range of aesthetic and skincare treatments
        </p>
      </motion.div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {services.map((service, index) => (
          <motion.div
            key={service._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10, boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }}
            style={{
              background: 'white',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}
          >
            {/* Service Image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '220px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {service.image && service.image !== '/default-service.jpg' ? (
                <img
                  src={getImageUrl(service.image)}
                  alt={service.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    width: 'auto',
                    height: 'auto'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '60px'
                }}>
                  {service.icon || '✨'}
                </div>
              )}
              {service.isPopular && (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: '#FF6B6B',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  ⭐ Popular
                </div>
              )}
              {service.discountedPrice && (
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '15px',
                  background: '#4CAF50',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}>
                  Save {Math.round(((service.price - service.discountedPrice) / service.price) * 100)}%
                </div>
              )}
            </div>

            {/* Service Content */}
            <div style={{
              padding: '25px',
              display: 'flex',
              flexDirection: 'column',
              flex: 1
            }}>
              {/* Service Name */}
              <h3 style={{
                fontSize: '1.3rem',
                color: '#333',
                marginBottom: '10px',
                fontWeight: '600'
              }}>
                {service.name}
              </h3>

              {/* Category Badge */}
              {service.category && (
                <div style={{
                  display: 'inline-block',
                  background: '#E3F2FD',
                  color: '#1976D2',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  marginBottom: '12px',
                  width: 'fit-content',
                  fontWeight: '500'
                }}>
                  {service.category}
                </div>
              )}

              {/* Short Description */}
              <p style={{
                color: '#666',
                margin: '12px 0',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                flex: 1
              }}>
                {service.shortDescription || service.description}
              </p>

              {/* Duration & Price Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 0',
                borderTop: '1px solid #eee',
                borderBottom: '1px solid #eee',
                marginBottom: '15px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#555',
                  fontSize: '0.95rem'
                }}>
                  <span>⏱️</span>
                  <span>{service.duration}</span>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}>
                  {service.discountedPrice ? (
                    <>
                      <span style={{ textDecoration: 'line-through', color: '#999' }}>
                        PKR {service.price.toLocaleString('en-PK')}
                      </span>
                      <span style={{ color: '#4CAF50' }}>
                        PKR {service.discountedPrice.toLocaleString('en-PK')}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#667eea' }}>
                      PKR {service.price.toLocaleString('en-PK')}
                    </span>
                  )}
                </div>
              </div>

              {/* Book Now Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleBookNow(service)}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                📅 Book Now
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {services.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}
        >
          <p style={{ fontSize: '1.1rem' }}>No services available at the moment.</p>
        </motion.div>
      )}
    </div>
  );
}

export default Services;