/**
 * Notification Component
 * Real-time notifications with toast and bell icon
 */

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useRealTime';
import '../styles/Notifications.css';

// Toast Notification Component
const NotificationToast = ({ notification, onClose, onMarkRead }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = (type) => {
    const icons = {
      ENROLLMENT: '📚',
      NOTE_UPLOAD: '📄',
      APPROVAL: '✅',
      FEEDBACK_REPLY: '💬',
      ASSIGNMENT: '✏️',
      OTHER: '📢',
    };
    return icons[type] || '📢';
  };

  return (
    <div className={`notification-toast notification-${notification.type?.toLowerCase()}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon(notification.type)}</span>
        <div className="notification-text">
          <p className="notification-message">{notification.message}</p>
          <small className="notification-time">
            {new Date(notification.createdAt).toLocaleTimeString()}
          </small>
        </div>
      </div>
      <button className="notification-close" onClick={onClose}>×</button>
    </div>
  );
};

// Notification Bell with Dropdown
const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayedToasts, setDisplayedToasts] = useState([]);

  // Show new notifications as toasts
  useEffect(() => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    unreadNotifications.forEach((notif) => {
      if (!displayedToasts.find((t) => t.id === notif.id)) {
        setDisplayedToasts((prev) => [...prev, notif]);
      }
    });
  }, [notifications, displayedToasts]);

  const removeToast = (notificationId) => {
    setDisplayedToasts((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const handleNotificationClick = (notificationId, isRead) => {
    if (!isRead) {
      markAsRead(notificationId);
    }
  };

  const loadMore = () => {
    fetchNotifications(10, notifications.length);
  };

  return (
    <div className="notification-bell-container">
      {/* Toasts */}
      <div className="notification-toasts">
        {displayedToasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onClose={() => removeToast(toast.id)}
            onMarkRead={() => markAsRead(toast.id)}
          />
        ))}
      </div>

      {/* Bell Button */}
      <div className="notification-bell">
        <button
          className="bell-button"
          onClick={() => setShowDropdown(!showDropdown)}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="notification-dropdown">
            <div className="dropdown-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read"
                  onClick={() => {
                    markAllAsRead();
                    setShowDropdown(false);
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                  >
                    <div className="notification-item-content">
                      <p className="notification-item-message">{notif.message}</p>
                      <small className="notification-item-time">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <button
                      className="notification-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="dropdown-footer">
                <button className="load-more" onClick={loadMore}>
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
