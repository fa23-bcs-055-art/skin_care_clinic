import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api, { getImageUrl } from "../../services/api";
import "./public.css";

function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      // ✅ Use PUBLIC endpoint that only returns published blogs
      const res = await api.get('/blogs/published');
      console.log("📝 Blogs API Response:", res.data);
      res.data.forEach(blog => {
        console.log(`  Blog: ${blog.title}`, {
          image: blog.image,
          imageUrl: getImageUrl(blog.image)
        });
      });
      setBlogs(res.data);
    } catch (error) {
      console.error('❌ Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      className="blogs-page"
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
            Our <span style={{ color: '#667eea' }}>Blog</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Latest news, tips, and insights from our clinic
          </p>
        </motion.div>

        {/* Blogs Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '30px'
        }}>
          {blogs.map((blog, index) => (
            <motion.article
              key={blog._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
            >
              <Link to={`/blog/${blog._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {blog.image && (
                  <img 
                    src={getImageUrl(blog.image)} 
                    alt={blog.title}
                    style={{
                      width: '100%',
                      height: '220px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div style={{ padding: '25px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      background: '#e3f2fd',
                      borderRadius: '20px',
                      fontSize: '12px',
                      color: '#1976d2'
                    }}>
                      {blog.category || 'General'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.3rem', marginBottom: '10px', color: '#333' }}>
                    {blog.title}
                  </h2>
                  <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
                    {blog.excerpt || blog.content?.substring(0, 120)}...
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #eee',
                    paddingTop: '15px'
                  }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>
                      By {blog.author || 'Admin'}
                    </span>
                    <span style={{ fontSize: '13px', color: '#999' }}>
                      👁️ {blog.views || 0} views
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        {blogs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <p>No blog posts available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Blogs;