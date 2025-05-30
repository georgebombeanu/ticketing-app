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

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit Category: ${category?.name}` : 'Create New Ticket Category'}
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {mutation.error && (
            <Alert severity="error">
              {mutation.error.response?.data?.message || 'An error occurred'}
            </Alert>
          )}

          {/* Basic Information */}
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
                  label="Active (visible for new tickets)"
                />
              )}
            />
          </Stack>

          {/* Additional Info for Edit */}
          {isEdit && category && (
            <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="body2">
                <strong>ID:</strong> {category.id} • 
                <strong> Created:</strong> {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'Unknown'}
                {category.ticketsCount !== undefined && (
                  <><br/><strong>Associated Tickets:</strong> {category.ticketsCount} ticket(s)</>
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
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Category' : 'Create Category')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketCategoryModal;