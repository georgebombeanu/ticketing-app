import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  MoreVert,
  Delete,
} from '@mui/icons-material';
import { ticketPrioritiesAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import useAuthStore from '../../store/authStore';
import TicketPriorityModal from '../../components/admin/TicketPriorityModal';
import { renderIcon } from '../../utils/iconUtils';

const TicketPriorities = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { isAdmin } = useAuthStore();

  // Modal states
  const [priorityModalOpen, setPriorityModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, priority: null });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuPriority, setMenuPriority] = useState(null);

  const { data: priorities, isLoading, error } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => ticketPrioritiesAPI.getAll().then(res => res.data),
  });

  // Delete priority mutation
  const deleteMutation = useMutation({
    mutationFn: (priorityId) => ticketPrioritiesAPI.delete(priorityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-priorities'] });
      showSuccess('Priority deleted successfully');
      setConfirmDialog({ open: false, priority: null });
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete priority');
    },
  });

  const handleCreatePriority = () => {
    setSelectedPriority(null);
    setPriorityModalOpen(true);
  };

  const handleEditPriority = (priority) => {
    setSelectedPriority(priority);
    setPriorityModalOpen(true);
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event, priority) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuPriority(priority);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuPriority(null);
  };

  const handleDeletePriority = (priority) => {
    setConfirmDialog({
      open: true,
      priority,
    });
    setMenuAnchor(null);
  };

  const executeDelete = () => {
    if (confirmDialog.priority) {
      deleteMutation.mutate(confirmDialog.priority.id);
    }
  };

  const getPriorityChip = (priority) => {
    return (
      <Chip
        label={priority.name}
        icon={renderIcon(priority.icon, { sx: { color: priority.color + ' !important' } })}
        sx={{
          backgroundColor: priority.color + '20',
          color: priority.color,
          border: `1px solid ${priority.color}`,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: priority.color + ' !important',
          }
        }}
      />
    );
  };

  if (!isAdmin()) {
    return (
      <Alert severity="error">
        Access denied. Admin privileges required.
      </Alert>
    );
  }

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load ticket priorities</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Ticket Priorities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage ticket priority levels ({priorities?.length || 0} priorities)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreatePriority}
        >
          Add Priority
        </Button>
      </Box>

      {/* Priorities Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Priority</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Visual</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {priorities?.map((priority) => (
                <TableRow key={priority.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {renderIcon(priority.icon, { sx: { color: priority.color } })}
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {priority.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {priority.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {priority.description || 'No description'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {priority.ticketsCount || 0} tickets
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {getPriorityChip(priority)}
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, priority)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {(!priorities || priorities.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No priorities found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first ticket priority to get started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreatePriority}
            >
              Create Priority
            </Button>
          </Box>
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 180 } }}
      >
        <MenuItem onClick={() => handleEditPriority(menuPriority)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Priority
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleDeletePriority(menuPriority)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Delete Priority
        </MenuItem>
      </Menu>

      {/* Priority Modal */}
      <TicketPriorityModal
        open={priorityModalOpen}
        onClose={() => setPriorityModalOpen(false)}
        priority={selectedPriority}
      />

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, priority: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete priority{' '}
            <strong>{confirmDialog.priority?.name}</strong>?
            <Box component="span" sx={{ color: 'warning.main', display: 'block', mt: 1 }}>
              This action cannot be undone.
            </Box>
            {confirmDialog.priority?.ticketsCount > 0 && (
              <Box component="span" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
                This priority is used by {confirmDialog.priority.ticketsCount} ticket(s).
                You may want to reassign those tickets first.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, priority: null })}>
            Cancel
          </Button>
          <Button 
            onClick={executeDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Priority'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketPriorities;