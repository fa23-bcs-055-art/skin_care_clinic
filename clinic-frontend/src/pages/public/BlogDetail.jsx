import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api, { getImageUrl } from "../../services/api";
import "./public.css";

function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const res = await api.get(`/blogs/${id}`);
      setBlog(res.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
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
      <div style={styles.loaderContainer}>
        <div style={styles.loader} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={styles.notFound}>
        <h2>Blog not found</h2>
        <Link to="/blogs" style={styles.backLink}>← Back to Blogs</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      <Link to="/blogs" style={styles.backLink}>← Back to Blogs</Link>

      <article style={styles.article}>
        {blog.image && (
          <img 
            src={getImageUrl(blog.image)} 
            alt={blog.title}
            style={styles.coverImage}
          />
        )}

        <div style={styles.meta}>
          <span style={styles.category}>{blog.category}</span>
          <span style={styles.date}>{formatDate(blog.publishedAt)}</span>
        </div>

        <h1 style={styles.title}>{blog.title}</h1>

        <div style={styles.author}>
          By {blog.author || 'Admin'} • 👁️ {blog.views || 0} views
        </div>

        <div style={styles.content}>
          {blog.content.split('\n').map((paragraph, index) => (
            <p key={index} style={styles.paragraph}>{paragraph}</p>
          ))}
        </div>

        {blog.tags && blog.tags.length > 0 && (
          <div style={styles.tags}>
            {blog.tags.map(tag => (
              <span key={tag} style={styles.tag}>#{tag}</span>
            ))}
          </div>
        )}
      </article>
    </motion.div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  backLink: {
    display: 'inline-block',
    marginBottom: '30px',
    color: '#2196F3',
    textDecoration: 'none',
    fontSize: '16px'
  },
  article: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  coverImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '30px'
  },
  meta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
  },
  category: {
    padding: '4px 12px',
    background: '#e3f2fd',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#1976d2'
  },
  date: {
    color: '#999',
    fontSize: '14px'
  },
  title: {
    fontSize: '36px',
    color: '#333',
    margin: '0 0 20px 0',
    lineHeight: '1.3'
  },
  author: {
    color: '#666',
    fontSize: '16px',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee'
  },
  content: {
    fontSize: '18px',
    lineHeight: '1.8',
    color: '#444'
  },
  paragraph: {
    marginBottom: '20px'
  },
  tags: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  tag: {
    padding: '4px 12px',
    background: '#f5f5f5',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#666'
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
  },
  notFound: {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#999'
  }
};

export default BlogDetail;