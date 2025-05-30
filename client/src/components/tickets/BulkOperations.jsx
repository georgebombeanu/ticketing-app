import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  Edit,
  Close,
  Delete,
  Clear,
} from '@mui/icons-material';
import { ticketsAPI, usersAPI, ticketStatusesAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

const BulkOperations = ({ 
  tickets = [], 
  selectedTickets = [], 
  onSelectionChange,
  onClearSelection 
}) => {
  const queryClient = useQueryClient();
  const { user, isAgent } = useAuthStore();
  const { showSuccess, showError } = useToast();
  
  const [bulkAction, setBulkAction] = useState('');
  const [bulkAssignee, setBulkAssignee] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(res => res.data),
    enabled: bulkAction === 'assign',
  });

  const { data: statuses } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusesAPI.getAll().then(res => res.data),
    enabled: bulkAction === 'status',
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ action, ticketIds, data }) => {
      const promises = ticketIds.map(async (ticketId) => {
        switch (action) {
          case 'assign':
            return data.assigneeId 
              ? ticketsAPI.assign(ticketId, data.assigneeId)
              : ticketsAPI.unassign(ticketId);
          case 'status':
            return ticketsAPI.updateStatus(ticketId, data.statusId);
          case 'close':
            return ticketsAPI.close(ticketId);
          case 'delete':
            return ticketsAPI.delete(ticketId);
          default:
            throw new Error('Unknown bulk action');
        }
      });
      return Promise.all(promises);
    },
    onSuccess: (results, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'active-count'] });
      
      const { action, ticketIds } = variables;
      const actionLabels = {
        assign: 'assigned',
        status: 'status updated',
        close: 'closed',
        delete: 'deleted',
      };
      
      showSuccess(`${ticketIds.length} ticket(s) ${actionLabels[action]} successfully!`);
      onClearSelection();
      setConfirmDialog(false);
      setBulkAction('');
      setBulkAssignee('');
      setBulkStatus('');
    },
    onError: (error) => {
      showError('Bulk operation failed: ' + error.message);
    },
    onSettled: () => {
      setActionInProgress(false);
    },
  });

  const handleSelectAll = () => {
    if (selectedTickets.length === tickets.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(tickets.map(t => t.id));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedTickets.length === 0) return;

    let data = {};
    switch (bulkAction) {
      case 'assign':
        if (!bulkAssignee) {
          showError('Please select an assignee');
          return;
        }
        data.assigneeId = bulkAssignee === 'unassign' ? null : parseInt(bulkAssignee);
        break;
      case 'status':
        if (!bulkStatus) {
          showError('Please select a status');
          return;
        }
        data.statusId = parseInt(bulkStatus);
        break;
      case 'close':
      case 'delete':
        break;
      default:
        showError('Invalid bulk action');
        return;
    }

    setConfirmDialog(true);
  };

  const executeBulkAction = () => {
    setActionInProgress(true);
    
    let data = {};
    switch (bulkAction) {
      case 'assign':
        data.assigneeId = bulkAssignee === 'unassign' ? null : parseInt(bulkAssignee);
        break;
      case 'status':
        data.statusId = parseInt(bulkStatus);
        break;
    }

    bulkUpdateMutation.mutate({
      action: bulkAction,
      ticketIds: selectedTickets,
      data,
    });
  };

  const getActionDescription = () => {
    switch (bulkAction) {
      case 'assign':
        const assigneeName = bulkAssignee === 'unassign' 
          ? 'Unassign' 
          : users?.find(u => u.id === parseInt(bulkAssignee))?.firstName + ' ' + 
            users?.find(u => u.id === parseInt(bulkAssignee))?.lastName;
        return `Assign to: ${assigneeName}`;
      case 'status':
        const statusName = statuses?.find(s => s.id === parseInt(bulkStatus))?.name;
        return `Change status to: ${statusName}`;
      case 'close':
        return 'Close tickets';
      case 'delete':
        return 'Delete tickets';
      default:
        return '';
    }
  };

  if (!isAgent()) return null;

  return (
    <>
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Select All */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              checked={selectedTickets.length === tickets.length && tickets.length > 0}
              indeterminate={selectedTickets.length > 0 && selectedTickets.length < tickets.length}
              onChange={handleSelectAll}
            />
            <Typography variant="body2">
              Select All ({selectedTickets.length} selected)
            </Typography>
          </Box>

          {selectedTickets.length > 0 && (
            <>
              {/* Bulk Action Selection */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Bulk Action</InputLabel>
                <Select
                  value={bulkAction}
                  label="Bulk Action"
                  onChange={(e) => setBulkAction(e.target.value)}
                >
                  <MenuItem value="assign">Assign</MenuItem>
                  <MenuItem value="status">Change Status</MenuItem>
                  <MenuItem value="close">Close</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                </Select>
              </FormControl>

              {/* Action-specific controls */}
              {bulkAction === 'assign' && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    value={bulkAssignee}
                    label="Assign To"
                    onChange={(e) => setBulkAssignee(e.target.value)}
                  >
                    <MenuItem value="unassign">Unassign</MenuItem>
                    {users?.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {bulkAction === 'status' && (
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={bulkStatus}
                    label="New Status"
                    onChange={(e) => setBulkStatus(e.target.value)}
                  >
                    {statuses?.map(status => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Execute Button */}
              <Button
                variant="contained"
                onClick={handleBulkAction}
                disabled={!bulkAction || actionInProgress}
                startIcon={bulkAction === 'assign' ? <Assignment /> : 
                          bulkAction === 'status' ? <Edit /> :
                          bulkAction === 'close' ? <Close /> : <Delete />}
              >
                Apply to {selectedTickets.length} tickets
              </Button>

              {/* Clear Selection */}
              <Button
                variant="outlined"
                onClick={onClearSelection}
                startIcon={<Clear />}
              >
                Clear Selection
              </Button>
            </>
          )}
        </Box>

        {/* Progress indicator */}
        {actionInProgress && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Processing bulk operation...
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Bulk Operation</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will affect {selectedTickets.length} ticket(s) and cannot be undone.
          </Alert>
          
          <Typography variant="body1" gutterBottom>
            You are about to perform the following action:
          </Typography>
          
          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1, my: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {getActionDescription()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              On {selectedTickets.length} selected ticket(s)
            </Typography>
          </Box>

          <Typography variant="body2">
            Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={executeBulkAction} 
            variant="contained"
            disabled={actionInProgress}
            color={bulkAction === 'delete' ? 'error' : 'primary'}
          >
            {actionInProgress ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkOperations;