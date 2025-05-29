import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  Divider,
  Grid,
  Chip,
  Alert,
  Stack,
  Paper,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Lock,
  Person,
  Email,
  CalendarToday,
  Badge,
} from '@mui/icons-material';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';
import { usersAPI, authAPI } from '../../services/api';

// Validation schemas
const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Profile = () => {
  const { user, setUser } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => usersAPI.update(user.id, data),
    onSuccess: (response) => {
      setUser(response.data);
      showSuccess('Profile updated successfully!');
      setEditingProfile(false);
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => {
      showSuccess('Password changed successfully!');
      setChangingPassword(false);
      passwordForm.reset();
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to change password');
    },
  });

  const onProfileSubmit = (data) => {
    // Prepare update data (only the fields that can be updated)
    const updateData = {
      firstName: data.firstName,
      lastName: data.lastName,
      isActive: user.isActive, // Keep current status
      userRoles: user.userRoles, // Keep existing roles
    };
    updateProfileMutation.mutate(updateData);
  };

  const onPasswordSubmit = (data) => {
    const passwordData = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    };
    changePasswordMutation.mutate(passwordData);
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your account settings and preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Profile Information
                </Typography>
                {!editingProfile ? (
                  <Button
                    startIcon={<Edit />}
                    onClick={() => setEditingProfile(true)}
                    variant="outlined"
                  >
                    Edit Profile
                  </Button>
                ) : (
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<Save />}
                        onClick={profileForm.handleSubmit(onProfileSubmit)}
                        variant="contained"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        onClick={() => {
                          setEditingProfile(false);
                          profileForm.reset();
                        }}
                        variant="outlined"
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>

                {editingProfile ? (
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <Stack spacing={2}>
                      <TextField
                        label="First Name"
                        {...profileForm.register('firstName')}
                        error={!!profileForm.formState.errors.firstName}
                        helperText={profileForm.formState.errors.firstName?.message}
                        fullWidth
                      />
                      <TextField
                        label="Last Name"
                        {...profileForm.register('lastName')}
                        error={!!profileForm.formState.errors.lastName}
                        helperText={profileForm.formState.errors.lastName?.message}
                        fullWidth
                      />
                      <TextField
                        label="Email"
                        type="email"
                        {...profileForm.register('email')}
                        error={!!profileForm.formState.errors.email}
                        helperText={profileForm.formState.errors.email?.message}
                        fullWidth
                      />
                    </Stack>
                  </form>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        First Name
                      </Typography>
                      <Typography variant="body1">
                        {user?.firstName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Name
                      </Typography>
                      <Typography variant="body1">
                        {user?.lastName}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1">
                        {user?.email}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Change Password
                  </Typography>
                  {!changingPassword ? (
                    <Button
                      startIcon={<Lock />}
                      onClick={() => setChangingPassword(true)}
                      variant="outlined"
                    >
                      Change Password
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        startIcon={<Save />}
                        onClick={passwordForm.handleSubmit(onPasswordSubmit)}
                        variant="contained"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        onClick={() => {
                          setChangingPassword(false);
                          passwordForm.reset();
                        }}
                        variant="outlined"
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>

                {changingPassword ? (
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                    <Stack spacing={2}>
                      <TextField
                        label="Current Password"
                        type="password"
                        {...passwordForm.register('currentPassword')}
                        error={!!passwordForm.formState.errors.currentPassword}
                        helperText={passwordForm.formState.errors.currentPassword?.message}
                        fullWidth
                      />
                      <TextField
                        label="New Password"
                        type="password"
                        {...passwordForm.register('newPassword')}
                        error={!!passwordForm.formState.errors.newPassword}
                        helperText={passwordForm.formState.errors.newPassword?.message}
                        fullWidth
                      />
                      <TextField
                        label="Confirm New Password"
                        type="password"
                        {...passwordForm.register('confirmPassword')}
                        error={!!passwordForm.formState.errors.confirmPassword}
                        helperText={passwordForm.formState.errors.confirmPassword?.message}
                        fullWidth
                      />
                    </Stack>
                  </form>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Keep your account secure by using a strong password and changing it regularly.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {user?.email}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* User Details */}
                <Stack spacing={2} sx={{ textAlign: 'left' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      User ID: {user?.id}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Joined: {user?.createdAt && format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>

                  {user?.lastLogin && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Last login: {format(new Date(user.lastLogin), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  )}

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Badge fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Roles:
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {user?.userRoles?.map((role, index) => (
                        <Chip
                          key={index}
                          label={role.roleName}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>

                  {user?.userRoles?.[0]?.departmentName && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Department: {user.userRoles[0].departmentName}
                      </Typography>
                      {user.userRoles[0].teamName && (
                        <Typography variant="body2" color="text.secondary">
                          Team: {user.userRoles[0].teamName}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
              <Typography variant="body2" fontWeight="medium">
                ✓ Account Active
              </Typography>
              <Typography variant="caption">
                Your account is in good standing
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  export default Profile;