import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Category,
  PriorityHigh,
  Schedule,
  Add,
  Edit,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { 
  ticketCategoriesAPI, 
  ticketPrioritiesAPI, 
  ticketStatusesAPI 
} from '../../services/api';
import useAuthStore from '../../store/authStore';

const AdminOverview = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['ticket-categories', 'all'],
    queryFn: () => ticketCategoriesAPI.getAll().then(res => res.data),
  });

  const { data: priorities, isLoading: prioritiesLoading } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => ticketPrioritiesAPI.getAll().then(res => res.data),
  });

  const { data: statuses, isLoading: statusesLoading } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusesAPI.getAll().then(res => res.data),
  });

  if (!isAdmin()) {
    return (
      <Alert severity="error">
        Access denied. Admin privileges required.
      </Alert>
    );
  }

  const isLoading = categoriesLoading || prioritiesLoading || statusesLoading;

  if (isLoading) {
    return <LinearProgress />;
  }

  const adminSections = [
    {
      title: 'Ticket Categories',
      description: 'Manage how tickets are categorized and organized',
      icon: <Category sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/categories',
      data: categories,
      color: 'primary.light',
      stats: {
        total: categories?.length || 0,
        active: categories?.filter(c => c.isActive).length || 0,
        inactive: categories?.filter(c => !c.isActive).length || 0,
      }
    },
    {
      title: 'Ticket Priorities',
      description: 'Define priority levels and their urgency indicators',
      icon: <PriorityHigh sx={{ fontSize: 40, color: 'error.main' }} />,
      path: '/admin/priorities',
      data: priorities,
      color: 'error.light',
      stats: {
        total: priorities?.length || 0,
        active: priorities?.length || 0,
        inactive: 0,
      }
    },
    {
      title: 'Ticket Statuses',
      description: 'Configure workflow states and ticket progression',
      icon: <Schedule sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/admin/statuses',
      data: statuses,
      color: 'warning.light',
      stats: {
        total: statuses?.length || 0,
        active: statuses?.length || 0,
        inactive: 0,
      }
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage ticket system configuration and settings
        </Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {adminSections.map((section) => (
          <Grid item xs={12} md={4} key={section.title}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => navigate(section.path)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ 
                    p: 1, 
                    borderRadius: 2, 
                    bgcolor: section.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {section.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {section.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {section.stats.total} items
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {section.description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={`${section.stats.total} Total`} 
                    size="small" 
                    variant="outlined" 
                  />
                  {section.stats.active > 0 && (
                    <Chip 
                      label={`${section.stats.active} Active`} 
                      size="small" 
                      color="success"
                      variant="outlined"
                    />
                  )}
                  {section.stats.inactive > 0 && (
                    <Chip 
                      label={`${section.stats.inactive} Inactive`} 
                      size="small" 
                      color="default"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Edit />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(section.path);
                  }}
                >
                  Manage {section.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          
          <List>
            <ListItem 
              button 
              onClick={() => navigate('/admin/categories')}
              sx={{ borderRadius: 1, mb: 1 }}
            >
              <ListItemIcon>
                <Add color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Add New Category" 
                secondary="Create a new ticket category for better organization"
              />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              onClick={() => navigate('/admin/priorities')}
              sx={{ borderRadius: 1, my: 1 }}
            >
              <ListItemIcon>
                <Add color="error" />
              </ListItemIcon>
              <ListItemText 
                primary="Add New Priority" 
                secondary="Define a new priority level for tickets"
              />
            </ListItem>
            
            <Divider />
            
            <ListItem 
              button 
              onClick={() => navigate('/admin/statuses')}
              sx={{ borderRadius: 1, mt: 1 }}
            >
              <ListItemIcon>
                <Add color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="Add New Status" 
                secondary="Create a new workflow status for ticket progression"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            System Configuration
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="primary.main">
                  {categories?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categories
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {categories?.filter(c => c.isActive).length || 0} active
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="error.main">
                  {priorities?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Priorities
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All active
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="warning.main">
                  {statuses?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Statuses
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  All active
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminOverview;