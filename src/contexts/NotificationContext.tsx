
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Notification } from '@/types/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { useFirestore } from './FirestoreContext';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { db } = useFirestore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !db) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    const notificationsCollection = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(notificationsCollection, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Notification));
      
      const newUnreadCount = fetchedNotifications.filter(n => !n.read).length;
      
      setNotifications(fetchedNotifications);
      setUnreadCount(newUnreadCount);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, db]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
