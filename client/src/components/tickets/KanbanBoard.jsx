import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  Paper,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  MoreVert,
  Person,
  Schedule,
  Assignment,
  OpenInNew,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ticketsAPI } from '../../services/api';
import { priorityColors, statusColors } from '../../theme/theme';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

const KanbanBoard = ({ tickets = [], statuses = [] }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAgent } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Group tickets by status
  const ticketsByStatus = statuses.reduce((acc, status) => {
    acc[status.id] = {
      ...status,
      tickets: tickets.filter(ticket => ticket.statusId === status.id),
    };
    return acc;
  }, {});

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, statusId }) => ticketsAPI.updateStatus(ticketId, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      showSuccess('Ticket status updated successfully!');
    },
    onError: (error) => {
      showError('Failed to update ticket status: ' + error.message);
    },
  });

  const assignToMeMutation = useMutation({
    mutationFn: (ticketId) => ticketsAPI.assign(ticketId, user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      showSuccess('Ticket assigned to you successfully!');
    },
    onError: (error) => {
      showError('Failed to assign ticket: ' + error.message);
    },
  });

  const handleDragEnd = (result) => {
    if (!result.destination || !isAgent()) return;

    const { source, destination, draggableId } = result;
    
    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const ticketId = parseInt(draggableId);
    const newStatusId = parseInt(destination.droppableId);

    updateStatusMutation.mutate({ ticketId, statusId: newStatusId });
  };

  const handleMenuOpen = (event, ticket) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedTicket(ticket);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedTicket(null);
  };

  const handleAssignToMe = () => {
    if (selectedTicket) {
      assignToMeMutation.mutate(selectedTicket.id);
    }
    handleMenuClose();
  };

  const handleViewTicket = () => {
    if (selectedTicket) {
      navigate(`/tickets/${selectedTicket.id}`);
    }
    handleMenuClose();
  };

  const PriorityChip = ({ priority }) => {
    const colors = priorityColors[priority.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    return (
      <Chip
        label={priority}
        size="small"
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
          fontSize: '0.7rem',
          height: 20,
        }}
      />
    );
  };

  const StatusColumn = ({ status, tickets }) => {
    const colors = statusColors[status.name.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    
    return (
      <Paper sx={{ bgcolor: 'background.default', p: 1, height: 'fit-content' }}>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {status.name}
            </Typography>
            <Badge badgeContent={tickets.length} color="primary" />
          </Box>
          <Box
            sx={{
              height: 4,
              backgroundColor: colors.color,
              borderRadius: 2,
              mb: 1,
            }}
          />
        </Box>

        <Droppable droppableId={status.id.toString()}>
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                minHeight: 200,
                backgroundColor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                borderRadius: 1,
                transition: 'background-color 0.2s ease',
              }}
            >
              {tickets.map((ticket, index) => (
                <Draggable
                  key={ticket.id}
                  draggableId={ticket.id.toString()}
                  index={index}
                  isDragDisabled={!isAgent()}
                >
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        mb: 1,
                        cursor: isAgent() ? 'grab' : 'pointer',
                        transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                        boxShadow: snapshot.isDragging ? 4 : 1,
                        '&:hover': {
                          boxShadow: 2,
                        },
                      }}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold" color="text.secondary">
                            #{ticket.id}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PriorityChip priority={ticket.priorityName} />
                            {isAgent() && (
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, ticket)}
                                sx={{ ml: 0.5 }}
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>

                        {/* Title */}
                        <Typography variant="subtitle2" sx={{ mb: 1, lineHeight: 1.3 }}>
                          {ticket.title}
                        </Typography>

                        {/* Category */}
                        <Chip
                          label={ticket.categoryName}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1, fontSize: '0.7rem', height: 20 }}
                        />

                        {/* Assignment */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Person fontSize="small" color="action" />
                          {ticket.assignedToName ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Avatar sx={{ width: 16, height: 16, fontSize: '0.6rem' }}>
                                {ticket.assignedToName.split(' ').map(n => n[0]).join('')}
                              </Avatar>
                              <Typography variant="caption">
                                {ticket.assignedToName}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              Unassigned
                            </Typography>
                          )}
                        </Box>

                        {/* Created Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(ticket.createdAt), 'MMM dd')}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {tickets.length === 0 && (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    color: 'text.secondary',
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    border: '2px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2">
                    No tickets in {status.name.toLowerCase()}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Droppable>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Kanban Board
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isAgent() ? 'Drag tickets between columns to update their status' : 'View tickets organized by status'}
        </Typography>
      </Box>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Grid container spacing={2}>
          {Object.values(ticketsByStatus).map((statusGroup) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={statusGroup.id}>
              <StatusColumn status={statusGroup} tickets={statusGroup.tickets} />
            </Grid>
          ))}
        </Grid>
      </DragDropContext>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewTicket}>
          <OpenInNew sx={{ mr: 1 }} fontSize="small" />
          View Details
        </MenuItem>
        {selectedTicket && !selectedTicket.assignedToId && (
          <MenuItem onClick={handleAssignToMe}>
            <Assignment sx={{ mr: 1 }} fontSize="small" />
            Assign to Me
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default KanbanBoard;