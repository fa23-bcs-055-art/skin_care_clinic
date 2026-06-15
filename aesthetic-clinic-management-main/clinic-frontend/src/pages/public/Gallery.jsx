import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api, { getImageUrl } from "../../services/api";
import "./public.css";

function PublicGallery() {
  const [images, setImages] = useState([]);
  const [beforeAfter, setBeforeAfter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchGallery();
    fetchBeforeAfter();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await api.get('/gallery/active');
      console.log("🎨 Gallery API Response:", res.data);
      res.data.forEach(img => {
        console.log(`  Gallery: ${img.title}`, {
          image: img.image,
          imageUrl: getImageUrl(img.image)
        });
      });
      setImages(res.data);
    } catch (error) {
      console.error('❌ Error fetching gallery:', error);
    }
  };

  const fetchBeforeAfter = async () => {
    try {
      const res = await api.get('/gallery/before-after');
      console.log("🖼️ Gallery Before/After API Response:", res.data);
      res.data.forEach(item => {
        console.log(`  BA: ${item.title}`, {
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

  const categories = ['all', ...new Set(images.map(img => img.category))];

  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loader} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.header}
      >
        <h1 style={styles.title}>Our Gallery</h1>
        <p style={styles.subtitle}>
          See our clinic, treatments, and amazing results
        </p>
      </motion.div>

      {/* Before/After Section */}
      {beforeAfter.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>✨ Before & After Results</h2>
          <div style={styles.baGrid}>
            {beforeAfter.map((ba, index) => (
              <motion.div
                key={ba._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={styles.baCard}
              >
                <div style={styles.baImages}>
                  <div style={styles.baImageContainer}>
                    <img src={getImageUrl(ba.beforeImage)} alt="Before" style={styles.baImage} />
                    <span style={styles.baLabel}>Before</span>
                  </div>
                  <div style={styles.baImageContainer}>
                    <img src={getImageUrl(ba.afterImage)} alt="After" style={styles.baImage} />
                    <span style={styles.baLabel}>After</span>
                  </div>
                </div>
                <p style={styles.baDescription}>{ba.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {images.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📷 Clinic Gallery</h2>
          
          {/* Category Filter */}
          <div style={styles.filterContainer}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  ...styles.filterButton,
                  background: selectedCategory === category ? '#2196F3' : '#f5f5f5',
                  color: selectedCategory === category ? 'white' : '#333'
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div style={styles.grid}>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                style={styles.card}
              >
                <img src={getImageUrl(image.image)} alt={image.title} style={styles.image} />
                {image.title && (
                  <div style={styles.overlay}>
                    <h3 style={styles.overlayTitle}>{image.title}</h3>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#666'
  },
  section: {
    marginBottom: '60px'
  },
  sectionTitle: {
    fontSize: '28px',
    marginBottom: '30px',
    color: '#333',
    textAlign: 'center'
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '30px'
  },
  filterButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s ease'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  baGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '30px'
  },
  card: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    aspectRatio: '1/1'
  },
  baCard: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    padding: '15px'
  },
  baImages: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px'
  },
  baImageContainer: {
    flex: 1,
    position: 'relative'
  },
  baImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  baLabel: {
    position: 'absolute',
    bottom: '5px',
    left: '5px',
    background: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  baDescription: {
    margin: '10px 0 0',
    color: '#666',
    fontSize: '14px',
    textAlign: 'center'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
    padding: '20px 15px 15px',
    color: 'white'
  },
  overlayTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '500'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px'
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default PublicGallery;