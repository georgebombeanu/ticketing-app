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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  MoreVert,
  Delete,
  RestoreFromTrash,
  Category as CategoryIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ticketCategoriesAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import useAuthStore from '../../store/authStore';
import TicketCategoryModal from '../../components/admin/TicketCategoryModal';

const TicketCategories = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { isAdmin } = useAuthStore();

  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, category: null });
  const [showInactive, setShowInactive] = useState(false);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuCategory, setMenuCategory] = useState(null);

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['ticket-categories', 'all'],
    queryFn: () => ticketCategoriesAPI.getAll().then(res => res.data),
  });

  // Filter categories based on showInactive toggle
  const filteredCategories = categories?.filter(category => 
    showInactive ? true : category.isActive
  ) || [];

  // Toggle category active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, currentData }) => {
      const updatedData = { ...currentData, isActive: !currentData.isActive };
      return ticketCategoriesAPI.update(id, updatedData);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-categories'] });
      const action = variables.currentData.isActive ? 'deactivated' : 'activated';
      showSuccess(`Category ${action} successfully!`);
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to update category status');
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (categoryId) => ticketCategoriesAPI.deactivate(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-categories'] });
      showSuccess('Category deleted successfully');
      setConfirmDialog({ open: false, category: null });
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to delete category');
    },
  });

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryModalOpen(true);
    setMenuAnchor(null);
  };

  const handleToggleActive = (category) => {
    toggleActiveMutation.mutate({
      id: category.id,
      currentData: category
    });
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event, category) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuCategory(category);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuCategory(null);
  };

  const handleDeleteCategory = (category) => {
    setConfirmDialog({
      open: true,
      category,
    });
    setMenuAnchor(null);
  };

  const executeDelete = () => {
    if (confirmDialog.category) {
      deleteMutation.mutate(confirmDialog.category.id);
    }
  };

  if (!isAdmin()) {
    return (
      <Alert severity="error">
        Access denied. Admin privileges required.
      </Alert>
    );
  }

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load ticket categories</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Ticket Categories
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage ticket categories and their visibility ({filteredCategories.length} categories)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateCategory}
        >
          Add Category
        </Button>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
              />
            }
            label="Show inactive categories"
          />
          <Typography variant="body2" color="text.secondary">
            Total: {categories?.length || 0} categories 
            ({categories?.filter(c => c.isActive).length || 0} active, {categories?.filter(c => !c.isActive).length || 0} inactive)
          </Typography>
        </Box>
      </Card>

      {/* Categories Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tickets</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow 
                  key={category.id} 
                  hover
                  sx={{ opacity: category.isActive ? 1 : 0.6 }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon color={category.isActive ? 'primary' : 'disabled'} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {category.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {category.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        maxWidth: 300,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {category.description || 'No description'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={category.isActive ? 'Active' : 'Inactive'}
                      color={category.isActive ? 'success' : 'default'}
                      size="small"
                      icon={category.isActive ? <Visibility /> : <VisibilityOff />}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {category.ticketsCount || 0} tickets
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {category.createdAt ? format(new Date(category.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, category)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredCategories.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {showInactive ? 'No categories found' : 'No active categories found'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {showInactive 
                ? 'Create your first ticket category to get started.'
                : 'Toggle "Show inactive categories" to see all categories.'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateCategory}
            >
              Create Category
            </Button>
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
        <MenuItem onClick={() => handleEditCategory(menuCategory)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Category
        </MenuItem>
        
        <MenuItem onClick={() => handleToggleActive(menuCategory)}>
          <ListItemIcon>
            {menuCategory?.isActive ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </ListItemIcon>
          {menuCategory?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        
        {menuCategory?.isActive ? (
          <MenuItem 
            onClick={() => handleDeleteCategory(menuCategory)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            Delete Category
          </MenuItem>
        ) : (
          <MenuItem 
            onClick={() => handleToggleActive(menuCategory)}
            sx={{ color: 'success.main' }}
          >
            <ListItemIcon>
              <RestoreFromTrash fontSize="small" sx={{ color: 'success.main' }} />
            </ListItemIcon>
            Restore
          </MenuItem>
        )}
      </Menu>

      {/* Category Modal */}
      <TicketCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={selectedCategory}
      />

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, category: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete category{' '}
            <strong>{confirmDialog.category?.name}</strong>?
            <Box component="span" sx={{ color: 'warning.main', display: 'block', mt: 1 }}>
              This will deactivate the category. Existing tickets will keep their category assignment.
            </Box>
            {confirmDialog.category?.ticketsCount > 0 && (
              <Box component="span" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
                This category is used by {confirmDialog.category.ticketsCount} ticket(s).
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, category: null })}>
            Cancel
          </Button>
          <Button 
            onClick={executeDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Category'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketCategories;