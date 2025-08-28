import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, variant = 'default', timeout = 2500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => remove(id), timeout);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-[100]">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded-md shadow-warm border ${t.variant==='error'?'bg-error text-error-foreground border-error/20': t.variant==='success'?'bg-success text-success-foreground border-success/20':'bg-card text-text-primary border-border'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

