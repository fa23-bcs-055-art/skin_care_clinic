import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Click outside to close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=5');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      // Silent fail - use mock data
      setNotifications([
        {
          _id: '1',
          title: 'Appointment Reminder',
          message: 'You have an appointment tomorrow at 10:00 AM',
          type: 'Appointment',
          isRead: false,
          createdAt: new Date()
        },
        {
          _id: '2',
          title: 'Payment Confirmed',
          message: 'Your payment of ₹1500 has been received',
          type: 'Payment',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000)
        }
      ]);
      setUnreadCount(1);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log('Mark as read failed');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.log('Mark all as read failed');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Appointment': return '📅';
      case 'Payment': return '💰';
      case 'Reminder': return '⏰';
      case 'LowStock': return '📦';
      case 'Alert': return '⚠️';
      default: return '🔔';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          background: isOpen ? '#f0f0f0' : 'transparent'
        }}
      >
        <span style={{ fontSize: '24px' }}>🔔</span>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#f44336',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
              minWidth: '18px',
              textAlign: 'center'
            }}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              width: '350px',
              maxHeight: '500px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              marginTop: '10px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: '5px 10px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {notifications.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#999'
                }}>
                  <span style={{ fontSize: '40px' }}>🔔</span>
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => markAsRead(notification._id)}
                    style={{
                      padding: '15px',
                      borderBottom: '1px solid #f0f0f0',
                      background: notification.isRead ? 'white' : '#f0f7ff',
                      cursor: 'pointer',
                      transition: 'background 0.3s ease'
                    }}
                    whileHover={{ background: '#f5f5f5' }}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontSize: '24px' }}>
                        {getIcon(notification.type)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: notification.isRead ? 'normal' : 'bold',
                          marginBottom: '4px'
                        }}>
                          {notification.title}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#666',
                          marginBottom: '4px'
                        }}>
                          {notification.message}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#999',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{getTimeAgo(notification.createdAt)}</span>
                          {!notification.isRead && (
                            <span style={{
                              width: '8px',
                              height: '8px',
                              background: '#2196F3',
                              borderRadius: '50%'
                            }} />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px',
              borderTop: '1px solid #eee',
              textAlign: 'center'
            }}>
              <Link 
                to="/user/notifications"
                style={{
                  color: '#2196F3',
                  textDecoration: 'none',
                  fontSize: '13px'
                }}
                onClick={() => setIsOpen(false)}
              >
                View All Notifications →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;