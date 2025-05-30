import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Groups,
  People,
  Business,
  MoreVert,
  Delete,
  RestoreFromTrash,
  OpenInNew,
  Timeline,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { teamsAPI, usersAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import useAuthStore from '../../store/authStore';
import TeamModal from '../../components/teams/TeamModal';

const Teams = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { isManager } = useAuthStore();

  // Modal states
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [teamDetailsOpen, setTeamDetailsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, team: null });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuTeam, setMenuTeam] = useState(null);

  const { data: teams, isLoading, error } = useQuery({
    queryKey: ['teams'],
    queryFn: () => teamsAPI.getAll().then(res => res.data),
  });

  // Fetch user counts for each team
  const { data: teamUserCounts } = useQuery({
    queryKey: ['teams', 'user-counts'],
    queryFn: async () => {
      if (!teams) return {};
      
      const counts = {};
      await Promise.all(
        teams.map(async (team) => {
          try {
            const users = await usersAPI.getByTeam(team.id);
            counts[team.id] = users.data.length;
          } catch (error) {
            counts[team.id] = 0;
          }
        })
      );
      return counts;
    },
    enabled: !!teams,
  });

  // Delete team mutation (deactivates)
  const deleteMutation = useMutation({
    mutationFn: (teamId) => teamsAPI.deactivate(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] }); // Refresh departments too
      showSuccess('Team deleted successfully');
      setConfirmDialog({ open: false, team: null });
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete team');
    },
  });

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setTeamModalOpen(true);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setTeamModalOpen(true);
    setMenuAnchor(null);
  };

  const handleViewDetails = async (team) => {
    try {
      // Fetch detailed team information
      const detailsResponse = await teamsAPI.getDetails(team.id);
      setSelectedTeam(detailsResponse.data);
      setTeamDetailsOpen(true);
    } catch (error) {
      showError('Failed to load team details');
    }
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event, team) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuTeam(team);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuTeam(null);
  };

  const handleDeleteTeam = (team) => {
    setConfirmDialog({
      open: true,
      team,
    });
    setMenuAnchor(null);
  };

  const executeDelete = () => {
    if (confirmDialog.team) {
      deleteMutation.mutate(confirmDialog.team.id);
    }
  };

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
            Manage teams within departments ({teams?.length || 0} total)
          </Typography>
        </Box>
        {isManager() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateTeam}
          >
            Add Team
          </Button>
        )}
      </Box>

      {/* Teams Grid */}
      <Grid container spacing={3}>
        {teams?.map((team) => (
          <Grid item xs={12} md={6} lg={4} key={team.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                },
              }}
              onClick={() => handleViewDetails(team)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Groups color="primary" />
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {team.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={team.isActive ? 'Active' : 'Inactive'}
                      color={team.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    {isManager() && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, team);
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Business fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {team.departmentName}
                  </Typography>
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3, 
                    minHeight: 40,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {team.description || 'No description available'}
                </Typography>

                <Stack spacing={2}>
                  {/* Stats */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {teamUserCounts?.[team.id] || 0} members
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
                      <AvatarGroup max={4} sx={{ mt: 1, justifyContent: 'flex-start' }}>
                        {team.userRoles.map((userRole, index) => (
                          <Avatar key={index} sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                            {userRole.userName?.split(' ').map(n => n[0]).join('') || '?'}
                          </Avatar>
                        ))}
                      </AvatarGroup>
                    </Box>
                  )}

                  <Divider />

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(team);
                        }}
                      >
                        <OpenInNew fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
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
            {isManager() && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateTeam}
              >
                Create Team
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 180 } }}
      >
        <MenuItem onClick={() => handleViewDetails(menuTeam)}>
          <ListItemIcon>
            <Timeline fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        
        <MenuItem onClick={() => handleEditTeam(menuTeam)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Team
        </MenuItem>
        
        {menuTeam?.isActive ? (
          <MenuItem 
            onClick={() => handleDeleteTeam(menuTeam)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Delete Team
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={() => handleEditTeam(menuTeam)}
            sx={{ color: 'success.main' }}
          >
            <ListItemIcon>
              <RestoreFromTrash fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            Reactivate
          </MenuItem>
        )}
      </Menu>

      {/* Team Modal */}
      <TeamModal
        open={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        team={selectedTeam}
      />

      {/* Team Details Modal */}
      <Dialog 
        open={teamDetailsOpen} 
        onClose={() => setTeamDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Groups color="primary" />
            Team Details: {selectedTeam?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTeam && (
            <Stack spacing={3}>
              {/* Basic Info */}
              <Box>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{selectedTeam.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedTeam.isActive ? 'Active' : 'Inactive'} 
                      color={selectedTeam.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Department</Typography>
                    <Typography variant="body1">{selectedTeam.departmentName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Active Tickets</Typography>
                    <Typography variant="body1">
                      {selectedTeam.activeTicketsCount || 0}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">
                      {selectedTeam.description || 'No description provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Created</Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedTeam.createdAt), 'PPP')}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Members */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Team Members ({selectedTeam.users?.length || 0})
                </Typography>
                {selectedTeam.users && selectedTeam.users.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedTeam.users.map((user) => (
                      <Grid item xs={12} sm={6} key={user.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {user.firstName} {user.lastName}
                            </Typography>
                            {user.userRoles && user.userRoles.length > 0 && (
                              <Chip 
                                label={user.userRoles[0].roleName || user.userRoles[0].role?.name || 'User'} 
                                size="small" 
                                variant="outlined" 
                              />
                            )}
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No members assigned to this team
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {isManager() && (
            <Button 
              onClick={() => {
                setTeamDetailsOpen(false);
                handleEditTeam(selectedTeam);
              }}
              startIcon={<Edit />}
            >
              Edit Team
            </Button>
          )}
          <Button onClick={() => setTeamDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, team: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete team{' '}
            <strong>{confirmDialog.team?.name}</strong>?
            <Box component="span" sx={{ color: 'warning.main', display: 'block', mt: 1 }}>
              This will deactivate the team and may affect associated users and tickets.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, team: null })}>
            Cancel
          </Button>
          <Button 
            onClick={executeDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Team'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teams;