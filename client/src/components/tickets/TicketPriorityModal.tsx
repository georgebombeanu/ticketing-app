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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowUp,
  KeyboardArrowDown,
  PriorityHigh,
  Remove,
} from '@mui/icons-material';
import { ticketPrioritiesAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { priorityColors } from '../../theme/theme';

const prioritySchema = z.object({
  name: z.string().min(1, 'Priority name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
});

const predefinedPriorities = [
  { name: 'Critical', description: 'System down, complete service disruption, security breach' },
  { name: 'Urgent', description: 'Critical functionality broken, immediate attention required' },
  { name: 'High', description: 'Major functionality broken, affects many users' },
  { name: 'Medium', description: 'Important but workaround exists, affects some users' },
  { name: 'Low', description: 'Minor issues, cosmetic problems, enhancement requests' },
];

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
    setValue,
  } = useForm({
    resolver: zodResolver(prioritySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const watchedName = watch('name');

  // Update form when priority prop changes
  useEffect(() => {
    if (priority && open) {
      reset({
        name: priority.name || '',
        description: priority.description || '',
      });
    } else if (open && !priority) {
      reset({
        name: '',
        description: '',
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

  const handlePredefinedSelect = (predefined) => {
    setValue('name', predefined.name);
    setValue('description', predefined.description);
  };

  const getPriorityIcon = (priorityName) => {
    const name = priorityName.toLowerCase();
    switch (name) {
      case 'critical':
      case 'urgent':
        return <KeyboardArrowUp sx={{ color: 'error.main' }} />;
      case 'high':
        return <PriorityHigh sx={{ color: 'error.main' }} />;
      case 'medium':
        return <Remove sx={{ color: 'warning.main' }} />;
      case 'low':
        return <KeyboardArrowDown sx={{ color: 'info.main' }} />;
      default:
        return <PriorityHigh />;
    }
  };

  const getPriorityPreview = () => {
    if (!watchedName) return null;
    
    const colors = priorityColors[watchedName.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    return (
      <Chip
        label={watchedName}
        size="small"
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
        }}
        icon={getPriorityIcon(watchedName)}
      />
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit Priority: ${priority?.name}` : 'Create New Ticket Priority'}
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit(mutation.mutate)}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {mutation.error && (
              <Alert severity="error">
                {mutation.error.response?.data?.message || 'An error occurred'}
              </Alert>
            )}

            {/* Quick Select for Predefined Priorities */}
            {!isEdit && (
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>
                  🚀 Quick Start - Select a Standard Priority
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {predefinedPriorities.map((predefined) => (
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
                Priority Information
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

                {/* Preview */}
                {watchedName && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Preview:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPriorityPreview()}
                      <Typography variant="caption" color="text.secondary">
                        This is how the priority will appear in the system
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Additional Info for Edit */}
            {isEdit && priority && (
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>ID:</strong> {priority.id}
                </Typography>
                {priority.ticketsCount !== undefined && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Associated Tickets:</strong> {priority.ticketsCount} ticket(s)
                  </Typography>
                )}
              </Paper>
            )}

            {/* Usage Guidelines */}
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                ⚡ Priority Best Practices
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                • Use distinct names that clearly indicate urgency levels<br/>
                • Keep the number of priorities manageable (3-5 levels)<br/>
                • Provide clear descriptions so users know when to use each level<br/>
                • Consider your team's response capabilities when defining levels
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
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Priority' : 'Create Priority')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketPriorityModal;