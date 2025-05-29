import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from '@mui/material';
import {
  Add,
  Edit,
  PersonOff,
  Email,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { usersAPI } from '../../services/api';

const Users = () => {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(res => res.data),
  });

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
            Manage system users and their roles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {/* TODO: Implement */}}
        >
          Add User
        </Button>
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
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar>
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
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.userRoles?.map((role, index) => (
                        <Chip
                          key={index}
                          label={role.roleName}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
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
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => {/* TODO */}}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => {/* TODO */}}>
                        <Email fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => {/* TODO */}}>
                        <PersonOff fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Users;