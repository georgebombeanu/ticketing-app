import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  OpenInNew,
  Assignment,
  Clear,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ticketsAPI, ticketCategoriesAPI, ticketPrioritiesAPI, ticketStatusesAPI } from '../../services/api';
import { priorityColors, statusColors } from '../../theme/theme';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';

const Tickets = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAgent } = useAuthStore();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '');
  const [assignedFilter, setAssignedFilter] = useState(searchParams.get('assigned') || '');

  // Fetch data
  const { data: tickets, isLoading: ticketsLoading, error } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => ticketsAPI.getAll().then(res => res.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['ticket-categories'],
    queryFn: () => ticketCategoriesAPI.getActive().then(res => res.data),
  });

  const { data: priorities } = useQuery({
    queryKey: ['ticket-priorities'],
    queryFn: () => ticketPrioritiesAPI.getAll().then(res => res.data),
  });

  const { data: statuses } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusesAPI.getAll().then(res => res.data),
  });

  // Assign to me mutation
  const assignToMeMutation = useMutation({
    mutationFn: (ticketId) => ticketsAPI.assign(ticketId, user.id),
    onSuccess: () => {
      // Refresh tickets data
      queryClient.invalidateQueries(['tickets']);
      showSuccess('Ticket assigned to you successfully!');
    },
    onError: (error) => {
      console.error('Failed to assign ticket:', error);
      showError('Failed to assign ticket. Please try again.');
    },
  });

  // Filter tickets
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets.filter(ticket => {
      const matchesSearch = !searchTerm || 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toString().includes(searchTerm);

      const matchesStatus = !statusFilter || 
        ticket.statusName.toLowerCase() === statusFilter.toLowerCase();

      const matchesPriority = !priorityFilter || 
        ticket.priorityName.toLowerCase() === priorityFilter.toLowerCase();

      const matchesCategory = !categoryFilter || 
        ticket.categoryName.toLowerCase() === categoryFilter.toLowerCase();

      const matchesAssigned = !assignedFilter || 
        (assignedFilter === 'me' && ticket.assignedToId === user?.id) ||
        (assignedFilter === 'unassigned' && !ticket.assignedToId) ||
        (assignedFilter !== 'me' && assignedFilter !== 'unassigned' && 
         ticket.assignedToName?.toLowerCase().includes(assignedFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssigned;
    });
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter, assignedFilter, user?.id]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
    setAssignedFilter('');
    setSearchParams({});
  };

  const PriorityChip = ({ priority }) => {
    const colors = priorityColors[priority.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    return (
      <Chip
        label={priority}
        size="small"
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      />
    );
  };

  const StatusChip = ({ status }) => {
    const colors = statusColors[status.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    return (
      <Chip
        label={status}
        size="small"
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
          fontSize: '0.75rem',
        }}
      />
    );
  };

  if (ticketsLoading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load tickets. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filteredTickets.length} of {tickets?.length || 0} tickets
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tickets/create')}
        >
          New Ticket
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList fontSize="small" />
            <Typography variant="h6">Filters</Typography>
            {(searchTerm || statusFilter || priorityFilter || categoryFilter || assignedFilter) && (
              <Button
                size="small"
                startIcon={<Clear />}
                onClick={clearFilters}
                sx={{ ml: 'auto' }}
              >
                Clear All
              </Button>
            )}
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                {statuses?.map(status => (
                  <MenuItem key={status.id} value={status.name}>
                    {status.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="">All Priority</MenuItem>
                {priorities?.map(priority => (
                  <MenuItem key={priority.id} value={priority.name}>
                    {priority.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories?.map(category => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>Assigned</InputLabel>
              <Select
                value={assignedFilter}
                label="Assigned"
                onChange={(e) => setAssignedFilter(e.target.value)}
              >
                <MenuItem value="">All Assignments</MenuItem>
                <MenuItem value="me">Assigned to Me</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow 
                  key={ticket.id}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      #{ticket.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium" sx={{ maxWidth: 250 }} noWrap>
                        {ticket.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 250 }} noWrap>
                        {ticket.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={ticket.statusName} />
                  </TableCell>
                  <TableCell>
                    <PriorityChip priority={ticket.priorityName} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {ticket.categoryName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {ticket.assignedToName ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {ticket.assignedToName.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2">
                          {ticket.assignedToName}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(ticket.createdAt), 'MMM dd, HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(ticket.updatedAt), 'MMM dd, HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tickets/${ticket.id}`);
                          }}
                        >
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAgent() && !ticket.assignedToId && (
                        <Tooltip title="Assign to Me">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              assignToMeMutation.mutate(ticket.id);
                            }}
                            disabled={assignToMeMutation.isPending}
                          >
                            <Assignment fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredTickets.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {tickets?.length === 0 
                ? "No tickets have been created yet."
                : "Try adjusting your filters to see more results."
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/tickets/create')}
            >
              Create First Ticket
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default Tickets;