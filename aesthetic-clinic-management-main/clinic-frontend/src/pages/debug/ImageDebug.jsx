import { useState, useEffect } from "react";
import api, { getImageUrl } from "../../services/api";

function ImageDebug() {
  const [allItems, setAllItems] = useState({ blogs: [], services: [], gallery: [] });
  const [serverStatus, setServerStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadTest, setUploadTest] = useState(null);

  useEffect(() => {
    checkServer();
    loadAllImages();
  }, []);

  const checkServer = async () => {
    try {
      console.log("🔍 Checking server...");
      const res = await api.get('/diagnosis/files/check');
      console.log("✅ Server response:", res.data);
      setServerStatus(res.data);
    } catch (error) {
      console.error("❌ Server check failed:", error);
      setServerStatus({ error: error.message });
    }
  };

  const loadAllImages = async () => {
    try {
      setLoading(true);
      
      const [blogsRes, servicesRes, galleryRes] = await Promise.all([
        api.get('/blogs').catch(() => ({ data: [] })),
        api.get('/services/admin').catch(() => ({ data: [] })),
        api.get('/gallery')
      ]);

      const blogs = blogsRes.data || [];
      const services = servicesRes.data || [];
      const gallery = galleryRes.data || [];

      console.log("📝 Blogs:", blogs);
      console.log("💆 Services:", services);
      console.log("📸 Gallery:", gallery);

      setAllItems({ blogs, services, gallery });
    } catch (error) {
      console.error("❌ Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const testImageUrl = async (type, id, imagePath) => {
    try {
      console.log(`🧪 Testing image: ${type} - ${imagePath}`);
      const fullUrl = getImageUrl(imagePath);
      console.log(`📍 Full URL: ${fullUrl}`);
      
      // Try to fetch the image
      const response = await fetch(fullUrl);
      console.log(`📡 Fetch status: ${response.status}`);
      
      if (response.ok) {
        console.log("✅ Image is accessible!");
        setUploadTest({ success: true, url: fullUrl, type });
      } else {
        console.error(`❌ Image returned ${response.status}`);
        setUploadTest({ success: false, url: fullUrl, type, status: response.status });
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      setUploadTest({ success: false, error: error.message });
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "monospace", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1>🧪 Image Debug Panel</h1>

      {/* Server Status */}
      <section style={{ marginBottom: "30px", background: "white", padding: "20px", borderRadius: "8px" }}>
        <h2>🔍 Server Status</h2>
        <button onClick={checkServer} style={{ padding: "10px 20px", marginBottom: "10px", cursor: "pointer" }}>
          🔄 Refresh
        </button>
        <pre style={{ background: "#000", color: "#0f0", padding: "15px", borderRadius: "5px", overflow: "auto" }}>
          {JSON.stringify(serverStatus, null, 2)}
        </pre>
      </section>

      {/* Images Summary */}
      <section style={{ marginBottom: "30px", background: "white", padding: "20px", borderRadius: "8px" }}>
        <h2>📊 Images Summary</h2>
        <p>🔵 Blogs: {allItems.blogs.length}</p>
        <p>🔵 Services: {allItems.services.length}</p>
        <p>🔵 Gallery: {allItems.gallery.length}</p>
      </section>

      {/* Blogs */}
      <section style={{ marginBottom: "30px", background: "white", padding: "20px", borderRadius: "8px" }}>
        <h2>📝 Blogs</h2>
        {allItems.blogs.map(blog => (
          <div key={blog._id} style={{ marginBottom: "15px", padding: "10px", background: "#f9f9f9", borderLeft: "4px solid #2196F3" }}>
            <p><strong>Title:</strong> {blog.title}</p>
            <p><strong>Image in DB:</strong> {blog.image || "(empty)"}</p>
            {blog.image && (
              <>
                <p><strong>Full URL:</strong> {getImageUrl(blog.image)}</p>
                <button onClick={() => testImageUrl('blog', blog._id, blog.image)} style={{ marginRight: "10px" }}>
                  🧪 Test
                </button>
                <img 
                  src={getImageUrl(blog.image)} 
                  alt={blog.title}
                  style={{ maxWidth: "200px", marginTop: "10px", border: "1px solid #ddd" }}
                  onLoad={() => console.log("✅ Image loaded:", blog.image)}
                  onError={(e) => {
                    console.error("❌ Image failed to load:", blog.image);
                    e.target.style.border = "2px solid red";
                  }}
                />
              </>
            )}
          </div>
        ))}
      </section>

      {/* Services */}
      <section style={{ marginBottom: "30px", background: "white", padding: "20px", borderRadius: "8px" }}>
        <h2>💆 Services</h2>
        {allItems.services.map(service => (
          <div key={service._id} style={{ marginBottom: "15px", padding: "10px", background: "#f9f9f9", borderLeft: "4px solid #4CAF50" }}>
            <p><strong>Name:</strong> {service.name}</p>
            <p><strong>Image in DB:</strong> {service.image || "(empty)"}</p>
            {service.image && (
              <>
                <p><strong>Full URL:</strong> {getImageUrl(service.image)}</p>
                <button onClick={() => testImageUrl('service', service._id, service.image)} style={{ marginRight: "10px" }}>
                  🧪 Test
                </button>
                <img 
                  src={getImageUrl(service.image)} 
                  alt={service.name}
                  style={{ maxWidth: "200px", marginTop: "10px", border: "1px solid #ddd" }}
                  onLoad={() => console.log("✅ Image loaded:", service.image)}
                  onError={(e) => {
                    console.error("❌ Image failed to load:", service.image);
                    e.target.style.border = "2px solid red";
                  }}
                />
              </>
            )}
          </div>
        ))}
      </section>

      {/* Gallery */}
      <section style={{ marginBottom: "30px", background: "white", padding: "20px", borderRadius: "8px" }}>
        <h2>📸 Gallery</h2>
        {allItems.gallery.map(item => (
          <div key={item._id} style={{ marginBottom: "15px", padding: "10px", background: "#f9f9f9", borderLeft: "4px solid #FF9800" }}>
            <p><strong>Title:</strong> {item.title}</p>
            <p><strong>Image in DB:</strong> {item.image || "(empty)"}</p>
            {item.image && (
              <>
                <p><strong>Full URL:</strong> {getImageUrl(item.image)}</p>
                <button onClick={() => testImageUrl('gallery', item._id, item.image)} style={{ marginRight: "10px" }}>
                  🧪 Test
                </button>
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.title}
                  style={{ maxWidth: "200px", marginTop: "10px", border: "1px solid #ddd" }}
                  onLoad={() => console.log("✅ Image loaded:", item.image)}
                  onError={(e) => {
                    console.error("❌ Image failed to load:", item.image);
                    e.target.style.border = "2px solid red";
                  }}
                />
              </>
            )}
          </div>
        ))}
      </section>

      {/* Test Result */}
      {uploadTest && (
        <section style={{ marginBottom: "30px", background: "white", padding: "20px", borderRadius: "8px" }}>
          <h2>🧪 Test Result</h2>
          <div style={{ padding: "15px", background: uploadTest.success ? "#d4edda" : "#f8d7da", borderRadius: "5px" }}>
            <p style={{ color: uploadTest.success ? "#155724" : "#721c24" }}>
              {uploadTest.success ? "✅ SUCCESS" : "❌ FAILED"}
            </p>
            <p><strong>URL:</strong> {uploadTest.url}</p>
            {uploadTest.status && <p><strong>Status:</strong> {uploadTest.status}</p>}
            {uploadTest.error && <p><strong>Error:</strong> {uploadTest.error}</p>}
          </div>
        </section>
      )}
    </div>
  );
}

export default ImageDebug;
