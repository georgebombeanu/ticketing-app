import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Switch,
  FormControlLabel,
  Alert,
  Stack,
  Typography,
} from '@mui/material';
import { usersAPI, departmentsAPI, teamsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  isActive: z.boolean(),
  userRoles: z.array(z.object({
    roleId: z.number(),
    departmentId: z.number().optional(),
    teamId: z.number().optional(),
  })).min(1, 'At least one role is required'),
});

const UserModal = ({ open, onClose, user = null, roles = [] }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!user;

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsAPI.getAll().then(res => res.data),
    enabled: open,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      password: '',
      isActive: user?.isActive ?? true,
      userRoles: user?.userRoles || [{ roleId: 4, departmentId: undefined, teamId: undefined }], // Default to User role
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const userData = {
        ...data,
        userRoles: data.userRoles.map(role => ({
          roleId: role.roleId,
          departmentId: role.departmentId || null,
          teamId: role.teamId || null,
        })),
      };
      
      if (isEdit) {
        // Remove password if empty for updates
        if (!userData.password) {
          delete userData.password;
        }
        return usersAPI.update(user.id, userData);
      } else {
        return usersAPI.create(userData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess(`User ${isEdit ? 'updated' : 'created'} successfully!`);
      onClose();
      reset();
    },
    onError: (error) => {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit User: ${user?.firstName} ${user?.lastName}` : 'Create New User'}
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
            <Box>
              <Typography variant="subtitle1" gutterBottom>Basic Information</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Stack>
            </Box>

            {/* Account Details */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Account Details</Typography>
              <Stack spacing={2}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
                      type="password"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Active User"
                    />
                  )}
                />
              </Stack>
            </Box>

            {/* Role Assignment */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>Role Assignment</Typography>
              <FormControl fullWidth>
                <InputLabel>Primary Role</InputLabel>
                <Controller
                  name="userRoles.0.roleId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Primary Role">
                      {roles.map(role => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
              
              {/* Department/Team selection would go here */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Department and team assignment can be added here based on role selection
                </Typography>
              </Box>
            </Box>
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
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;