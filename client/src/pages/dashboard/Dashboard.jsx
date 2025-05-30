// src/pages/dashboard/Dashboard.jsx
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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  LinearProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ConfirmationNumber,
  TrendingUp,
  AccessTime,
  CheckCircle,
  Assignment,
  PriorityHigh,
  ArrowUpward,
  ArrowDownward,
  OpenInNew,
  BarChart,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ticketsAPI, ticketPrioritiesAPI, ticketStatusesAPI } from '../../services/api';
import { priorityColors, statusColors } from '../../theme/theme';
import useAuthStore from '../../store/authStore';
import DashboardCharts from '../../components/dashboard/DashboardCharts';
import { renderIcon } from '../../utils/iconUtils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Fetch dashboard data
  const { data: allTickets, isLoading: allTicketsLoading, error: allTicketsError } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsAPI.getAll().then(res => res.data),
  });

  const { data: myTickets, isLoading: myTicketsLoading } = useQuery({
    queryKey: ['tickets', 'assigned', user?.id],
    queryFn: () => ticketsAPI.getAssigned(user?.id).then(res => res.data),
    enabled: !!user?.id,
  });

  const { data: activeCount, isLoading: activeCountLoading } = useQuery({
    queryKey: ['tickets', 'active-count'],
    queryFn: () => ticketsAPI.getActiveCount().then(res => res.data),
  });

  const { data: priorities } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => ticketPrioritiesAPI.getAll().then(res => res.data),
  });

  const { data: statuses } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusesAPI.getAll().then(res => res.data),
  });

  if (allTicketsLoading || myTicketsLoading || activeCountLoading) {
    return <LinearProgress />;
  }

  if (allTicketsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load dashboard data. Please try again later.
      </Alert>
    );
  }

  // Calculate metrics
  const openTickets = allTickets?.filter(t => t.statusName.toLowerCase() === 'open') || [];
  const inProgressTickets = allTickets?.filter(t => t.statusName.toLowerCase() === 'in progress') || [];
  const myOpenTickets = myTickets?.filter(t => 
    t.statusName.toLowerCase() !== 'closed' && 
    t.statusName.toLowerCase() !== 'resolved'
  ) || [];
  const highPriorityTickets = allTickets?.filter(t => 
    t.priorityName.toLowerCase() === 'high' || 
    t.priorityName.toLowerCase() === 'critical' || 
    t.priorityName.toLowerCase() === 'urgent'
  ) || [];

  // Recent tickets (last 10)
  const recentTickets = allTickets?.slice(0, 10) || [];

  const MetricCard = ({ title, value, icon, color, subtitle, trend, onClick }) => (
    <Card 
      sx={{ 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" fontWeight="medium">
            {title}
          </Typography>
          <Box
            sx={{
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
        
        <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
          {value}
        </Typography>
        
        {subtitle && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {trend && (
              trend > 0 ? (
                <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
              ) : (
                <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
              )
            )}
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const PriorityChip = ({ priority }) => {
    const actualPriority = priorities?.find(p => p.name.toLowerCase() === priority.toLowerCase());
    const colors = actualPriority 
      ? { bg: actualPriority.color + '20', color: actualPriority.color }
      : priorityColors[priority.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    
    return (
      <Chip
        label={priority}
        icon={actualPriority ? renderIcon(actualPriority.icon, { sx: { color: actualPriority.color + ' !important' } }) : undefined}
        size="small"
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
          fontSize: '0.75rem',
          border: actualPriority ? `1px solid ${actualPriority.color}` : 'none',
          '& .MuiChip-icon': {
            color: colors.color + ' !important',
          }
        }}
      />
    );
  };

  const StatusChip = ({ status }) => {
    const actualStatus = statuses?.find(s => s.name.toLowerCase() === status.toLowerCase());
    const colors = actualStatus 
      ? { bg: actualStatus.color + '20', color: actualStatus.color }
      : statusColors[status.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    
    return (
      <Chip
        label={status}
        icon={actualStatus ? renderIcon(actualStatus.icon, { sx: { color: actualStatus.color + ' !important' } }) : undefined}
        size="small"
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
          fontSize: '0.75rem',
          border: actualStatus ? `1px solid ${actualStatus.color}` : 'none',
          '& .MuiChip-icon': {
            color: colors.color + ' !important',
          }
        }}
      />
    );
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.firstName}! Here's what's happening with your tickets.
        </Typography>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Open Tickets"
            value={openTickets.length}
            icon={<ConfirmationNumber />}
            color="primary"
            subtitle="Waiting for attention"
            onClick={() => navigate('/tickets?status=open')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="In Progress"
            value={inProgressTickets.length}
            icon={<TrendingUp />}
            color="warning"
            subtitle="Being worked on"
            onClick={() => navigate('/tickets?status=in-progress')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="My Active Tickets"
            value={myOpenTickets.length}
            icon={<Assignment />}
            color="info"
            subtitle="Assigned to me"
            onClick={() => navigate('/tickets?assigned=me')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="High Priority"
            value={highPriorityTickets.length}
            icon={<PriorityHigh />}
            color="error"
            subtitle="Needs immediate attention"
            onClick={() => navigate('/tickets?priority=high')}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<ConfirmationNumber />}
              onClick={() => navigate('/tickets/create')}
            >
              Create New Ticket
            </Button>
            <Button
              variant="outlined"
              startIcon={<Assignment />}
              onClick={() => navigate('/tickets?assigned=me')}
            >
              View My Tickets
            </Button>
            <Button
              variant="outlined"
              startIcon={<PriorityHigh />}
              onClick={() => navigate('/tickets?priority=high')}
            >
              High Priority Queue
            </Button>
            <Button
              variant="outlined"
              startIcon={<BarChart />}
              onClick={() => navigate('/tickets/kanban')}
            >
              Kanban Board
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Dashboard Charts */}
      <Box sx={{ mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Analytics Overview
              </Typography>
              <Button
                variant="text"
                endIcon={<OpenInNew />}
                onClick={() => navigate('/tickets')}
              >
                View All Tickets
              </Button>
            </Box>
            <DashboardCharts tickets={allTickets || []} />
          </CardContent>
        </Card>
      </Box>

      {/* Recent Tickets Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Recent Tickets
            </Typography>
            <Button
              variant="text"
              endIcon={<OpenInNew />}
              onClick={() => navigate('/tickets')}
            >
              View All
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        #{ticket.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                        {ticket.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={ticket.statusName} />
                    </TableCell>
                    <TableCell>
                      <PriorityChip priority={ticket.priorityName} />
                    </TableCell>
                    <TableCell>
                      {ticket.assignedToName ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {ticket.assignedToName.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Typography variant="body2">
                            {ticket.assignedToName}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Unassigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(ticket.createdAt), 'MMM dd, HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${ticket.id}`);
                        }}
                      >
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {recentTickets.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No tickets found. Create your first ticket to get started!
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={() => navigate('/tickets/create')}
              >
                Create Ticket
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;