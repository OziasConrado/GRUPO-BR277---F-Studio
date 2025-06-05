
'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';

interface NotificationContextType {
  notificationCount: number;
  setNotificationCount: Dispatch<SetStateAction<number>>;
  incrementNotificationCount: () => void;
  decrementNotificationCount: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notificationCount, setNotificationCount] = useState(0);

  const incrementNotificationCount = useCallback(() => {
    setNotificationCount((prevCount) => prevCount + 1);
  }, []);

  const decrementNotificationCount = useCallback(() => {
    setNotificationCount((prevCount) => Math.max(0, prevCount - 1));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotificationCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notificationCount,
        setNotificationCount,
        incrementNotificationCount,
        decrementNotificationCount,
        clearNotifications,
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
