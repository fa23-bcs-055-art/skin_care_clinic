import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api, { getImageUrl } from "../../services/api";
import "./public.css";

function BeforeAfter() {
  const [beforeAfter, setBeforeAfter] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeforeAfter();
  }, []);

  const fetchBeforeAfter = async () => {
    try {
      // ✅ Get published before/after images
      const res = await api.get('/gallery/before-after');
      console.log("🖼️ Before/After API Response:", res.data);
      res.data.forEach(item => {
        console.log(`  Result: ${item.patientName || 'Patient'}`, {
          beforeImage: item.beforeImage,
          beforeUrl: getImageUrl(item.beforeImage),
          afterImage: item.afterImage,
          afterUrl: getImageUrl(item.afterImage)
        });
      });
      setBeforeAfter(res.data);
    } catch (error) {
      console.error('❌ Error fetching before/after:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="before-after-page before-after-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="container">
        {/* Page Header */}
        <motion.div 
          className="page-header"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ textAlign: 'center', marginBottom: '50px' }}
        >
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
            Before & <span style={{ color: '#667eea' }}>After</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            See the amazing results our patients have achieved
          </p>
        </motion.div>

        {/* Before/After Grid */}
        <div className="before-after-grid">
          {beforeAfter.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }}
              className="before-after-card"
            >
              {/* Before/After Images Container */}
              <div className="before-after-images">
                {/* Before Image */}
                <div className="before-after-img-container">
                  {item.beforeImage ? (
                    <>
                      <img 
                        src={getImageUrl(item.beforeImage)} 
                        alt="Before"
                        className="before-after-img"
                      />
                      <span className="before-after-label before">📷 Before</span>
                    </>
                  ) : (
                    <span style={{ color: '#999' }}>No Before Image</span>
                  )}
                </div>

                {/* After Image */}
                <div className="before-after-img-container">
                  {item.afterImage ? (
                    <>
                      <img 
                        src={getImageUrl(item.afterImage)} 
                        alt="After"
                        className="before-after-img"
                      />
                      <span className="before-after-label after">✨ After</span>
                    </>
                  ) : (
                    <span style={{ color: '#999' }}>No After Image</span>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="before-after-info">
                <h3>
                  {item.patientName || 'Patient'}
                </h3>
                <p>
                  {item.treatmentName || item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {beforeAfter.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p>No before/after images available yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default BeforeAfter;
