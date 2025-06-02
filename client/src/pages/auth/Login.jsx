import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
  InputAdornment,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

// Enhanced TicketBoom Logo Component with proper green colors
const TicketBoomLogo = ({ size = 48 }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2e7d32" />
          <stop offset="100%" stopColor="#4caf50" />
        </linearGradient>
        <radialGradient id="sparkGradient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#81c784" />
          <stop offset="100%" stopColor="#66bb6a" />
        </radialGradient>
        <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f8e9" />
        </linearGradient>
      </defs>
      
      {/* Main gear */}
      <g transform="translate(32,32)">
        {/* Outer gear ring */}
        <circle cx="0" cy="0" r="18" fill="url(#gearGradient)" stroke="#1b5e20" strokeWidth="1"/>
        
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
        <circle cx="0" cy="0" r="10" fill="url(#centerGradient)" stroke="#4caf50" strokeWidth="1"/>
        
        {/* "B" letter in center */}
        <text x="0" y="4" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2e7d32" fontFamily="Arial, sans-serif">
          B
        </text>
        
        {/* Small inner details */}
        <circle cx="0" cy="0" r="3" fill="none" stroke="#4caf50" strokeWidth="1" opacity="0.6"/>
      </g>
      
      {/* Sparks and explosion effect */}
      <g transform="translate(52, 12)">
        <circle cx="0" cy="0" r="5" fill="url(#sparkGradient)"/>
        {/* Spark rays */}
        <path d="M0 -5 L1 -8 L0 -6 L-1 -8 Z" fill="#81c784"/>
        <path d="M5 0 L8 1 L6 0 L8 -1 Z" fill="#66bb6a"/>
        <path d="M0 5 L1 8 L0 6 L-1 8 Z" fill="#81c784"/>
        <path d="M-5 0 L-8 1 L-6 0 L-8 -1 Z" fill="#66bb6a"/>
        
        {/* Additional sparkles */}
        <circle cx="7" cy="-7" r="1.5" fill="#a5d6a7"/>
        <circle cx="-5" cy="5" r="1" fill="#81c784"/>
        <circle cx="8" cy="3" r="0.8" fill="#c8e6c9"/>
      </g>
      
      {/* Motion lines for dynamic effect */}
      <g opacity="0.6">
        <line x1="8" y1="8" x2="4" y2="4" stroke="#4caf50" strokeWidth="2" strokeLinecap="round"/>
        <line x1="56" y1="56" x2="60" y2="60" stroke="#4caf50" strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="54" x2="6" y2="58" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round"/>
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

// Enhanced Background Elements Component with gears and hexagons only
const BackgroundElements = () => {
  // Hexagon Component
  const Hexagon = ({ size, gradient, opacity, rotation, duration }) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={gradient} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2e7d32" />
          <stop offset="50%" stopColor="#4caf50" />
          <stop offset="100%" stopColor="#388e3c" />
        </linearGradient>
      </defs>
      <polygon
        points="50,5 85,25 85,75 50,95 15,75 15,25"
        fill={`url(#${gradient})`}
        stroke="#2e7d32"
        strokeWidth="1.5"
        opacity={opacity}
        transform={`rotate(${rotation} 50 50)`}
      />
      <polygon
        points="50,20 70,35 70,65 50,80 30,65 30,35"
        fill="none"
        stroke="#1b5e20"
        strokeWidth="1"
        opacity={opacity * 0.8}
        transform={`rotate(${rotation} 50 50)`}
      />
    </svg>
  );

  // Gear Component
  const Gear = ({ size, teeth, gradient, opacity, rotation }) => (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <linearGradient id={gradient} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2e7d32" />
          <stop offset="100%" stopColor="#4caf50" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" fill={`url(#${gradient})`} opacity={opacity} />
      {Array.from({ length: teeth }, (_, i) => {
        const angle = (i * (360 / teeth)) * (Math.PI / 180);
        const x = 50 + Math.cos(angle) * 36;
        const y = 50 + Math.sin(angle) * 36;
        return (
          <rect
            key={i}
            x={x - 2}
            y={y - 4}
            width="4"
            height="8"
            fill={`url(#${gradient})`}
            opacity={opacity}
            transform={`rotate(${i * (360 / teeth) + rotation} ${x} ${y})`}
          />
        );
      })}
      <circle cx="50" cy="50" r="15" fill="none" stroke="#1b5e20" strokeWidth="1" opacity={opacity * 0.7} />
    </svg>
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Large gear - top left */}
      <Box
        sx={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          opacity: 0.08,
          animation: 'rotate 35s linear infinite',
        }}
      >
        <Gear size={200} teeth={12} gradient="gearBg1" opacity={1} rotation={0} />
      </Box>

      {/* Hexagon - top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '80px',
          right: '-30px',
          opacity: 0.09,
          animation: 'rotate-reverse 25s linear infinite',
        }}
      >
        <Hexagon size={120} gradient="hexBg1" opacity={1} rotation={0} duration={45} />
      </Box>

      {/* Hexagon - center top */}
      <Box
        sx={{
          position: 'absolute',
          top: '12%',
          left: '30%',
          opacity: 0.06,
          animation: 'rotate 40s linear infinite',
        }}
      >
        <Hexagon size={90} gradient="hexBg2" opacity={1} rotation={0} duration={65} />
      </Box>

      {/* Large gear - bottom right */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '-60px',
          right: '-60px',
          opacity: 0.07,
          animation: 'rotate 45s linear infinite',
        }}
      >
        <Gear size={240} teeth={16} gradient="gearBg2" opacity={1} rotation={0} />
      </Box>

      {/* Small hexagon - center left */}
      <Box
        sx={{
          position: 'absolute',
          top: '40%',
          left: '10px',
          opacity: 0.1,
          animation: 'rotate-reverse 18s linear infinite',
        }}
      >
        <Hexagon size={80} gradient="hexBg3" opacity={1} rotation={0} duration={30} />
      </Box>

      {/* Medium gear - center right */}
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '70px',
          opacity: 0.08,
          animation: 'rotate 30s linear infinite',
        }}
      >
        <Gear size={100} teeth={10} gradient="gearBg3" opacity={1} rotation={0} />
      </Box>

      {/* Medium hexagon - center left area */}
      <Box
        sx={{
          position: 'absolute',
          top: '65%',
          left: '18%',
          opacity: 0.07,
          animation: 'rotate-reverse 32s linear infinite',
        }}
      >
        <Hexagon size={85} gradient="hexBg4" opacity={1} rotation={0} duration={55} />
      </Box>

      {/* Small gear - bottom left */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          opacity: 0.09,
          animation: 'rotate-reverse 20s linear infinite',
        }}
      >
        <Gear size={70} teeth={8} gradient="gearBg4" opacity={1} rotation={0} />
      </Box>

      {/* Tiny hexagon - top center */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '70%',
          opacity: 0.11,
          animation: 'rotate 15s linear infinite',
        }}
      >
        <Hexagon size={50} gradient="hexBg5" opacity={1} rotation={0} duration={25} />
      </Box>

      {/* Medium gear - center right area */}
      <Box
        sx={{
          position: 'absolute',
          top: '55%',
          right: '15%',
          opacity: 0.08,
          animation: 'rotate-reverse 16s linear infinite',
        }}
      >
        <Gear size={95} teeth={9} gradient="gearBg5" opacity={1} rotation={0} />
      </Box>

      {/* Small gear - middle top */}
      <Box
        sx={{
          position: 'absolute',
          top: '35%',
          left: '82%',
          opacity: 0.09,
          animation: 'rotate-reverse 24s linear infinite',
        }}
      >
        <Gear size={60} teeth={6} gradient="gearBg6" opacity={1} rotation={0} />
      </Box>

      {/* Hexagon - middle bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '60%',
          opacity: 0.08,
          animation: 'rotate 33s linear infinite',
        }}
      >
        <Hexagon size={85} gradient="hexBg6" opacity={1} rotation={0} duration={55} />
      </Box>

      {/* Small hexagon - bottom center */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '40%',
          opacity: 0.09,
          animation: 'rotate-reverse 19s linear infinite',
        }}
      >
        <Hexagon size={70} gradient="hexBg7" opacity={1} rotation={0} duration={33} />
      </Box>

      {/* Medium gear - center background */}
      <Box
        sx={{
          position: 'absolute',
          top: '22%',
          left: '5%',
          opacity: 0.06,
          animation: 'rotate 25s linear infinite',
        }}
      >
        <Gear size={120} teeth={14} gradient="gearBg7" opacity={1} rotation={0} />
      </Box>

      {/* Tiny gear - far right center */}
      <Box
        sx={{
          position: 'absolute',
          top: '45%',
          right: '5px',
          opacity: 0.1,
          animation: 'rotate-reverse 28s linear infinite',
        }}
      >
        <Gear size={45} teeth={6} gradient="gearBg8" opacity={1} rotation={0} />
      </Box>

      {/* Hexagon - center */}
      <Box
        sx={{
          position: 'absolute',
          top: '48%',
          left: '32%',
          opacity: 0.05,
          animation: 'rotate 42s linear infinite',
        }}
      >
        <Hexagon size={110} gradient="hexBg8" opacity={1} rotation={0} duration={42} />
      </Box>

      {/* Small gear - top middle */}
      <Box
        sx={{
          position: 'absolute',
          top: '8%',
          left: '52%',
          opacity: 0.08,
          animation: 'rotate-reverse 22s linear infinite',
        }}
      >
        <Gear size={65} teeth={7} gradient="gearBg9" opacity={1} rotation={0} />
      </Box>

      {/* Medium hexagon - bottom left area */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '35%',
          left: '8%',
          opacity: 0.07,
          animation: 'rotate 31s linear infinite',
        }}
      >
        <Hexagon size={88} gradient="hexBg9" opacity={1} rotation={0} duration={52} />
      </Box>

      {/* Tiny hexagon - far top right */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '10%',
          opacity: 0.09,
          animation: 'rotate-reverse 17s linear infinite',
        }}
      >
        <Hexagon size={55} gradient="hexBg10" opacity={1} rotation={0} duration={29} />
      </Box>

      {/* Small gear - bottom center */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '8%',
          left: '72%',
          opacity: 0.08,
          animation: 'rotate 44s linear infinite',
        }}
      >
        <Gear size={75} teeth={8} gradient="gearBg10" opacity={1} rotation={0} />
      </Box>

      {/* CSS for animations */}
      <style>
        {`
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes rotate-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
        `}
      </style>
    </Box>
  );
};

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [showPassword, setShowPassword] = useState(false);

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

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    try {
      await login(data);
      showSuccess('Login successful! Welcome to TicketBoom.');
      navigate('/dashboard');
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        background: 'linear-gradient(45deg, #e8f5e8 0%, #f1f8e9 25%, #e0f2f1 50%, #c8e6c9 70%, #a5d6a7 85%, #81c784 95%, #66bb6a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      {/* Background Elements */}
      <BackgroundElements />

      {/* Main Login Card */}
      <Card
        elevation={24}
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 450,
          width: '100%',
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CardContent sx={{ p: 5 }}>
          {/* Logo and Branding */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Paper
                elevation={8}
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e8f5e8, #f1f8e9)',
                  border: '2px solid #4caf50',
                }}
              >
                <TicketBoomLogo size={64} />
              </Paper>
            </Box>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
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
              Sign in to manage your tickets efficiently
            </Typography>
          </Box>

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              {...register('email')}
              fullWidth
              label="Email Address"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#4caf50' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#4caf50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2e7d32',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2e7d32',
                },
              }}
            />

            <TextField
              {...register('password')}
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#4caf50' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? (
                        <VisibilityOff sx={{ color: '#4caf50' }} />
                      ) : (
                        <Visibility sx={{ color: '#4caf50' }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#4caf50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2e7d32',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2e7d32',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={<LoginIcon />}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #2e7d32, #4caf50)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1b5e20, #388e3c)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(46, 125, 50, 0.3)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;