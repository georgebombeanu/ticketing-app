import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Paper,
  Grid,
} from '@mui/material';
import {
  Notifications,
  Security,
  Palette,
  Language,
  Email,
  Save,
  RestoreRounded,
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

const Settings = () => {
  const { mode, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useToast();

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    ticketAssigned: true,
    ticketUpdated: true,
    ticketCommented: true,
    systemMaintenance: true,
  });

  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    itemsPerPage: 25,
    defaultView: 'table',
    showClosedTickets: false,
    autoRefresh: true,
    refreshInterval: 30,
  });

  const handleNotificationChange = (key) => (event) => {
    setNotifications(prev => ({
      ...prev,
      [key]: event.target.checked
    }));
  };

  const handleDisplayChange = (key) => (event) => {
    setDisplaySettings(prev => ({
      ...prev,
      [key]: event.target.value
    }));
  };

  const saveSettings = () => {
    // In real implementation, save to backend
    showSuccess('Settings saved successfully!');
  };

  const resetSettings = () => {
    setNotifications({
      emailNotifications: true,
      pushNotifications: true,
      ticketAssigned: true,
      ticketUpdated: true,
      ticketCommented: true,
      systemMaintenance: true,
    });
    setDisplaySettings({
      itemsPerPage: 25,
      defaultView: 'table',
      showClosedTickets: false,
      autoRefresh: true,
      refreshInterval: 30,
    });
    showSuccess('Settings reset to defaults!');
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize your experience and manage your preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Palette color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Appearance
                </Typography>
              </Box>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={mode === 'dark'}
                      onChange={toggleTheme}
                    />
                  }
                  label="Dark Mode"
                />
                
                <FormControl fullWidth>
                  <InputLabel>Default View</InputLabel>
                  <Select
                    value={displaySettings.defaultView}
                    label="Default View"
                    onChange={handleDisplayChange('defaultView')}
                  >
                    <MenuItem value="table">Table View</MenuItem>
                    <MenuItem value="cards">Card View</MenuItem>
                    <MenuItem value="kanban">Kanban Board</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Items Per Page</InputLabel>
                  <Select
                    value={displaySettings.itemsPerPage}
                    label="Items Per Page"
                    onChange={handleDisplayChange('itemsPerPage')}
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={displaySettings.showClosedTickets}
                      onChange={(e) => setDisplaySettings(prev => ({
                        ...prev,
                        showClosedTickets: e.target.checked
                      }))}
                    />
                  }
                  label="Show Closed Tickets by Default"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Notifications color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.emailNotifications}
                      onChange={handleNotificationChange('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.pushNotifications}
                      onChange={handleNotificationChange('pushNotifications')}
                    />
                  }
                  label="Push Notifications"
                />

                <Divider />
                
                <Typography variant="subtitle2" color="text.secondary">
                  Ticket Notifications
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.ticketAssigned}
                      onChange={handleNotificationChange('ticketAssigned')}
                    />
                  }
                  label="When assigned to me"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.ticketUpdated}
                      onChange={handleNotificationChange('ticketUpdated')}
                    />
                  }
                  label="When my tickets are updated"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.ticketCommented}
                      onChange={handleNotificationChange('ticketCommented')}
                    />
                  }
                  label="When tickets receive comments"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.systemMaintenance}
                      onChange={handleNotificationChange('systemMaintenance')}
                    />
                  }
                  label="System maintenance alerts"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Auto-refresh Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Auto-refresh Settings
              </Typography>

              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={displaySettings.autoRefresh}
                      onChange={(e) => setDisplaySettings(prev => ({
                        ...prev,
                        autoRefresh: e.target.checked
                      }))}
                    />
                  }
                  label="Auto-refresh ticket lists"
                />

                {displaySettings.autoRefresh && (
                  <FormControl fullWidth>
                    <InputLabel>Refresh Interval</InputLabel>
                    <Select
                      value={displaySettings.refreshInterval}
                      label="Refresh Interval"
                      onChange={handleDisplayChange('refreshInterval')}
                    >
                      <MenuItem value={15}>15 seconds</MenuItem>
                      <MenuItem value={30}>30 seconds</MenuItem>
                      <MenuItem value={60}>1 minute</MenuItem>
                      <MenuItem value={300}>5 minutes</MenuItem>
                      <MenuItem value={600}>10 minutes</MenuItem>
                    </Select>
                  </FormControl>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Security color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Account Summary
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2">
                    {user?.email}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Roles
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {user?.userRoles?.map((role, index) => (
                      <Chip
                        key={index}
                        label={role.roleName}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body2">
                    {user?.userRoles?.[0]?.departmentName || 'Not assigned'}
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={() => window.location.href = '/profile'}
                >
                  Update Profile
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Data & Privacy */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Data & Privacy
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                Your data is secure and handled according to our privacy policy. 
                You can request data export or account deletion by contacting support.
              </Alert>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined">
                  Export My Data
                </Button>
                <Button variant="outlined" color="error">
                  Delete Account
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                startIcon={<RestoreRounded />}
                onClick={resetSettings}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={saveSettings}
              >
                Save Settings
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;