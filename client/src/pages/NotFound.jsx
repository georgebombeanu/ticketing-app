import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from '@mui/material';
import {
  Home,
  ArrowBack,
  SearchOff,
} from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Paper
          sx={{
            p: 6,
            borderRadius: 3,
            maxWidth: 500,
            width: '100%',
          }}
        >
          <SearchOff
            sx={{
              fontSize: 80,
              color: 'primary.main',
              mb: 2,
            }}
          />
          
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h5" gutterBottom color="text.secondary">
            Page Not Found
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }} color="text.secondary">
            The page you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/dashboard')}
            >
              Home
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;