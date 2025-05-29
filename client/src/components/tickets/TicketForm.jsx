import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Send,
} from '@mui/icons-material';
import { 
  ticketsAPI, 
  ticketCategoriesAPI, 
  ticketPrioritiesAPI, 
  departmentsAPI,
  teamsAPI,
  usersAPI,
  ticketStatusesAPI,
} from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

// Validation schema - Updated to handle string to number conversion
const ticketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  categoryId: z.union([z.string(), z.number()]).transform(val => parseInt(val)).refine(val => val > 0, 'Category is required'),
  priorityId: z.union([z.string(), z.number()]).transform(val => parseInt(val)).refine(val => val > 0, 'Priority is required'),
  departmentId: z.union([z.string(), z.number()]).transform(val => parseInt(val)).refine(val => val > 0, 'Department is required'),
  statusId: z.union([z.string(), z.number()]).transform(val => val ? parseInt(val) : undefined).optional(),
  teamId: z.union([z.string(), z.number()]).transform(val => val ? parseInt(val) : null).optional().nullable(),
  assignedToId: z.union([z.string(), z.number()]).transform(val => val ? parseInt(val) : null).optional().nullable(),
});

const TicketForm = ({ ticket = null, isEdit = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Add query client
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [selectedDepartment, setSelectedDepartment] = useState(ticket?.departmentId || null);
  const [selectedTeam, setSelectedTeam] = useState(ticket?.teamId || null);

  // Fetch options data
  const { data: categories } = useQuery({
    queryKey: ['ticket-categories', 'active'],
    queryFn: () => ticketCategoriesAPI.getActive().then(res => res.data),
  });

  const { data: priorities } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => ticketPrioritiesAPI.getAll().then(res => res.data),
  });

  const { data: statuses } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusesAPI.getAll().then(res => res.data),
    enabled: isEdit, // Only fetch statuses for edit mode
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsAPI.getAll().then(res => res.data),
  });

  const { data: teams } = useQuery({
    queryKey: ['teams', 'department', selectedDepartment],
    queryFn: () => teamsAPI.getByDepartment(selectedDepartment).then(res => res.data),
    enabled: !!selectedDepartment,
  });

  const { data: users } = useQuery({
    queryKey: ['users', 'team', selectedTeam],
    queryFn: () => selectedTeam 
      ? usersAPI.getByTeam(selectedTeam).then(res => res.data)
      : usersAPI.getByDepartment(selectedDepartment).then(res => res.data),
    enabled: !!selectedDepartment,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: ticket?.title || '',
      description: ticket?.description || '',
      categoryId: ticket?.categoryId || '',
      priorityId: ticket?.priorityId || '',
      statusId: ticket?.statusId || '',
      departmentId: ticket?.departmentId || '',
      teamId: ticket?.teamId || '',
      assignedToId: ticket?.assignedToId || '',
    },
  });

  const watchedDepartment = watch('departmentId');
  const watchedTeam = watch('teamId');

  // Update selected department when form value changes
  useEffect(() => {
    if (watchedDepartment && watchedDepartment !== selectedDepartment) {
      setSelectedDepartment(parseInt(watchedDepartment));
      if (!isEdit) { // Only reset on create, not edit
        setValue('teamId', '');
        setValue('assignedToId', '');
      }
    }
  }, [watchedDepartment, selectedDepartment, setValue, isEdit]);

  // Update selected team when form value changes
  useEffect(() => {
    if (watchedTeam !== selectedTeam) {
      setSelectedTeam(watchedTeam ? parseInt(watchedTeam) : null);
      if (!isEdit && watchedTeam !== ticket?.teamId) { // Only reset on create or when actually changing
        setValue('assignedToId', '');
      }
    }
  }, [watchedTeam, selectedTeam, setValue, isEdit, ticket?.teamId]);

  const mutation = useMutation({
    mutationFn: (data) => {
      console.log('Submitting ticket data:', data); // Debug log
      
      const cleanData = {
        ...data,
        teamId: data.teamId || undefined,
        assignedToId: data.assignedToId || undefined,
      };
      
      return isEdit 
        ? ticketsAPI.update(ticket.id, cleanData)
        : ticketsAPI.create(cleanData);
    },
    onSuccess: (response) => {
      console.log('Ticket operation successful:', response); // Debug log
      
      // Invalidate and refetch all ticket-related queries
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'active-count'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'assigned', user?.id] });
      
      // If editing, also invalidate the specific ticket query
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] });
        queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticket.id] });
      }
      
      showSuccess(isEdit ? 'Ticket updated successfully!' : 'Ticket created successfully!');
      navigate(`/tickets/${response.data.id}`);
    },
    onError: (error) => {
      console.error('Ticket operation failed:', error); // Debug log
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} ticket`);
    },
  });

  const onSubmit = (data) => {
    console.log('Form submitted with data:', data); // Debug log
    mutation.mutate(data);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(isEdit ? `/tickets/${ticket.id}` : '/tickets')}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight="bold">
          {isEdit ? `Edit Ticket #${ticket.id}` : 'Create New Ticket'}
        </Typography>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Error Alert */}
            {mutation.error && (
              <Alert severity="error">
                {mutation.error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} ticket`}
              </Alert>
            )}

            {/* Basic Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                
                <Stack spacing={2}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Title"
                        fullWidth
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        placeholder="Brief description of the issue or request"
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
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        placeholder="Detailed description of the issue, steps to reproduce, expected outcome, etc."
                      />
                    )}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Categorization */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Categorization
                </Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.categoryId}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          {...field}
                          label="Category"
                          value={field.value || ''}
                        >
                          {categories?.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.categoryId && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {errors.categoryId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />

                  <Controller
                    name="priorityId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.priorityId}>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          {...field}
                          label="Priority"
                          value={field.value || ''}
                        >
                          {priorities?.map((priority) => (
                            <MenuItem key={priority.id} value={priority.id}>
                              {priority.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.priorityId && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {errors.priorityId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />

                  {isEdit && (
                    <Controller
                      name="statusId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select
                            {...field}
                            label="Status"
                            value={field.value || ''}
                          >
                            {statuses?.map((status) => (
                              <MenuItem key={status.id} value={status.id}>
                                {status.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Assignment */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assignment
                </Typography>
                
                <Stack spacing={2}>
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
                          {departments?.map((department) => (
                            <MenuItem key={department.id} value={department.id}>
                              {department.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.departmentId && (
                          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                            {errors.departmentId.message}
                          </Typography>
                        )}
                      </FormControl>
                    )}
                  />

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Controller
                      name="teamId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth disabled={!selectedDepartment}>
                          <InputLabel>Team (Optional)</InputLabel>
                          <Select
                            {...field}
                            label="Team (Optional)"
                            value={field.value || ''}
                          >
                            <MenuItem value="">No specific team</MenuItem>
                            {teams?.map((team) => (
                              <MenuItem key={team.id} value={team.id}>
                                {team.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />

                    <Controller
                      name="assignedToId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth disabled={!selectedDepartment}>
                          <InputLabel>Assign to (Optional)</InputLabel>
                          <Select
                            {...field}
                            label="Assign to (Optional)"
                            value={field.value || ''}
                          >
                            <MenuItem value="">Unassigned</MenuItem>
                            {users?.map((assignUser) => (
                              <MenuItem key={assignUser.id} value={assignUser.id}>
                                {assignUser.firstName} {assignUser.lastName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(isEdit ? `/tickets/${ticket.id}` : '/tickets')}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isEdit ? <Save /> : <Send />}
                disabled={mutation.isPending}
              >
                {mutation.isPending 
                  ? (isEdit ? 'Updating...' : 'Creating...') 
                  : (isEdit ? 'Update Ticket' : 'Create Ticket')
                }
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default TicketForm;