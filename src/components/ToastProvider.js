import React, { createContext, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = (message, severity = 'success') => {
    setToast({ message, severity, open: true });
  };

  const handleClose = () => {
    setToast((prev) => (prev ? { ...prev, open: false } : null));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={Boolean(toast?.open)}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={toast?.severity || 'success'} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
