import { useState, useEffect } from "react";
import api, { getImageUrl } from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import BlogModal from "../../components/admin/BlogModal";
import ImageUpload from "../../components/common/ImageUpload";

function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filter, setFilter] = useState('all'); // all, published, draft

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/blogs');
      setBlogs(res.data);
    } catch (error) {
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const togglePublish = async (id, currentStatus) => {
    try {
      await api.put(`/blogs/${id}`, { isPublished: !currentStatus });
      toast.success(`Blog ${!currentStatus ? 'published' : 'unpublished'} ✅`);
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Blog deleted ✅");
      fetchBlogs();
    } catch (error) {
      toast.error("Failed to delete blog");
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    if (filter === 'published') return blog.isPublished;
    if (filter === 'draft') return !blog.isPublished;
    return true;
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.header}>
        <h1>📝 Blog Management</h1>
        <div style={styles.headerActions}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Blogs</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            style={styles.addButton}
          >
            + Write New Blog
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Blogs</h3>
          <p style={styles.statValue}>{blogs.length}</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Published</h3>
          <p style={{ ...styles.statValue, color: '#4CAF50' }}>
            {blogs.filter(b => b.isPublished).length}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Drafts</h3>
          <p style={{ ...styles.statValue, color: '#FF9800' }}>
            {blogs.filter(b => !b.isPublished).length}
          </p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statTitle}>Total Views</h3>
          <p style={styles.statValue}>
            {blogs.reduce((sum, b) => sum + (b.views || 0), 0)}
          </p>
        </div>
      </div>

      {/* Blogs Table */}
      {loading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.loader} />
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Author</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Views</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map(blog => (
                <motion.tr 
                  key={blog._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.tableRow}
                >
                  <td style={styles.td}>
                    {blog.image ? (
                      <img 
                        src={getImageUrl(blog.image)} 
                        alt={blog.title}
                        style={styles.blogImage}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div style={styles.blogImagePlaceholder}>
                        📝
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={{ fontWeight: 'bold' }}>{blog.title}</div>
                    <small style={{ color: '#666' }}>
                      {blog.excerpt?.substring(0, 50)}...
                    </small>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.categoryBadge}>
                      {blog.category || 'General'}
                    </span>
                  </td>
                  <td style={styles.td}>{blog.author || 'Admin'}</td>
                  <td style={styles.td}>{formatDate(blog.publishedAt || blog.createdAt)}</td>
                  <td style={styles.td}>{blog.views || 0}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => togglePublish(blog._id, blog.isPublished)}
                      style={{
                        ...styles.statusButton,
                        background: blog.isPublished ? '#4CAF50' : '#FF9800'
                      }}
                    >
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        onClick={() => {
                          setEditData(blog);
                          setModalOpen(true);
                        }}
                        style={styles.editButton}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteBlog(blog._id)}
                        style={styles.deleteButton}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Blog Modal */}
      <BlogModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        refresh={fetchBlogs}
        editData={editData}
      />
    </motion.div>
  );
}

const styles = {
  container: {
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  filterSelect: {
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    cursor: 'pointer'
  },
  addButton: {
    padding: '10px 20px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    padding: '20px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statTitle: {
    margin: '0 0 10px 0',
    color: '#666',
    fontSize: '14px'
  },
  statValue: {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333'
  },
  tableContainer: {
    overflowX: 'auto',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f5f5f5'
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333'
  },
  tableRow: {
    borderBottom: '1px solid #eee'
  },
  td: {
    padding: '15px'
  },
  blogImage: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  blogImagePlaceholder: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#999'
  },
  categoryBadge: {
    padding: '4px 8px',
    background: '#e3f2fd',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#1976d2'
  },
  statusButton: {
    padding: '6px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  editButton: {
    padding: '5px 10px',
    background: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '5px 10px',
    background: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  loaderContainer: {
    textAlign: 'center',
    padding: '40px'
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

export default BlogManager;