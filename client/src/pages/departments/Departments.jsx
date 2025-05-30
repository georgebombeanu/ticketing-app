import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
  Business,
  People,
  Groups,
  MoreVert,
  Delete,
  RestoreFromTrash,
  OpenInNew,
  Timeline,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { departmentsAPI, usersAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import useAuthStore from '../../store/authStore';
import DepartmentModal from '../../components/departments/DepartmentModal';

const Departments = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { isManager } = useAuthStore();

  // Modal states
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [departmentDetailsOpen, setDepartmentDetailsOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, department: null });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuDepartment, setMenuDepartment] = useState(null);

  const { data: departments, isLoading, error } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await departmentsAPI.getAll();
      return response.data;
    },
  });

  // Fetch user counts for each department
  const { data: departmentUserCounts } = useQuery({
    queryKey: ['departments', 'user-counts'],
    queryFn: async () => {
      if (!departments) return {};
      
      const counts = {};
      await Promise.all(
        departments.map(async (dept) => {
          try {
            const users = await usersAPI.getByDepartment(dept.id);
            counts[dept.id] = users.data.length;
          } catch (error) {
            counts[dept.id] = 0;
          }
        })
      );
      return counts;
    },
    enabled: !!departments,
  });

  // Delete department mutation (deactivates)
  const deleteMutation = useMutation({
    mutationFn: (departmentId) => departmentsAPI.deactivate(departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      showSuccess('Department deleted successfully');
      setConfirmDialog({ open: false, department: null });
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete department');
    },
  });

  const handleCreateDepartment = () => {
    setSelectedDepartment(null);
    setDepartmentModalOpen(true);
  };

  const handleEditDepartment = (department) => {
    setSelectedDepartment(department);
    setDepartmentModalOpen(true);
    setMenuAnchor(null);
  };

  const handleViewDetails = async (department) => {
    try {
      // Fetch detailed department information
      const detailsResponse = await departmentsAPI.getDetails(department.id);
      setSelectedDepartment(detailsResponse.data);
      setDepartmentDetailsOpen(true);
    } catch (error) {
      showError('Failed to load department details');
    }
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event, department) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuDepartment(department);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuDepartment(null);
  };

  const handleDeleteDepartment = (department) => {
    setConfirmDialog({
      open: true,
      department,
    });
    setMenuAnchor(null);
  };

  const executeDelete = () => {
    if (confirmDialog.department) {
      deleteMutation.mutate(confirmDialog.department.id);
    }
  };

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
            Manage organizational departments and teams ({departments?.length || 0} total)
          </Typography>
        </Box>
        {isManager() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateDepartment}
          >
            Add Department
          </Button>
        )}
      </Box>

      {/* Departments Grid */}
      <Grid container spacing={3}>
        {departments?.map((department) => (
          <Grid item xs={12} md={6} lg={4} key={department.id}>
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
              onClick={() => handleViewDetails(department)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Business color="primary" />
                    <Typography variant="h6" fontWeight="bold" noWrap>
                      {department.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={department.isActive ? 'Active' : 'Inactive'}
                      color={department.isActive ? 'success' : 'default'}
                      size="small"
                    />
                    {isManager() && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, department);
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
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
                  {department.description || 'No description available'}
                </Typography>

                <Stack spacing={2}>
                  {/* Stats */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Groups fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {department.teams?.length || 0} teams
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {departmentUserCounts?.[department.id] || 0} users
                      </Typography>
                    </Box>
                  </Box>

                  {/* Teams Preview */}
                  {department.teams && department.teams.length > 0 && (
                    <Box>
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
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {department.teams.length > 3 && (
                          <Chip
                            label={`+${department.teams.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  <Divider />

                  {/* Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Created {format(new Date(department.createdAt), 'MMM yyyy')}
                    </Typography>
                    <Tooltip title="View Details">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(department);
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
            {isManager() && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateDepartment}
              >
                Create Department
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
        <MenuItem onClick={() => handleViewDetails(menuDepartment)}>
          <ListItemIcon>
            <Timeline fontSize="small" />
          </ListItemIcon>
          View Details
        </MenuItem>
        
        <MenuItem onClick={() => handleEditDepartment(menuDepartment)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Department
        </MenuItem>
        
        {menuDepartment?.isActive ? (
          <MenuItem 
            onClick={() => handleDeleteDepartment(menuDepartment)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Delete Department
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={() => handleEditDepartment(menuDepartment)}
            sx={{ color: 'success.main' }}
          >
            <ListItemIcon>
              <RestoreFromTrash fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            Reactivate
          </MenuItem>
        )}
      </Menu>

      {/* Department Modal */}
      <DepartmentModal
        open={departmentModalOpen}
        onClose={() => setDepartmentModalOpen(false)}
        department={selectedDepartment}
      />

      {/* Department Details Modal */}
      <Dialog 
        open={departmentDetailsOpen} 
        onClose={() => setDepartmentDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Department Details: {selectedDepartment?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDepartment && (
            <Stack spacing={3}>
              {/* Basic Info */}
              <Box>
                <Typography variant="h6" gutterBottom>Basic Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{selectedDepartment.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip 
                      label={selectedDepartment.isActive ? 'Active' : 'Inactive'} 
                      color={selectedDepartment.isActive ? 'success' : 'default'} 
                      size="small" 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body1">
                      {selectedDepartment.description || 'No description provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Created</Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedDepartment.createdAt), 'PPP')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Active Tickets</Typography>
                    <Typography variant="body1">
                      {selectedDepartment.activeTicketsCount || 0}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Teams */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Teams ({selectedDepartment.teams?.length || 0})
                </Typography>
                {selectedDepartment.teams && selectedDepartment.teams.length > 0 ? (
                  <Grid container spacing={1}>
                    {selectedDepartment.teams.map((team) => (
                      <Grid item key={team.id}>
                        <Chip
                          label={team.name}
                          variant="outlined"
                          color="primary"
                          icon={<Groups />}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No teams assigned to this department
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Users */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Users ({selectedDepartment.users?.length || 0})
                </Typography>
                {selectedDepartment.users && selectedDepartment.users.length > 0 ? (
                  <Grid container spacing={2}>
                    {selectedDepartment.users.map((user) => (
                      <Grid item xs={12} sm={6} key={user.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People fontSize="small" color="action" />
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
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No users assigned to this department
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
                setDepartmentDetailsOpen(false);
                handleEditDepartment(selectedDepartment);
              }}
              startIcon={<Edit />}
            >
              Edit Department
            </Button>
          )}
          <Button onClick={() => setDepartmentDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, department: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete department{' '}
            <strong>{confirmDialog.department?.name}</strong>?
            <Box component="span" sx={{ color: 'warning.main', display: 'block', mt: 1 }}>
              This will deactivate the department and may affect associated teams and users.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, department: null })}>
            Cancel
          </Button>
          <Button 
            onClick={executeDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Department'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Departments;