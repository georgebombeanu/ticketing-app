import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  ConfirmationNumber,
  People,
  Business,
  Groups,
  Help,
  AccountCircle,
  Logout,
  Settings,
  Add,
  LightMode,
  DarkMode,
  ViewKanban,
  Category,
  PriorityHigh,
  Schedule,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useTheme as useAppTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import NotificationCenter from '../../components/notifications/NotificationCenter';

// Custom TicketBoom Logo Component - Technical Gear Design
const TicketBoomLogo = ({ size = 32 }) => {
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

const drawerWidth = 280;

const Layout = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, logout, isAgent, isManager, isAdmin } = useAuthStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleProfileMenuClose();
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const items = [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard',
      },
      {
        text: 'Tickets',
        icon: <ConfirmationNumber />,
        path: '/tickets',
        children: [
          {
            text: 'All Tickets',
            icon: <ConfirmationNumber />,
            path: '/tickets',
          },
          {
            text: 'Kanban Board',
            icon: <ViewKanban />,
            path: '/tickets/kanban',
          },
        ],
      },
    ];

    // Add management items for managers and above
    if (isManager()) {
      items.push(
        { divider: true },
        {
          text: 'Users',
          icon: <People />,
          path: '/users',
        },
        {
          text: 'Departments',
          icon: <Business />,
          path: '/departments',
        },
        {
          text: 'Teams',
          icon: <Groups />,
          path: '/teams',
        }
      );
    }

    // Add admin items for admins only
    if (isAdmin()) {
      items.push(
        { divider: true },
        {
          text: 'Admin',
          icon: <AdminPanelSettings />,
          path: '/admin',
          children: [
            {
              text: 'Categories',
              icon: <Category />,
              path: '/admin/categories',
            },
            {
              text: 'Priorities',
              icon: <PriorityHigh />,
              path: '/admin/priorities',
            },
            {
              text: 'Statuses',
              icon: <Schedule />,
              path: '/admin/statuses',
            },
          ],
        }
      );
    }

    // FAQ for everyone
    items.push(
      { divider: true },
      {
        text: 'FAQ',
        icon: <Help />,
        path: '/faq',
      }
    );

    return items;
  };

  const navigationItems = getNavigationItems();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TicketBoomLogo size={32} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            TicketBoom
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.firstName} {user?.lastName}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {navigationItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={index} sx={{ my: 1 }} />;
          }

          // Handle items with children (like Tickets and Admin)
          if (item.children) {
            const isParentActive = location.pathname.startsWith(item.path);
            
            return (
              <React.Fragment key={item.text}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      if (isMobile) setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      backgroundColor: isParentActive ? 'primary.main' : 'transparent',
                      color: isParentActive ? 'primary.contrastText' : 'inherit',
                      '&:hover': {
                        backgroundColor: isParentActive 
                          ? 'primary.dark' 
                          : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isParentActive ? 'primary.contrastText' : 'inherit',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
                
                {/* Child items */}
                {item.children.map((child) => {
                  const isChildActive = location.pathname === child.path;
                  return (
                    <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => {
                          navigate(child.path);
                          if (isMobile) setMobileOpen(false);
                        }}
                        sx={{
                          borderRadius: 2,
                          mx: 1,
                          ml: 3,
                          backgroundColor: isChildActive ? 'action.selected' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText primary={child.text} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </React.Fragment>
            );
          }

          // Regular navigation items
          const isActive = location.pathname === item.path || 
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'inherit',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'primary.dark' 
                      : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User info at bottom */}
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight="medium" noWrap>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.userRoles?.[0]?.roleName || 'User'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {/* Page title will be set by individual pages */}
          </Typography>

          {/* Top bar actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* New Ticket Button */}
            <Tooltip title="Create New Ticket">
              <IconButton
                color="primary"
                onClick={() => navigate('/tickets/create')}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <Add />
              </IconButton>
            </Tooltip>

            {/* Theme Toggle */}
            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <NotificationCenter />

            {/* Profile Menu */}
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // AppBar height
          minHeight: 'calc(100vh - 64px)',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;