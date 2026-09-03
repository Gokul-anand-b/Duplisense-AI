import { createContext, useState, useCallback } from 'react';
import { generateId } from '../utils/helpers';

export const ToastContext = createContext(null);

/**
 * ToastProvider manages toast notification state globally.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message, duration = 4000) => {
    const id = generateId();
    const toast = { id, type, title, message };
    setToasts((prev) => [...prev, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const success = useCallback(
    (title, message) => addToast('success', title, message),
    [addToast]
  );
  const error = useCallback(
    (title, message) => addToast('error', title, message),
    [addToast]
  );
  const warning = useCallback(
    (title, message) => addToast('warning', title, message),
    [addToast]
  );
  const info = useCallback(
    (title, message) => addToast('info', title, message),
    [addToast]
  );

  const value = { toasts, addToast, removeToast, success, error, warning, info };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}
