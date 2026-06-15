import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api, { getImageUrl } from "../../services/api";
import toast from "react-hot-toast";

function ImageUpload({ 
  onUpload, 
  currentImage, 
  folder = 'gallery',
  multiple = false,
  maxFiles = 5,
  accept = "image/*"
}) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const inputId = useMemo(() => `file-upload-${folder}-${Math.random().toString(36).slice(2,9)}`, [folder]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return;
      }
    }

    // Create previews
    const newPreviews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviews(newPreviews);

    // Upload files
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      
      // ✅ IMPORTANT: Add folder to formData
      formData.append('folder', folder);
      
      if (multiple) {
        files.forEach(file => formData.append('images', file));
        
        const res = await api.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const urls = res.data.images.map(img => img.url);
        console.log("📤 Multiple images uploaded:", urls);
        setUploadedUrls(urls);
        onUpload?.(multiple ? urls : urls[0]);
        toast.success(`${files.length} image(s) uploaded successfully`);
      } else {
        formData.append('image', files[0]);
        
        const res = await api.post('/upload/image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const imageUrl = res.data.imageUrl;
        console.log("📤 Image uploaded successfully:", {
          uploadedUrl: imageUrl,
          fullUrl: getImageUrl(imageUrl)
        });
        setUploadedUrls([imageUrl]);
        onUpload?.(imageUrl);
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removePreview = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setPreviews([]);
    setUploadedUrls([]);
  };

  return (
    <div style={styles.container}>
      {/* Upload Area */}
      <div style={styles.uploadArea}>
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={styles.fileInput}
          id={inputId}
          multiple={multiple}
        />
        <label htmlFor={inputId} style={styles.uploadLabel}>
          {uploading ? (
            <div style={styles.uploading}>
              <div style={styles.spinner} />
              <span>Uploading...</span>
            </div>
          ) : (
            <div style={styles.uploadContent}>
              <span style={styles.uploadIcon}>📁</span>
              <span style={styles.uploadText}>
                {multiple ? 'Click to upload images' : 'Click to upload image'}
              </span>
              <span style={styles.uploadHint}>
                Max size: 10MB • Supported: JPG, PNG, GIF, WEBP
              </span>
            </div>
          )}
        </label>
      </div>

      {/* Current Image Preview */}
      {currentImage && !multiple && previews.length === 0 && (
        <div style={styles.currentImageContainer}>
          <h4 style={styles.previewTitle}>Current Image:</h4>
          {console.log("🖼️ Displaying current image:", { 
            raw: currentImage, 
            withUrl: getImageUrl(currentImage) 
          })}
          <img 
            src={getImageUrl(currentImage)} 
            alt="Current" 
            style={styles.currentImage}
            onError={(e) => {
              console.warn("❌ Current image failed to load:", currentImage);
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Previews */}
      <AnimatePresence>
        {previews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.previewsContainer}
          >
            <div style={styles.previewHeader}>
              <h4 style={styles.previewTitle}>Preview:</h4>
              {previews.length > 1 && (
                <button onClick={clearAll} style={styles.clearButton}>
                  Clear All
                </button>
              )}
            </div>
            <div style={styles.previewGrid}>
              {previews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  style={styles.previewItem}
                >
                  <img 
                    src={preview.preview} 
                    alt={`Preview ${index + 1}`} 
                    style={styles.previewImage}
                  />
                  <button
                    onClick={() => removePreview(index)}
                    style={styles.removeButton}
                  >
                    ×
                  </button>
                  {uploadedUrls[index] && (
                    <span style={styles.uploadedBadge}>✅</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    marginBottom: '20px'
  },
  uploadArea: {
    marginBottom: '20px'
  },
  fileInput: {
    display: 'none'
  },
  uploadLabel: {
    display: 'block',
    padding: '40px 20px',
    background: '#f9f9f9',
    border: '2px dashed #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s'
  },
  uploadContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  uploadIcon: {
    fontSize: '48px'
  },
  uploadText: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '500'
  },
  uploadHint: {
    fontSize: '13px',
    color: '#999'
  },
  uploading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  currentImageContainer: {
    marginBottom: '20px'
  },
  currentImage: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: '1px solid #ddd'
  },
  previewsContainer: {
    marginTop: '20px'
  },
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  previewTitle: {
    margin: 0,
    color: '#333'
  },
  clearButton: {
    padding: '5px 10px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '10px'
  },
  previewItem: {
    position: 'relative',
    aspectRatio: '1/1'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  removeButton: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    width: '20px',
    height: '20px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px'
  },
  uploadedBadge: {
    position: 'absolute',
    bottom: '-5px',
    right: '-5px',
    fontSize: '14px'
  }
};

// Add keyframe animation for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ImageUpload;