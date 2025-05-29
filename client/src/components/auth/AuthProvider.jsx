import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import useAuthStore from '../../store/authStore';

export const AuthProvider = ({ children }) => {
  const { isLoading, token, user, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is already authenticated on app load
    if (token && user) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token, user, setLoading]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
};