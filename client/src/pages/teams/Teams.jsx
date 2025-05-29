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
  Groups,
  People,
  Business,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { teamsAPI } from '../../services/api';

const Teams = () => {
  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsAPI.getAll().then(res => res.data),
  });

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load teams</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Teams
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage teams within departments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* TODO: Implement */}}
        >
          Add Team
        </Button>
      </Box>

      {/* Teams Grid */}
      <Grid container spacing={3}>
        {teams?.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Groups color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {team.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Chip
                      label={team.isActive ? 'Active' : 'Inactive'}
                      color={team.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    <IconButton size="small" onClick={() => {/* TODO */}}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Business fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {team.departmentName}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {team.description || 'No description available'}
                </Typography>

                <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {team.userRoles?.length || 0} members
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Created {format(new Date(team.createdAt), 'MMM yyyy')}
                  </Typography>
                </Box>

                {/* Member avatars */}
                {team.userRoles && team.userRoles.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Members:
                    </Typography>
                    <AvatarGroup max={4} sx={{ mt: 1 }}>
                      {team.userRoles.map((userRole, index) => (
                        <Avatar key={index} sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {userRole.userName?.split(' ').map(n => n[0]).join('') || '?'}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {(!teams || teams.length === 0) && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Groups sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No teams found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first team to organize users within departments.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {/* TODO */}}
            >
              Create Team
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Teams;