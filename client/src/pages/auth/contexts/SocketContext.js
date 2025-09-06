import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io('http://localhost:5000');

      newSocket.on('connect', () => {
        // Authenticate with the server
        newSocket.emit('authenticate', token);
        
        // Set up heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          if (newSocket.connected) {
            newSocket.emit('heartbeat');
          } else {
            clearInterval(heartbeatInterval);
          }
        }, 25000); // Send heartbeat every 25 seconds
        
        // Store interval for cleanup
        newSocket.heartbeatInterval = heartbeatInterval;
      });

      newSocket.on('auth_error', (error) => {
        console.error('Socket authentication error:', error);
      });

      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      newSocket.on('disconnect', () => {
        // Clear online users when disconnected
        setOnlineUsers(new Set());
      });

      setSocket(newSocket);

      return () => {
        // Clear heartbeat interval
        if (newSocket.heartbeatInterval) {
          clearInterval(newSocket.heartbeatInterval);
        }
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
      setOnlineUsers(new Set());
    }
  }, [isAuthenticated, token]);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket) {
      socket.emit('send_message', {
        roomId,
        message,
        timestamp: new Date(),
      });
    }
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const value = {
    socket,
    onlineUsers,
    joinRoom,
    sendMessage,
    isUserOnline,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
