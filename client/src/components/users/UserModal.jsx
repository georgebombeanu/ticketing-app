import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add,
  Delete,
} from '@mui/icons-material';
import { usersAPI, departmentsAPI, teamsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  isActive: z.boolean(),
  userRoles: z.array(z.object({
    roleId: z.number().min(1, 'Role is required'),
    departmentId: z.number().optional().nullable(),
    teamId: z.number().optional().nullable(),
  })).min(1, 'At least one role is required'),
});

const UserModal = ({ open, onClose, user = null, roles = [] }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!user;

  const [selectedDepartments, setSelectedDepartments] = useState({});

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsAPI.getAll().then(res => res.data),
    enabled: open,
  });

  const { data: allTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsAPI.getAll().then(res => res.data),
    enabled: open,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      isActive: true,
      userRoles: [{ roleId: 4, departmentId: null, teamId: null }], // Default to User role
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'userRoles',
  });

  const watchedRoles = watch('userRoles');

  // Update form when user prop changes
  useEffect(() => {
    if (user && open) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '',
        isActive: user.isActive ?? true,
        userRoles: user.userRoles?.length > 0 
          ? user.userRoles.map(role => ({
              roleId: role.roleId || 4,
              departmentId: role.departmentId || null,
              teamId: role.teamId || null,
            }))
          : [{ roleId: 4, departmentId: null, teamId: null }],
      });
    } else if (open && !user) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        isActive: true,
        userRoles: [{ roleId: 4, departmentId: null, teamId: null }],
      });
    }
  }, [user, open, reset]);

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
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} user`);
    },
  });

  const handleClose = () => {
    reset();
    setSelectedDepartments({});
    onClose();
  };

  const addRole = () => {
    append({ roleId: 4, departmentId: null, teamId: null });
  };

  const removeRole = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const getTeamsForDepartment = (departmentId) => {
    if (!departmentId || !allTeams) return [];
    return allTeams.filter(team => team.departmentId === departmentId);
  };

  const getRoleName = (roleId) => {
    return roles.find(role => role.id === roleId)?.name || 'Unknown';
  };

  const getDepartmentName = (departmentId) => {
    return departments?.find(dept => dept.id === departmentId)?.name || 'Unknown';
  };

  const getTeamName = (teamId) => {
    return allTeams?.find(team => team.id === teamId)?.name || 'Unknown';
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
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Basic Information
              </Typography>
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
            </Paper>

            {/* Account Details */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Account Details
              </Typography>
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
            </Paper>

            {/* Role Assignments */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Role Assignments
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={addRole}
                  size="small"
                  variant="outlined"
                >
                  Add Role
                </Button>
              </Box>

              <Stack spacing={2}>
                {fields.map((field, index) => (
                  <Paper key={field.id} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Role Assignment {index + 1}
                      </Typography>
                      {fields.length > 1 && (
                        <IconButton
                          onClick={() => removeRole(index)}
                          size="small"
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>

                    <Stack spacing={2}>
                      {/* Role Selection */}
                      <Controller
                        name={`userRoles.${index}.roleId`}
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select {...field} label="Role">
                              {roles.map(role => (
                                <MenuItem key={role.id} value={role.id}>
                                  {role.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />

                      {/* Department Selection */}
                      <Controller
                        name={`userRoles.${index}.departmentId`}
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Department (Optional)</InputLabel>
                            <Select 
                              {...field} 
                              label="Department (Optional)"
                              value={field.value || ''}
                              onChange={(e) => {
                                field.onChange(e.target.value || null);
                                // Reset team when department changes
                                const currentRoles = [...watchedRoles];
                                currentRoles[index].teamId = null;
                              }}
                            >
                              <MenuItem value="">No Department</MenuItem>
                              {departments?.map(dept => (
                                <MenuItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />

                      {/* Team Selection */}
                      <Controller
                        name={`userRoles.${index}.teamId`}
                        control={control}
                        render={({ field }) => {
                          const departmentId = watchedRoles[index]?.departmentId;
                          const availableTeams = getTeamsForDepartment(departmentId);
                          
                          return (
                            <FormControl fullWidth disabled={!departmentId}>
                              <InputLabel>Team (Optional)</InputLabel>
                              <Select 
                                {...field} 
                                label="Team (Optional)"
                                value={field.value || ''}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              >
                                <MenuItem value="">No Team</MenuItem>
                                {availableTeams.map(team => (
                                  <MenuItem key={team.id} value={team.id}>
                                    {team.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          );
                        }}
                      />

                      {/* Role Summary */}
                      <Box sx={{ bgcolor: 'action.hover', p: 1, borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Role: <strong>{getRoleName(watchedRoles[index]?.roleId)}</strong>
                          {watchedRoles[index]?.departmentId && (
                            <> • Department: <strong>{getDepartmentName(watchedRoles[index].departmentId)}</strong></>
                          )}
                          {watchedRoles[index]?.teamId && (
                            <> • Team: <strong>{getTeamName(watchedRoles[index].teamId)}</strong></>
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              {errors.userRoles && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.userRoles.message}
                </Alert>
              )}
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
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update User' : 'Create User')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserModal;