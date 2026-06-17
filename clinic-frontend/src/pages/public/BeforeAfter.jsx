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
      className="before-after-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '40px 20px' }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '40px'
        }}>
          {beforeAfter.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, boxShadow: '0 15px 40px rgba(0,0,0,0.15)' }}
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              {/* Before/After Images Container */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2px',
                background: '#eee'
              }}>
                {/* Before Image */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '300px',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {item.beforeImage ? (
                    <>
                      <img 
                        src={getImageUrl(item.beforeImage)} 
                        alt="Before"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>📷 Before</span>
                    </>
                  ) : (
                    <span style={{ color: '#999' }}>No Before Image</span>
                  )}
                </div>

                {/* After Image */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '300px',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {item.afterImage ? (
                    <>
                      <img 
                        src={getImageUrl(item.afterImage)} 
                        alt="After"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          display: 'block'
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(76, 175, 80, 0.9)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>✨ After</span>
                    </>
                  ) : (
                    <span style={{ color: '#999' }}>No After Image</span>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div style={{
                padding: '20px',
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  marginBottom: '8px',
                  color: '#333',
                  fontWeight: '600'
                }}>
                  {item.patientName || 'Patient'}
                </h3>
                <p style={{
                  color: '#666',
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  margin: 0
                }}>
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