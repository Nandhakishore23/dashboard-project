import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ActivityLog, Notification } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activities: ActivityLog[];
  unreadCount: number;
  markAllRead: () => void;
}

const defaultValue: SocketContextType = {
  socket: null,
  isConnected: false,
  activities: [],
  unreadCount: 0,
  markAllRead: () => {},
};

const SocketContext = createContext<SocketContextType>(defaultValue);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      socket?.disconnect();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketInstance = io('http://localhost:4000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('connect_error', () => {
      setIsConnected(false);
    });

    socketInstance.on('activity:catchup', ({ activities: catchUpActivities }: { activities: ActivityLog[] }) => {
      setActivities(catchUpActivities || []);
    });

    socketInstance.on('activity:new', ({ activity }: { activity: ActivityLog }) => {
      setActivities((prev) => [activity, ...prev.slice(0, 19)]);
    });

    socketInstance.on('notification:count', ({ count }: { count: number }) => {
      setUnreadCount(count);
    });

    socketInstance.on('notification:new', () => {
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activities,
        unreadCount,
        markAllRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
