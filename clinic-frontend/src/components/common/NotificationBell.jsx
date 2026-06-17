import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import notificationService from "../../services/notificationService";
import toast from "react-hot-toast";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    const unsubscribe = notificationService.addListener((data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });
    
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
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
      const data = await notificationService.getUserNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      // Error is already handled in service
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isLoading || unreadCount === 0) return;
    
    setIsLoading(true);
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      // Error is already handled in service
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await notificationService.deleteNotification(id);
    } catch (error) {
      // Error is already handled in service
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Appointment': return '📅';
      case 'Payment': return '💰';
      case 'Reminder': return '⏰';
      case 'LowStock': return '⚠️';
      case 'Alert': return '🔔';
      default: return '📢';
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="notification-bell" ref={dropdownRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          fontSize: '22px',
          padding: '8px',
          lineHeight: 1
        }}
        title="Notifications"
        disabled={isLoading}
      >
        🔔
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#f44336',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              border: '2px solid white'
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              width: '380px',
              maxWidth: '90vw',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              zIndex: 1000,
              overflow: 'hidden',
              marginTop: '10px'
            }}
          >
            <div style={{
              padding: '15px 20px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#fafafa'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                Notifications
                {unreadCount > 0 && (
                  <span style={{ 
                    marginLeft: '8px',
                    fontSize: '12px',
                    color: '#2196F3',
                    fontWeight: 'normal'
                  }}>
                    ({unreadCount} new)
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isLoading}
                  style={{
                    padding: '6px 12px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    opacity: isLoading ? 0.6 : 1
                  }}
                >
                  {isLoading ? '...' : 'Mark all read'}
                </button>
              )}
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔕</div>
                  <p style={{ margin: 0 }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid #f0f0f0',
                      background: notif.isRead ? 'white' : '#f0f7ff',
                      cursor: 'pointer',
                      transition: 'background 0.2s',
                      borderLeft: notif.isRead ? '3px solid transparent' : '3px solid #2196F3'
                    }}
                    onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '22px', lineHeight: 1, marginTop: '2px' }}>
                        {getIcon(notif.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: notif.isRead ? '500' : '600',
                          marginBottom: '4px',
                          fontSize: '14px',
                          color: '#333',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{notif.title}</span>
                          <span style={{ 
                            fontSize: '11px', 
                            color: '#999',
                            fontWeight: 'normal',
                            marginLeft: '10px',
                            whiteSpace: 'nowrap'
                          }}>
                            {getTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p style={{ 
                          margin: '0 0 5px', 
                          fontSize: '13px', 
                          color: '#666',
                          lineHeight: 1.4
                        }}>
                          {notif.message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(notif._id, e)}
                        disabled={isLoading}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          color: '#ccc',
                          padding: '4px',
                          lineHeight: 1,
                          flexShrink: 0
                        }}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;