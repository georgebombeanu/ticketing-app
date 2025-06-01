import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';

// Custom TicketBoom Logo Component - Technical Gear Design
const TicketBoomLogo = ({ size = 64 }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#37474f" />
          <stop offset="100%" stopColor="#607d8b" />
        </linearGradient>
        <radialGradient id="sparkGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffeb3b" />
          <stop offset="100%" stopColor="#ff9800" />
        </radialGradient>
        <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f5f5f5" />
        </linearGradient>
      </defs>
      
      {/* Main gear */}
      <g transform="translate(32,32)">
        {/* Outer gear ring */}
        <circle cx="0" cy="0" r="18" fill="url(#gearGradient)" stroke="#263238" strokeWidth="1"/>
        
        {/* Gear teeth */}
        <rect x="-2" y="-20" width="4" height="4" fill="url(#gearGradient)"/>
        <rect x="-20" y="-2" width="4" height="4" fill="url(#gearGradient)"/>
        <rect x="16" y="-2" width="4" height="4" fill="url(#gearGradient)"/>
        <rect x="-2" y="16" width="4" height="4" fill="url(#gearGradient)"/>
        
        {/* Diagonal teeth */}
        <g transform="rotate(45)">
          <rect x="-2" y="-20" width="4" height="4" fill="url(#gearGradient)"/>
          <rect x="-20" y="-2" width="4" height="4" fill="url(#gearGradient)"/>
          <rect x="16" y="-2" width="4" height="4" fill="url(#gearGradient)"/>
          <rect x="-2" y="16" width="4" height="4" fill="url(#gearGradient)"/>
        </g>
        
        {/* Inner circle */}
        <circle cx="0" cy="0" r="10" fill="url(#centerGradient)" stroke="#607d8b" strokeWidth="1"/>
        
        {/* "B" letter in center */}
        <text x="0" y="4" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#37474f" fontFamily="Arial, sans-serif">
          B
        </text>
        
        {/* Small inner details */}
        <circle cx="0" cy="0" r="3" fill="none" stroke="#607d8b" strokeWidth="1" opacity="0.6"/>
      </g>
      
      {/* Sparks and explosion effect */}
      <g transform="translate(52, 12)">
        <circle cx="0" cy="0" r="5" fill="url(#sparkGradient)"/>
        {/* Spark rays */}
        <path d="M0 -5 L1 -8 L0 -6 L-1 -8 Z" fill="#ffeb3b"/>
        <path d="M5 0 L8 1 L6 0 L8 -1 Z" fill="#ff9800"/>
        <path d="M0 5 L1 8 L0 6 L-1 8 Z" fill="#ffeb3b"/>
        <path d="M-5 0 L-8 1 L-6 0 L-8 -1 Z" fill="#ff9800"/>
        
        {/* Additional sparkles */}
        <circle cx="7" cy="-7" r="1.5" fill="#ffcc02"/>
        <circle cx="-5" cy="5" r="1" fill="#ff6b35"/>
        <circle cx="8" cy="3" r="0.8" fill="#ffc107"/>
      </g>
      
      {/* Motion lines for dynamic effect */}
      <g opacity="0.6">
        <line x1="8" y1="8" x2="4" y2="4" stroke="#607d8b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="56" y1="56" x2="60" y2="60" stroke="#607d8b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="54" x2="6" y2="58" stroke="#607d8b" strokeWidth="1.5" strokeLinecap="round"/>
      </g>
      
      {/* Additional small gears for technical feel */}
      <g transform="translate(50, 50)" opacity="0.4">
        <circle cx="0" cy="0" r="4" fill="url(#gearGradient)"/>
        <rect x="-1" y="-5" width="2" height="2" fill="url(#gearGradient)"/>
        <rect x="-1" y="3" width="2" height="2" fill="url(#gearGradient)"/>
        <rect x="-5" y="-1" width="2" height="2" fill="url(#gearGradient)"/>
        <rect x="3" y="-1" width="2" height="2" fill="url(#gearGradient)"/>
      </g>
    </svg>
  );
};

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f1f8e9 0%, #dcedc8 50%, #c5e1a5 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        overflow: 'hidden',
      }}
    >
      {/* Technical Gear Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.15,
          zIndex: 0,
        }}
      >
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="gearBg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#37474f" />
              <stop offset="100%" stopColor="#607d8b" />
            </linearGradient>
            <radialGradient id="sparkBg1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffeb3b" />
              <stop offset="100%" stopColor="#ff9800" />
            </radialGradient>
            <linearGradient id="centerBg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f5f5f5" />
            </linearGradient>
          </defs>
          
          {/* Large gear with explosion effect */}
          <g transform="translate(200, 300)">
            <circle cx="0" cy="0" r="40" fill="url(#gearBg1)" opacity="0.6"/>
            {/* Gear teeth */}
            <rect x="-4" y="-45" width="8" height="8" fill="url(#gearBg1)" opacity="0.6"/>
            <rect x="-45" y="-4" width="8" height="8" fill="url(#gearBg1)" opacity="0.6"/>
            <rect x="37" y="-4" width="8" height="8" fill="url(#gearBg1)" opacity="0.6"/>
            <rect x="-4" y="37" width="8" height="8" fill="url(#gearBg1)" opacity="0.6"/>
            <g transform="rotate(45)">
              <rect x="-4" y="-45" width="8" height="8" fill="url(#gearBg1)" opacity="0.6"/>
              <rect x="-45" y="-4" width="8" height="8" fill="url(#gearBg1)" opacity="0.6"/>
              <rect x="37" y="-4" width="8" height="8" fill="url(#gearBg1)" opacity="0.6"/>
              <rect x="-4" y="37" width="8" height="8" fill="url(#gearBg1)" opacity="0.6"/>
            </g>
            <circle cx="0" cy="0" r="20" fill="url(#centerBg1)" opacity="0.8"/>
            <text x="0" y="6" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#607d8b">B</text>
          </g>
          
          {/* Explosion effects around gear using app's green colors */}
          <g transform="translate(200, 300)" opacity="0.6">
            <path d="M55 -15 L80 -25 L70 -15 L80 -5 Z" fill="#4caf50"/>
            <path d="M50 -50 L65 -65 L55 -55 L65 -45 Z" fill="#2e7d32"/>
            <path d="M-15 -55 L-25 -80 L-15 -70 L-5 -80 Z" fill="#4caf50"/>
            <path d="M-55 -15 L-80 -25 L-70 -15 L-80 -5 Z" fill="#66bb6a"/>
            <path d="M-55 50 L-70 65 L-60 55 L-70 45 Z" fill="#4caf50"/>
            <path d="M15 55 L25 80 L15 70 L5 80 Z" fill="#2e7d32"/>
            <circle cx="70" cy="-20" r="3" fill="#ffeb3b" opacity="0.8"/>
            <circle cx="-20" cy="-70" r="2.5" fill="#ffc107" opacity="0.7"/>
            <circle cx="-60" cy="55" r="3" fill="#ffeb3b" opacity="0.8"/>
          </g>
          
          {/* Smaller scattered gears using app colors */}
          <g transform="translate(800, 200)" opacity="0.4">
            <circle cx="0" cy="0" r="25" fill="#607d8b"/>
            <rect x="-3" y="-28" width="6" height="5" fill="#607d8b"/>
            <rect x="-28" y="-3" width="5" height="6" fill="#607d8b"/>
            <rect x="23" y="-3" width="5" height="6" fill="#607d8b"/>
            <rect x="-3" y="23" width="6" height="5" fill="#607d8b"/>
            <circle cx="0" cy="0" r="12" fill="#ffffff" opacity="0.9"/>
            <text x="0" y="4" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#607d8b">B</text>
          </g>
          
          <g transform="translate(150, 100)" opacity="0.3">
            <circle cx="0" cy="0" r="15" fill="#607d8b"/>
            <rect x="-2" y="-17" width="4" height="3" fill="#607d8b"/>
            <rect x="-17" y="-2" width="3" height="4" fill="#607d8b"/>
            <rect x="14" y="-2" width="3" height="4" fill="#607d8b"/>
            <rect x="-2" y="14" width="4" height="3" fill="#607d8b"/>
            <circle cx="0" cy="0" r="8" fill="#ffffff" opacity="0.8"/>
          </g>
          
          <g transform="translate(900, 500)" opacity="0.3">
            <circle cx="0" cy="0" r="18" fill="#607d8b"/>
            <rect x="-2" y="-20" width="4" height="4" fill="#607d8b"/>
            <rect x="-20" y="-2" width="4" height="4" fill="#607d8b"/>
            <rect x="16" y="-2" width="4" height="4" fill="#607d8b"/>
            <rect x="-2" y="16" width="4" height="4" fill="#607d8b"/>
            <circle cx="0" cy="0" r="10" fill="#ffffff" opacity="0.8"/>
          </g>
          
          {/* Additional sparks using app's colors */}
          <circle cx="120" cy="150" r="2" fill="#4caf50" opacity="0.4"/>
          <circle cx="850" cy="180" r="3" fill="#2e7d32" opacity="0.5"/>
          <circle cx="180" cy="450" r="2.5" fill="#66bb6a" opacity="0.4"/>
          <circle cx="750" cy="400" r="2" fill="#4caf50" opacity="0.6"/>
          <circle cx="950" cy="300" r="1.5" fill="#81c784" opacity="0.5"/>
          
          {/* Motion lines for dynamic effect */}
          <g opacity="0.3">
            <line x1="50" y1="50" x2="20" y2="20" stroke="#607d8b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="950" y1="550" x2="980" y2="580" stroke="#607d8b" strokeWidth="3" strokeLinecap="round"/>
            <line x1="100" y1="500" x2="70" y2="530" stroke="#607d8b" strokeWidth="2" strokeLinecap="round"/>
          </g>
        </svg>
      </Box>
      <Container maxWidth="sm">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <CardContent sx={{ p: 6 }}>
            {/* Logo and Brand Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <TicketBoomLogo size={80} />
              </Box>
              <Typography
                variant="h3"
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(45deg, #37474f, #607d8b)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                TicketBoom
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight="medium">
                Support Ticket Management
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Explosive efficiency in problem solving
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Sign in to continue
              </Typography>
            </Divider>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Email Field */}
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email Address"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                />

                {/* Password Field */}
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                />

                {/* Login Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(45deg, #37474f, #607d8b)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #263238, #455a64)',
                    },
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>



        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 3, opacity: 0.8 }}>
          <Typography variant="body2" color="white">
            TicketBoom © 2024 - Powered by Bombeanu
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;