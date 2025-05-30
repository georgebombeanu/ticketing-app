import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Email,
  MoreVert,
  Delete,
  RestoreFromTrash,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { usersAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import useAuthStore from '../../store/authStore';
import UserModal from '../../components/users/UserModal';

const Users = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { user: currentUser, isAdmin } = useAuthStore();

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: null });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuUser, setMenuUser] = useState(null);

  // Available roles - in a real app, this would come from an API
  const roles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Manager' },
    { id: 3, name: 'Agent' },
    { id: 4, name: 'User' },
  ];

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(res => res.data),
  });

  // Delete user mutation (actually deactivates the user)
  const deleteMutation = useMutation({
    mutationFn: (userId) => usersAPI.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('User deleted successfully');
      setConfirmDialog({ open: false, user: null, action: null });
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event, user) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuUser(null);
  };

  const handleDeleteUser = (user) => {
    setConfirmDialog({
      open: true,
      user,
      action: 'delete',
    });
    setMenuAnchor(null);
  };

  const handleEmailUser = (user) => {
    window.location.href = `mailto:${user.email}`;
    setMenuAnchor(null);
  };

  const executeAction = () => {
    const { user, action } = confirmDialog;
    
    if (action === 'delete') {
      deleteMutation.mutate(user.id);
    }
  };

  const canManageUser = (user) => {
    // Admin can manage anyone except themselves
    // Manager can manage users with lower roles
    if (!currentUser || !isAdmin()) return false;
    if (user?.id === currentUser.id) return false;
    return true;
  };

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load users</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Users
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system users and their roles ({users?.length || 0} total)
          </Typography>
        </Box>
        {isAdmin() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        )}
      </Box>

      {/* Users Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: user.isActive ? 'primary.main' : 'grey.400' }}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.userRoles?.map((role, index) => (
                        <Chip
                          key={index}
                          label={role.roleName}
                          size="small"
                          variant="outlined"
                          color={
                            role.roleName === 'Admin' ? 'error' :
                            role.roleName === 'Manager' ? 'warning' :
                            role.roleName === 'Agent' ? 'info' : 'default'
                          }
                        />
                      ))}
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {user.userRoles?.[0]?.departmentName || 'Not assigned'}
                    </Typography>
                    {user.userRoles?.[0]?.teamName && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Team: {user.userRoles[0].teamName}
                      </Typography>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.lastLogin 
                        ? format(new Date(user.lastLogin), 'MMM dd, yyyy')
                        : 'Never'
                      }
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {isAdmin() && canManageUser(user) && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, user)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {(!users || users.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No users found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add your first user to get started.
            </Typography>
            {isAdmin() && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateUser}
              >
                Add First User
              </Button>
            )}
          </Box>
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { minWidth: 180 } }}
      >
        <MenuItem onClick={() => handleEditUser(menuUser)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit User
        </MenuItem>
        
        <MenuItem onClick={() => handleEmailUser(menuUser)}>
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          Send Email
        </MenuItem>
        
        {canManageUser(menuUser) && (
          <>
            {menuUser?.isActive ? (
              <MenuItem 
                onClick={() => handleDeleteUser(menuUser)}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon>
                  <Delete fontSize="small" sx={{ color: 'error.main' }} />
                </ListItemIcon>
                Delete User
              </MenuItem>
            ) : (
              <MenuItem 
                onClick={() => handleEditUser(menuUser)}
                sx={{ color: 'success.main' }}
              >
                <ListItemIcon>
                  <RestoreFromTrash fontSize="small" sx={{ color: 'success.main' }} />
                </ListItemIcon>
                Reactivate
              </MenuItem>
            )}
          </>
        )}
      </Menu>

      {/* User Modal */}
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        user={selectedUser}
        roles={roles}
      />

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, user: null, action: null })}>
        <DialogTitle>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete user{' '}
            <strong>{confirmDialog.user?.firstName} {confirmDialog.user?.lastName}</strong>?
            <Box component="span" sx={{ color: 'warning.main', display: 'block', mt: 1 }}>
              This will deactivate the user account.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ open: false, user: null, action: null })}
          >
            Cancel
          </Button>
          <Button 
            onClick={executeAction}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;