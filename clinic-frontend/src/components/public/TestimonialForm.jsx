import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";

function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/testimonials');
      setTestimonials(res.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader} />
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>What Our Patients Say</h2>
      
      <div style={styles.sliderContainer}>
        <button onClick={prevTestimonial} style={styles.navButton}>←</button>
        
        <div style={styles.testimonialWrapper}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={styles.testimonial}
          >
            <div style={styles.rating}>
              {renderStars(testimonials[currentIndex].rating || 5)}
            </div>
            <p style={styles.text}>"{testimonials[currentIndex].text}"</p>
            <div style={styles.patientInfo}>
              {testimonials[currentIndex].patientImage ? (
                <img 
                  src={testimonials[currentIndex].patientImage} 
                  alt={testimonials[currentIndex].patientName}
                  style={styles.patientImage}
                />
              ) : (
                <div style={styles.patientAvatar}>
                  {testimonials[currentIndex].patientName?.charAt(0)}
                </div>
              )}
              <span style={styles.patientName}>
                {testimonials[currentIndex].patientName}
              </span>
            </div>
          </motion.div>
        </div>

        <button onClick={nextTestimonial} style={styles.navButton}>→</button>
      </div>

      <div style={styles.dots}>
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              ...styles.dot,
              background: index === currentIndex ? '#2196F3' : '#ddd'
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '60px 20px',
    background: '#f9f9f9',
    textAlign: 'center'
  },
  title: {
    fontSize: '32px',
    color: '#333',
    marginBottom: '40px'
  },
  sliderContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  navButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    background: '#2196F3',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  testimonialWrapper: {
    flex: 1,
    minHeight: '250px'
  },
  testimonial: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  rating: {
    color: '#FFC107',
    fontSize: '20px',
    marginBottom: '15px'
  },
  text: {
    fontSize: '18px',
    lineHeight: '1.6',
    color: '#666',
    marginBottom: '20px',
    fontStyle: 'italic'
  },
  patientInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  patientImage: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  patientAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#2196F3',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  patientName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '20px'
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  loaderContainer: {
    padding: '40px',
    textAlign: 'center'
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  }
};

export default Testimonials;