import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface ToastAlert {
  id: string;
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning';
}

interface SocketContextType {
  socket: Socket | null;
  toasts: ToastAlert[];
  dismissToast: (id: string) => void;
  showToast: (title: string, body: string, type?: 'info' | 'success' | 'warning') => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const showToast = (title: string, body: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const newToast: ToastAlert = {
      id: Math.random().toString(),
      title,
      body,
      type,
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      dismissToast(newToast.id);
    }, 5000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      console.log('[SocketClient] Connected to server, ID:', s.id);
      if (user) {
        s.emit('join_user_channel', user.id);
      }
    });

    s.on('new_runner_trip', (tripData: any) => {
      showToast(
        '⚡ Student Runner Alert!',
        `${tripData.runnerName} is going to ${tripData.storeName} in ${tripData.estimatedArrival}! Tap to request items.`,
        'success'
      );
    });

    s.on('user_order_notification', (orderData: any) => {
      showToast(
        `Order Update #${orderData.orderNumber}`,
        `Status changed to: ${orderData.status}`,
        'info'
      );
    });

    s.on('chat_notification', (chatData: any) => {
      showToast(
        `New Message from ${chatData.senderName || 'Student'}`,
        chatData.message,
        'info'
      );
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, toasts, dismissToast, showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-slate-900/95 border border-indigo-500/40 text-slate-100 p-3.5 rounded-xl shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top duration-300"
          >
            <div>
              <h4 className="font-bold text-sm text-indigo-400">{t.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-snug">{t.body}</p>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-slate-500 hover:text-slate-300 text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
