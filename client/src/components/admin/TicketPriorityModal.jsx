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
import { ticketPrioritiesAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import ColorPicker from '../common/ColorPicker';
import IconPicker from '../common/IconPicker';
import { renderIcon } from '../../utils/iconUtils';

const prioritySchema = z.object({
  name: z.string().min(1, 'Priority name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
  icon: z.string().min(1, 'Icon is required'),
});

const TicketPriorityModal = ({ open, onClose, priority = null }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!priority;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(prioritySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#ff9800',
      icon: 'PriorityHigh',
    },
  });

  const watchedName = watch('name');
  const watchedColor = watch('color');
  const watchedIcon = watch('icon');

  // Update form when priority prop changes
  useEffect(() => {
    if (priority && open) {
      reset({
        name: priority.name || '',
        description: priority.description || '',
        color: priority.color || '#ff9800',
        icon: priority.icon || 'PriorityHigh',
      });
    } else if (open && !priority) {
      reset({
        name: '',
        description: '',
        color: '#ff9800',
        icon: 'PriorityHigh',
      });
    }
  }, [priority, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return ticketPrioritiesAPI.update(priority.id, data);
      } else {
        return ticketPrioritiesAPI.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-priorities'] });
      showSuccess(`Priority ${isEdit ? 'updated' : 'created'} successfully!`);
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} priority`);
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
        {isEdit ? `Edit Priority: ${priority?.name}` : 'Create New Ticket Priority'}
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
                        label="Priority Name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        placeholder="e.g., Critical, High, Medium, Low"
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
                        placeholder="Describe when this priority level should be used..."
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
          {isEdit && priority && (
            <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="body2">
                <strong>ID:</strong> {priority.id}
                {priority.ticketsCount !== undefined && (
                  <><br/><strong>Associated Tickets:</strong> {priority.ticketsCount} ticket(s)</>
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
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Priority' : 'Create Priority')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketPriorityModal;