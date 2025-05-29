import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  LightMode,
  DarkMode,
  SupportAgent,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useTheme();
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by the store
    }
  };

  const sampleAccounts = [
    { email: 'admin@ticketingapp.com', password: 'Admin123!', role: 'Admin' },
    { email: 'john.doe@ticketingapp.com', password: 'Password123!', role: 'IT Manager' },
    { email: 'jane.smith@ticketingapp.com', password: 'Password123!', role: 'Agent' },
    { email: 'mike.wilson@ticketingapp.com', password: 'Password123!', role: 'Agent' },
    { email: 'sarah.johnson@ticketingapp.com', password: 'Password123!', role: 'User' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
            : 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            alignItems: 'flex-start',
          }}
        >
          {/* Login Form */}
          <Paper
            elevation={8}
            sx={{
              padding: 4,
              width: '100%',
              maxWidth: 400,
              borderRadius: 3,
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mb: 2,
                }}
              >
                <SupportAgent sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h4" component="h1" fontWeight="bold">
                  TicketFlow
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Sign in to your account
              </Typography>
            </Box>

            {/* Theme Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <IconButton onClick={toggleTheme} color="primary">
                {mode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                {...register('email')}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                {...register('password')}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          </Paper>

          {/* Sample Accounts */}
          <Card sx={{ width: '100%', maxWidth: 500 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Demo Accounts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use these sample accounts to test different user roles:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {sampleAccounts.map((account, index) => (
                  <Box key={index}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                      onClick={() => {
                        // Auto-fill the form
                        document.querySelector('input[name="email"]').value = account.email;
                        document.querySelector('input[name="password"]').value = account.password;
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {account.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Password: {account.password}
                        </Typography>
                      </Box>
                      <Chip 
                        label={account.role} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="caption" color="text.secondary">
                Click on any account above to auto-fill the login form
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;