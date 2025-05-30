import React, { useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Alert,
  Stack,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { teamsAPI, departmentsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  departmentId: z.number().min(1, 'Department is required'),
  isActive: z.boolean(),
});

const TeamModal = ({ open, onClose, team = null }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!team;

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
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
      departmentId: '',
      isActive: true,
    },
  });

  // Update form when team prop changes
  useEffect(() => {
    if (team && open) {
      reset({
        name: team.name || '',
        description: team.description || '',
        departmentId: team.departmentId || '',
        isActive: team.isActive ?? true,
      });
    } else if (open && !team) {
      reset({
        name: '',
        description: '',
        departmentId: '',
        isActive: true,
      });
    }
  }, [team, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return teamsAPI.update(team.id, data);
      } else {
        return teamsAPI.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] }); // Refresh departments too since they show team counts
      showSuccess(`Team ${isEdit ? 'updated' : 'created'} successfully!`);
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} team`);
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit Team: ${team?.name}` : 'Create New Team'}
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
                Team Information
              </Typography>
              
              <Stack spacing={2}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Team Name"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="e.g., Hardware Support, Backend Team, Help Desk"
                    />
                  )}
                />

                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.departmentId}>
                      <InputLabel>Department</InputLabel>
                      <Select
                        {...field}
                        label="Department"
                        value={field.value || ''}
                      >
                        {departments?.filter(dept => dept.isActive).map((department) => (
                          <MenuItem key={department.id} value={department.id}>
                            {department.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.departmentId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.departmentId.message}
                        </Typography>
                      )}
                    </FormControl>
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
                      placeholder="Brief description of the team's responsibilities and focus areas..."
                    />
                  )}
                />

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Active Team"
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Stack>
            </Paper>

            {/* Additional Info for Edit */}
            {isEdit && team && (
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>Department:</strong> {team.departmentName}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Created:</strong> {new Date(team.createdAt).toLocaleDateString()}
                </Typography>
                {team.userRoles && team.userRoles.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Members:</strong> {team.userRoles.length} user(s) assigned
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
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Team' : 'Create Team')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamModal;