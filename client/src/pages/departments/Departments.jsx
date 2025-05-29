import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import {
  Add,
  Edit,
  Business,
  People,
  Groups,
  ConfirmationNumber,
} from '@mui/icons-material';
import { departmentsAPI } from '../../services/api';

const Departments = () => {
  const { data: departments, isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsAPI.getAll().then(res => res.data),
  });

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load departments</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Departments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage organizational departments and teams
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* TODO: Implement */}}
        >
          Add Department
        </Button>
      </Box>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {departments?.map((department) => (
          <Grid item xs={12} md={6} lg={4} key={department.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {department.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={department.isActive ? 'Active' : 'Inactive'}
                      color={department.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <IconButton size="small" onClick={() => {/* TODO */}}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {department.description || 'No description available'}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Groups fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {department.teams?.length || 0} teams
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {department.userRoles?.length || 0} users
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Team avatars preview */}
                {department.teams && department.teams.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Teams:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {department.teams.slice(0, 3).map((team) => (
                        <Chip
                          key={team.id}
                          label={team.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {department.teams.length > 3 && (
                        <Chip
                          label={`+${department.teams.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {(!departments || departments.length === 0) && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Business sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No departments found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first department to organize your teams and users.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {/* TODO */}}
            >
              Create Department
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Departments;