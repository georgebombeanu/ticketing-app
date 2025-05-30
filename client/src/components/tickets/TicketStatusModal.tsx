import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Stack,
  Typography,
  Paper,
  Box,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  PlayArrow,
  Pause,
  Stop,
  Cancel,
} from '@mui/icons-material';
import { ticketStatusesAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { statusColors } from '../../theme/theme';

const statusSchema = z.object({
  name: z.string().min(1, 'Status name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
});

const predefinedStatuses = [
  { name: 'Open', description: 'Ticket has been created and is waiting to be picked up' },
  { name: 'In Progress', description: 'Ticket is actively being worked on' },
  { name: 'Pending', description: 'Ticket is waiting for external input or approval' },
  { name: 'Resolved', description: 'Issue has been fixed and is awaiting verification' },
  { name: 'Closed', description: 'Ticket has been completed and verified' },
  { name: 'Cancelled', description: 'Ticket has been cancelled and will not be completed' },
];

const TicketStatusModal = ({ open, onClose, status = null }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!status;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const watchedName = watch('name');

  // Update form when status prop changes
  useEffect(() => {
    if (status && open) {
      reset({
        name: status.name || '',
        description: status.description || '',
      });
    } else if (open && !status) {
      reset({
        name: '',
        description: '',
      });
    }
  }, [status, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return ticketStatusesAPI.update(status.id, data);
      } else {
        return ticketStatusesAPI.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-statuses'] });
      showSuccess(`Status ${isEdit ? 'updated' : 'created'} successfully!`);
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} status`);
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePredefinedSelect = (predefined) => {
    setValue('name', predefined.name);
    setValue('description', predefined.description);
  };

  const getStatusIcon = (statusName) => {
    const name = statusName.toLowerCase();
    switch (name) {
      case 'open':
        return <PlayArrow sx={{ color: 'info.main' }} />;
      case 'in progress':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'pending':
        return <Pause sx={{ color: 'secondary.main' }} />;
      case 'resolved':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'closed':
        return <Stop sx={{ color: 'grey.500' }} />;
      case 'cancelled':
        return <Cancel sx={{ color: 'error.main' }} />;
      default:
        return <Schedule />;
    }
  };

  const getStatusType = (statusName) => {
    const name = statusName.toLowerCase();
    if (['resolved', 'closed'].includes(name)) return 'Final';
    if (['cancelled'].includes(name)) return 'Terminal';
    if (['in progress', 'pending'].includes(name)) return 'Active';
    return 'Initial';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Final': return 'success';
      case 'Terminal': return 'error';
      case 'Active': return 'warning';
      case 'Initial': return 'info';
      default: return 'default';
    }
  };

  const getStatusPreview = () => {
    if (!watchedName) return null;
    
    const colors = statusColors[watchedName.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={watchedName}
          size="small"
          sx={{
            backgroundColor: colors.bg,
            color: colors.color,
            fontWeight: 500,
          }}
          icon={getStatusIcon(watchedName)}
        />
        <Chip
          label={getStatusType(watchedName)}
          size="small"
          color={getTypeColor(getStatusType(watchedName))}
          variant="outlined"
        />
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit Status: ${status?.name}` : 'Create New Ticket Status'}
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit(mutation.mutate)}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {mutation.error && (
              <Alert severity="error">
                {mutation.error.response?.data?.message || 'An error occurred'}
              </Alert>
            )}

            {/* Quick Select for Predefined Statuses */}
            {!isEdit && (
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>
                  🚀 Quick Start - Select a Standard Status
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {predefinedStatuses.map((predefined) => (
                    <Button
                      key={predefined.name}
                      size="small"
                      variant="outlined"
                      onClick={() => handlePredefinedSelect(predefined)}
                      sx={{ 
                        color: 'primary.contrastText', 
                        borderColor: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                          borderColor: 'primary.contrastText',
                        }
                      }}
                    >
                      {predefined.name}
                    </Button>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Basic Information */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Status Information
              </Typography>
              
              <Stack spacing={2}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Status Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="e.g., Open, In Progress, Resolved, Closed"
                    />
                  )}
                />

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Describe what this status means in your workflow..."
                    />
                  )}
                />

                {/* Preview */}
                {watchedName && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Preview:
                    </Typography>
                    {getStatusPreview()}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      This is how the status will appear in the system
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Additional Info for Edit */}
            {isEdit && status && (
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>ID:</strong> {status.id}
                </Typography>
                {status.ticketsCount !== undefined && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Associated Tickets:</strong> {status.ticketsCount} ticket(s)
                  </Typography>
                )}
              </Paper>
            )}

            {/* Status Workflow Guidelines */}
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                🔄 Status Workflow Guidelines
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                • <strong>Initial</strong> statuses should be used for new tickets<br/>
                • <strong>Active</strong> statuses indicate work in progress<br/>
                • <strong>Final</strong> statuses mean the issue is resolved<br/>
                • <strong>Terminal</strong> statuses end the ticket without resolution<br/>
                • Consider the logical flow from creation to completion
              </Typography>
            </Paper>
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit(mutation.mutate)} 
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Status' : 'Create Status')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketStatusModal;