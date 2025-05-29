import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#2e7d32' : '#4caf50', // Green
      light: mode === 'light' ? '#60ad5e' : '#81c784',
      dark: mode === 'light' ? '#005005' : '#388e3c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#558b2f' : '#8bc34a', // Light Green
      light: mode === 'light' ? '#85bb5c' : '#aed581',
      dark: mode === 'light' ? '#255d00' : '#689f38',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#333333' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#aaaaaa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          fontWeight: 500,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(0,0,0,0.1)' 
            : '0 2px 8px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '0',
          borderRight: mode === 'light' 
            ? '1px solid rgba(0,0,0,0.12)' 
            : '1px solid rgba(255,255,255,0.12)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light'
            ? '0 2px 4px rgba(0,0,0,0.1)'
            : '0 2px 4px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: mode === 'light' 
              ? '1px solid rgba(0,0,0,0.08)' 
              : '1px solid rgba(255,255,255,0.08)',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: mode === 'light' ? '#f8f9fa' : '#2a2a2a',
            borderBottom: mode === 'light' 
              ? '1px solid rgba(0,0,0,0.12)' 
              : '1px solid rgba(255,255,255,0.12)',
          },
        },
      },
    },
  },
});

export const createAppTheme = (mode = 'light') => {
  return createTheme(getDesignTokens(mode));
};

// Priority and Status Color Mappings
export const priorityColors = {
  low: { bg: '#e8f5e8', color: '#2e7d32' },
  medium: { bg: '#fff3e0', color: '#ef6c00' },
  high: { bg: '#ffebee', color: '#c62828' },
  critical: { bg: '#fce4ec', color: '#ad1457' },
  urgent: { bg: '#f3e5f5', color: '#7b1fa2' },
};

export const statusColors = {
  open: { bg: '#e3f2fd', color: '#1976d2' },
  'in progress': { bg: '#fff3e0', color: '#f57c00' },
  pending: { bg: '#f3e5f5', color: '#7b1fa2' },
  resolved: { bg: '#e8f5e8', color: '#388e3c' },
  closed: { bg: '#f5f5f5', color: '#616161' },
  cancelled: { bg: '#ffebee', color: '#d32f2f' },
};