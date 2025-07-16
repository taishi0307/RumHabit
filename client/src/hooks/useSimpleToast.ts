import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = "default" }: Omit<Toast, "id">) => {
    const id = (++toastId).toString();
    const newToast: Toast = { id, title, description, variant };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return React.createElement(
    ToastContext.Provider,
    { value: { toast, toasts, removeToast } },
    children
  );
}

export function useSimpleToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useSimpleToast must be used within a ToastProvider");
  }
  return context;
}

// Simple toast component
export function SimpleToastContainer() {
  const { toasts, removeToast } = useSimpleToast();

  if (toasts.length === 0) return null;

  return React.createElement(
    'div',
    { className: 'fixed top-4 right-4 z-50 space-y-2' },
    toasts.map(({ id, title, description, variant }) =>
      React.createElement(
        'div',
        {
          key: id,
          className: `p-4 rounded-lg shadow-lg border max-w-sm ${
            variant === "destructive" 
              ? "bg-red-50 border-red-200 text-red-800" 
              : "bg-white border-gray-200 text-gray-800"
          }`
        },
        React.createElement(
          'div',
          { className: 'flex justify-between items-start' },
          React.createElement(
            'div',
            null,
            React.createElement('h4', { className: 'font-semibold text-sm' }, title),
            description && React.createElement('p', { className: 'text-sm mt-1 opacity-80' }, description)
          ),
          React.createElement(
            'button',
            {
              onClick: () => removeToast(id),
              className: 'ml-2 text-gray-400 hover:text-gray-600'
            },
            '×'
          )
        )
      )
    )
  );
}