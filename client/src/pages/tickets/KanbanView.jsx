import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Add,
  ViewList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI, ticketStatusesAPI } from '../../services/api';
import KanbanBoard from '../../components/tickets/KanbanBoard';

const KanbanView = () => {
  const navigate = useNavigate();

  const { data: tickets, isLoading: ticketsLoading, error: ticketsError } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsAPI.getAll().then(res => res.data),
  });

  const { data: statuses, isLoading: statusesLoading } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusesAPI.getAll().then(res => res.data),
  });

  if (ticketsLoading || statusesLoading) {
    return <LinearProgress />;
  }

  if (ticketsError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load tickets. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Kanban Board
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage tickets visually by dragging them between status columns
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ViewList />}
            onClick={() => navigate('/tickets')}
          >
            Table View
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/tickets/create')}
          >
            New Ticket
          </Button>
        </Box>
      </Box>

      {/* Kanban Board */}
      {tickets && statuses ? (
        <KanbanBoard tickets={tickets} statuses={statuses} />
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tickets available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first ticket to get started with the kanban board.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/tickets/create')}
          >
            Create First Ticket
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default KanbanView;