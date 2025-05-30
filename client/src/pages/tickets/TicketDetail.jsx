import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  TextField,
  Stack,
  Paper,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  MoreVert,
  Send,
  Assignment,
  Close as CloseIcon,
  Refresh,
  Comment,
  AttachFile,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ticketsAPI, usersAPI, ticketStatusesAPI } from '../../services/api';
import { priorityColors, statusColors } from '../../theme/theme';
import useAuthStore from '../../store/authStore';
import AttachmentsManager from '../../components/tickets/AttachmentsManager';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAgent } = useAuthStore();
  
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [assignDialog, setAssignDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedStatusId, setSelectedStatusId] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  // Form for comments
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Force refetch when component mounts or ID changes
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
  }, [id, queryClient]);

  // Fetch ticket data with proper cache management
  const { data: ticket, isLoading, error, refetch } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsAPI.getById(id).then(res => res.data),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['ticket-comments', id],
    queryFn: () => ticketsAPI.getComments(id, true).then(res => res.data),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: attachments, refetch: refetchAttachments } = useQuery({
    queryKey: ['ticket-attachments', id],
    queryFn: () => ticketsAPI.getAttachments(id).then(res => res.data),
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: users } = useQuery({
    queryKey: ['users', 'department', ticket?.departmentId],
    queryFn: () => usersAPI.getByDepartment(ticket.departmentId).then(res => res.data),
    enabled: !!ticket?.departmentId,
  });

  const { data: statuses } = useQuery({
    queryKey: ['ticket-statuses'],
    queryFn: () => ticketStatusesAPI.getAll().then(res => res.data),
  });

  // Mutations with comprehensive cache invalidation
  const assignMutation = useMutation({
    mutationFn: (userId) => ticketsAPI.assign(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'assigned', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'active-count'] });
      
      setTimeout(() => refetch(), 100);
      
      setAssignDialog(false);
      setSelectedUserId('');
    },
  });

  const unassignMutation = useMutation({
    mutationFn: () => ticketsAPI.unassign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'assigned', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'active-count'] });
      
      setTimeout(() => refetch(), 100);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (statusId) => ticketsAPI.updateStatus(id, statusId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'assigned', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'active-count'] });
      
      setTimeout(() => refetch(), 100);
      
      setStatusDialog(false);
      setSelectedStatusId('');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => ticketsAPI.addComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', id] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      
      setTimeout(() => {
        refetch();
        refetchComments();
      }, 100);
      
      reset();
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => ticketsAPI.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'assigned', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'active-count'] });
      
      setTimeout(() => refetch(), 100);
    },
  });

  const reopenMutation = useMutation({
    mutationFn: () => ticketsAPI.reopen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'assigned', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tickets', 'active-count'] });
      
      setTimeout(() => refetch(), 100);
    },
  });

  const handleAssign = () => {
    if (selectedUserId) {
      assignMutation.mutate(selectedUserId);
    }
  };

  const handleStatusUpdate = () => {
    if (selectedStatusId) {
      updateStatusMutation.mutate(selectedStatusId);
    }
  };

  const onCommentSubmit = (data) => {
    addCommentMutation.mutate({
      ticketId: parseInt(id),
      comment: data.comment,
      isInternal: data.isInternal || false,
    });
  };

  const PriorityChip = ({ priority }) => {
    const colors = priorityColors[priority.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    return (
      <Chip
        label={priority}
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
        }}
      />
    );
  };

  const StatusChip = ({ status }) => {
    const colors = statusColors[status.toLowerCase()] || { bg: '#f5f5f5', color: '#666' };
    return (
      <Chip
        label={status}
        sx={{
          backgroundColor: colors.bg,
          color: colors.color,
          fontWeight: 500,
        }}
      />
    );
  };

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load ticket details</Alert>;
  if (!ticket) return <Alert severity="error">Ticket not found</Alert>;

  const isTicketClosed = ticket.statusName.toLowerCase() === 'closed' || ticket.statusName.toLowerCase() === 'resolved';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/tickets')}
            variant="outlined"
          >
            Back
          </Button>
          <Typography variant="h4" fontWeight="bold">
            Ticket #{ticket.id}
          </Typography>
        </Box>

        {isAgent() && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => navigate(`/tickets/${id}/edit`)}
            >
              Edit
            </Button>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setAssignDialog(true); setMenuAnchor(null); }}>
          <Assignment sx={{ mr: 1 }} /> Assign/Reassign
        </MenuItem>
        <MenuItem onClick={() => { setStatusDialog(true); setMenuAnchor(null); }}>
          <Refresh sx={{ mr: 1 }} /> Change Status
        </MenuItem>
        {!isTicketClosed ? (
          <MenuItem onClick={() => { closeMutation.mutate(); setMenuAnchor(null); }}>
            <CloseIcon sx={{ mr: 1 }} /> Close Ticket
          </MenuItem>
        ) : (
          <MenuItem onClick={() => { reopenMutation.mutate(); setMenuAnchor(null); }}>
            <Refresh sx={{ mr: 1 }} /> Reopen Ticket
          </MenuItem>
        )}
      </Menu>

      <Stack spacing={3}>
        {/* Ticket Details */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {ticket.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <StatusChip status={ticket.statusName} />
                <PriorityChip priority={ticket.priorityName} />
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
              {ticket.description}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Typography variant="body2">{ticket.categoryName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                <Typography variant="body2">{ticket.departmentName}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Team</Typography>
                <Typography variant="body2">{ticket.teamName || 'Not assigned'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                {ticket.assignedToName ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                      {ticket.assignedToName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography variant="body2">{ticket.assignedToName}</Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">Unassigned</Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                    {ticket.createdByName.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Typography variant="body2">{ticket.createdByName}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                <Typography variant="body2">{format(new Date(ticket.createdAt), 'PPpp')}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                <Typography variant="body2">{format(new Date(ticket.updatedAt), 'PPpp')}</Typography>
              </Box>
              {ticket.closedAt && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Closed</Typography>
                  <Typography variant="body2">{format(new Date(ticket.closedAt), 'PPpp')}</Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Tabbed Content - Comments and Attachments */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab 
                label={`Comments (${comments?.length || 0})`} 
                icon={<Comment />} 
                iconPosition="start"
              />
              <Tab 
                label={`Attachments (${attachments?.length || 0})`} 
                icon={<AttachFile />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <CardContent>
            {/* Comments Tab */}
            {currentTab === 0 && (
              <Box>
                {/* Add Comment Form */}
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
                  <form onSubmit={handleSubmit(onCommentSubmit)}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Add a comment..."
                      {...register('comment', { required: 'Comment is required' })}
                      error={!!errors.comment}
                      helperText={errors.comment?.message}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        {/* Internal comment checkbox could go here */}
                      </Box>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Send />}
                        disabled={addCommentMutation.isPending}
                      >
                        {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </Box>
                  </form>
                </Paper>

                {/* Comments List */}
                <Stack spacing={2}>
                  {comments?.map((comment) => (
                    <Paper key={comment.id} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                            {comment.userName.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Typography variant="subtitle2">{comment.userName}</Typography>
                          {comment.isInternal && (
                            <Chip label="Internal" size="small" color="secondary" />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(comment.createdAt), 'PPpp')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {comment.comment}
                      </Typography>
                    </Paper>
                  ))}
                  {(!comments || comments.length === 0) && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
                      No comments yet. Be the first to add one!
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}

            {/* Attachments Tab */}
            {currentTab === 1 && (
              <AttachmentsManager
                ticketId={id}
                attachments={attachments || []}
                canUpload={isAgent()}
                canDelete={isAgent()}
              />
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Assignment Dialog */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Assign to</InputLabel>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              label="Assign to"
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users?.map((assignUser) => (
                <MenuItem key={assignUser.id} value={assignUser.id}>
                  {assignUser.firstName} {assignUser.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssign} variant="contained" disabled={assignMutation.isPending}>
            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatusId}
              onChange={(e) => setSelectedStatusId(e.target.value)}
              label="Status"
            >
              {statuses?.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained" disabled={updateStatusMutation.isPending}>
            {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketDetail;