import api from './api';
import toast from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.notifications = [];
    this.unreadCount = 0;
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({ notifications: this.notifications, unreadCount: this.unreadCount });
    });
  }

  async getUserNotifications() {
    try {
      const response = await api.get('/notifications');
      this.notifications = response.data.notifications || [];
      this.unreadCount = response.data.unreadCount || 0;
      this.notifyListeners();
      return { 
        notifications: this.notifications, 
        unreadCount: this.unreadCount 
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Request timeout. Please check your connection.');
      } else if (error.response?.status === 401) {
        toast.error('Please login again');
      } else {
        toast.error('Failed to load notifications');
      }
      return { notifications: [], unreadCount: 0 };
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      
      // Update local state only if successful
      const notification = this.notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      
      this.notifications = this.notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      );
      
      this.notifyListeners();
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      if (error.response?.status === 404) {
        toast.error('Notification not found');
      } else {
        toast.error('Failed to mark as read');
      }
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      await api.put('/notifications/mark-all/read');
      
      this.unreadCount = 0;
      this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
      this.notifyListeners();
      
      toast.success('All notifications marked as read');
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}`);
      
      const deletedNotification = this.notifications.find(n => n._id === notificationId);
      this.notifications = this.notifications.filter(n => n._id !== notificationId);
      
      if (deletedNotification && !deletedNotification.isRead) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      
      this.notifyListeners();
      toast.success('Notification deleted');
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      if (error.response?.status === 404) {
        toast.error('Notification not found');
      } else {
        toast.error('Failed to delete notification');
      }
      throw error;
    }
  }

  getUnreadCount() {
    return this.unreadCount;
  }

  getAllNotifications() {
    return this.notifications;
  }
}

const notificationService = new NotificationService();
export default notificationService;