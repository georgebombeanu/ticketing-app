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
import { departmentsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  isActive: z.boolean(),
});

const DepartmentModal = ({ open, onClose, department = null }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!department;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  // Update form when department prop changes
  useEffect(() => {
    if (department && open) {
      reset({
        name: department.name || '',
        description: department.description || '',
        isActive: department.isActive ?? true,
      });
    } else if (open && !department) {
      reset({
        name: '',
        description: '',
        isActive: true,
      });
    }
  }, [department, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return departmentsAPI.update(department.id, data);
      } else {
        return departmentsAPI.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showSuccess(`Department ${isEdit ? 'updated' : 'created'} successfully!`);
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} department`);
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit Department: ${department?.name}` : 'Create New Department'}
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
                Department Information
              </Typography>
              
              <Stack spacing={2}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Department Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="e.g., IT Support, Customer Service, Development"
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
                      placeholder="Brief description of the department's responsibilities and purpose..."
                    />
                  )}
                />

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Active Department"
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Stack>
            </Paper>

            {/* Additional Info for Edit */}
            {isEdit && department && (
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(department.createdAt).toLocaleDateString()}
                </Typography>
                {department.teams && department.teams.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Teams:</strong> {department.teams.length} team(s) assigned
                  </Typography>
                )}
                {department.userRoles && department.userRoles.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Users:</strong> {department.userRoles.length} user(s) assigned
                  </Typography>
                )}
              </Paper>
            )}
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
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Department' : 'Create Department')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DepartmentModal;