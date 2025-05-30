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
  Switch,
  FormControlLabel,
  Alert,
  Stack,
  Typography,
  Paper,
  Box,
} from '@mui/material';
import { ticketCategoriesAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  isActive: z.boolean(),
});

const TicketCategoryModal = ({ open, onClose, category = null }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!category;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Update form when category prop changes
  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive ?? true,
      });
    } else if (open && !category) {
      reset({
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [category, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return ticketCategoriesAPI.update(category.id, data);
      } else {
        return ticketCategoriesAPI.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-categories'] });
      showSuccess(`Category ${isEdit ? 'updated' : 'created'} successfully!`);
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} category`);
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit Category: ${category?.name}` : 'Create New Ticket Category'}
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit(mutation.mutate)}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {mutation.error && (
              <Alert severity="error">
                {mutation.error.response?.data?.message || 'An error occurred'}
              </Alert>
            )}

            {/* Basic Information */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Category Information
              </Typography>
              
              <Stack spacing={2}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="e.g., Bug Report, Feature Request, Technical Support"
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
                      placeholder="Brief description of what types of tickets belong to this category..."
                    />
                  )}
                />

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Active Category (visible for new tickets)"
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Stack>
            </Paper>

            {/* Additional Info for Edit */}
            {isEdit && category && (
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>ID:</strong> {category.id}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Created:</strong> {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Unknown'}
                </Typography>
                {category.ticketsCount !== undefined && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Associated Tickets:</strong> {category.ticketsCount} ticket(s)
                  </Typography>
                )}
              </Paper>
            )}

            {/* Usage Guidelines */}
            <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                📋 Category Guidelines
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                • Use clear, descriptive names that users will understand<br/>
                • Keep categories broad enough to avoid too many options<br/>
                • Inactive categories won't appear in ticket creation forms<br/>
                • Existing tickets will keep their category even if deactivated
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
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Category' : 'Create Category')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketCategoryModal;