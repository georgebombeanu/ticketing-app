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
import { ticketStatusesAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import useAuthStore from '../../store/authStore';
import TicketStatusModal from '../../components/admin/TicketStatusModal';
import { renderIcon } from '../../utils/iconUtils';

const TicketStatuses = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { isAdmin } = useAuthStore();

  // Modal states
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, status: null });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuStatus, setMenuStatus] = useState(null);

  const { data: statuses, isLoading, error } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusesAPI.getAll().then(res => res.data),
  });

  // Delete status mutation
  const deleteMutation = useMutation({
    mutationFn: (statusId) => ticketStatusesAPI.delete(statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-statuses'] });
      showSuccess('Status deleted successfully');
      setConfirmDialog({ open: false, status: null });
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete status');
    },
  });

  const handleCreateStatus = () => {
    setSelectedStatus(null);
    setStatusModalOpen(true);
  };

  const handleEditStatus = (status) => {
    setSelectedStatus(status);
    setStatusModalOpen(true);
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event, status) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuStatus(status);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuStatus(null);
  };

  const handleDeleteStatus = (status) => {
    setConfirmDialog({
      open: true,
      status,
    });
    setMenuAnchor(null);
  };

  const executeDelete = () => {
    if (confirmDialog.status) {
      deleteMutation.mutate(confirmDialog.status.id);
    }
  };

  const getStatusChip = (status) => {
    return (
      <Chip
        label={status.name}
        icon={renderIcon(status.icon, { sx: { color: status.color + ' !important' } })}
        sx={{
          backgroundColor: status.color + '20',
          color: status.color,
          border: `1px solid ${status.color}`,
          fontWeight: 500,
          '& .MuiChip-icon': {
            color: status.color + ' !important',
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
  if (error) return <Alert severity="error">Failed to load ticket statuses</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Ticket Statuses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage ticket workflow states ({statuses?.length || 0} statuses)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateStatus}
        >
          Add Status
        </Button>
      </Box>

      {/* Statuses Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Usage</TableCell>
                <TableCell>Visual</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statuses?.map((status) => (
                <TableRow key={status.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {renderIcon(status.icon, { sx: { color: status.color } })}
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {status.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {status.id}
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
                      {status.description || 'No description'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {status.ticketsCount || 0} tickets
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusChip(status)}
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, status)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {(!statuses || statuses.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No statuses found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first ticket status to get started.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateStatus}
            >
              Create Status
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
        <MenuItem onClick={() => handleEditStatus(menuStatus)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Status
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleDeleteStatus(menuStatus)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          Delete Status
        </MenuItem>
      </Menu>

      {/* Status Modal */}
      <TicketStatusModal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        status={selectedStatus}
      />

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, status: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete status{' '}
            <strong>{confirmDialog.status?.name}</strong>?
            <Box component="span" sx={{ color: 'warning.main', display: 'block', mt: 1 }}>
              This action cannot be undone.
            </Box>
            {confirmDialog.status?.ticketsCount > 0 && (
              <Box component="span" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
                This status is used by {confirmDialog.status.ticketsCount} ticket(s).
                You may want to reassign those tickets first.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, status: null })}>
            Cancel
          </Button>
          <Button 
            onClick={executeDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketStatuses;