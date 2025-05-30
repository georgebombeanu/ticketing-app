import React, { createContext, useContext, useState, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      createdAt: new Date(),
      isRead: false,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Simulate real-time notifications (replace with WebSocket/SSE in production)
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly add a notification for demo purposes
      if (Math.random() > 0.95) { // 5% chance every 5 seconds
        const demoNotifications = [
          {
            type: 'ticket_assigned',
            title: 'New ticket assigned',
            message: 'A new ticket has been assigned to you',
            priority: 'medium',
            ticketId: Math.floor(Math.random() * 1000) + 100,
          },
          {
            type: 'ticket_comment',
            title: 'New comment',
            message: 'Someone commented on your ticket',
            priority: 'low',
            ticketId: Math.floor(Math.random() * 1000) + 100,
          },
          {
            type: 'ticket_updated',
            title: 'Ticket status changed',
            message: 'A ticket status has been updated',
            priority: 'medium',
            ticketId: Math.floor(Math.random() * 1000) + 100,
          },
        ];
        const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
        addNotification(randomNotification);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount: notifications.filter(n => !n.isRead).length,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};