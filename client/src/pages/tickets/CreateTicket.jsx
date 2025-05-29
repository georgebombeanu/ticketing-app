import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  Divider,
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
} from '../../services/api';
import useAuthStore from '../../store/authStore';

// Validation schema
const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  categoryId: z.number().min(1, 'Category is required'),
  priorityId: z.number().min(1, 'Priority is required'),
  departmentId: z.number().min(1, 'Department is required'),
  teamId: z.number().optional().nullable(),
  assignedToId: z.number().optional().nullable(),
});

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Fetch options data
  const { data: categories } = useQuery({
    queryKey: ['ticket-categories', 'active'],
    queryFn: () => ticketCategoriesAPI.getActive().then(res => res.data),
  });

  const { data: priorities } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => ticketPrioritiesAPI.getAll().then(res => res.data),
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
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      priorityId: '',
      departmentId: '',
      teamId: null,
      assignedToId: null,
    },
  });

  const watchedDepartment = watch('departmentId');
  const watchedTeam = watch('teamId');

  // Update selected department when form value changes
  React.useEffect(() => {
    if (watchedDepartment && watchedDepartment !== selectedDepartment) {
      setSelectedDepartment(watchedDepartment);
      setValue('teamId', null);
      setValue('assignedToId', null);
      setSelectedTeam(null);
    }
  }, [watchedDepartment, selectedDepartment, setValue]);

  // Update selected team when form value changes
  React.useEffect(() => {
    if (watchedTeam && watchedTeam !== selectedTeam) {
      setSelectedTeam(watchedTeam);
      setValue('assignedToId', null);
    } else if (!watchedTeam && selectedTeam) {
      setSelectedTeam(null);
    }
  }, [watchedTeam, selectedTeam, setValue]);

  const createTicketMutation = useMutation({
    mutationFn: (data) => ticketsAPI.create(data),
    onSuccess: (response) => {
      navigate(`/tickets/${response.data.id}`);
    },
  });

  const onSubmit = (data) => {
    // Clean up null values
    const cleanData = {
      ...data,
      teamId: data.teamId || undefined,
      assignedToId: data.assignedToId || undefined,
    };
    createTicketMutation.mutate(cleanData);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/tickets')}
          variant="outlined"
        >
          Back to Tickets
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Create New Ticket
        </Typography>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Error Alert */}
            {createTicketMutation.error && (
              <Alert severity="error">
                {createTicketMutation.error.response?.data?.message || 'Failed to create ticket'}
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
                onClick={() => navigate('/tickets')}
                disabled={createTicketMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Send />}
                disabled={createTicketMutation.isPending}
              >
                {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateTicket;