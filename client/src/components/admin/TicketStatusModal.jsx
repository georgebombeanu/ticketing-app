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
  Grid,
  Chip,
} from '@mui/material';
import { ticketStatusesAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ColorPicker from '../common/ColorPicker';
import IconPicker from '../common/IconPicker';
import { renderIcon } from '../../utils/iconUtils';

const statusSchema = z.object({
  name: z.string().min(1, 'Status name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  icon: z.string().min(1, 'Icon is required'),
});

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
  } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#4caf50',
      icon: 'Schedule',
    },
  });

  const watchedName = watch('name');
  const watchedColor = watch('color');
  const watchedIcon = watch('icon');

  // Update form when status prop changes
  useEffect(() => {
    if (status && open) {
      reset({
        name: status.name || '',
        description: status.description || '',
        color: status.color || '#4caf50',
        icon: status.icon || 'Schedule',
      });
    } else if (open && !status) {
      reset({
        name: '',
        description: '',
        color: '#4caf50',
        icon: 'Schedule',
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

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit Status: ${status?.name}` : 'Create New Ticket Status'}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {mutation.error && (
            <Alert severity="error">
              {mutation.error.response?.data?.message || 'An error occurred'}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
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
                </Stack>
              </Paper>
            </Grid>

            {/* Appearance */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Appearance
                </Typography>
                
                <Stack spacing={3}>
                  <Controller
                    name="color"
                    control={control}
                    render={({ field }) => (
                      <ColorPicker
                        label="Color"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <Controller
                    name="icon"
                    control={control}
                    render={({ field }) => (
                      <IconPicker
                        label="Icon"
                        value={field.value}
                        onChange={field.onChange}
                        color={watchedColor}
                      />
                    )}
                  />

                  {/* Live Preview */}
                  {watchedName && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Preview
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Chip
                          label={watchedName}
                          icon={renderIcon(watchedIcon, { sx: { color: watchedColor + ' !important' } })}
                          sx={{
                            backgroundColor: watchedColor + '20', // Add transparency
                            color: watchedColor,
                            border: `1px solid ${watchedColor}`,
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            height: 32,
                            '& .MuiChip-icon': {
                              color: watchedColor + ' !important',
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                        How it will appear in tickets
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Additional Info for Edit */}
          {isEdit && status && (
            <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="body2">
                <strong>ID:</strong> {status.id}
                {status.ticketsCount !== undefined && (
                  <><br/><strong>Associated Tickets:</strong> {status.ticketsCount} ticket(s)</>
                )}
              </Typography>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit(onSubmit)} 
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