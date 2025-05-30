import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert,
  InputAdornment,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add,
  Search,
  ExpandMore,
  Help,
  Edit,
  Delete,
  Category,
  QuestionAnswer,
  MoreVert,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { faqAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';
import { useToast } from '../../contexts/ToastContext';
import FAQModal from '../../components/faq/FAQModal';
import FAQCategoryModal from '../../components/faq/FAQCategoryModal';

const FAQ = () => {
  const { isAgent } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPanel, setExpandedPanel] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Modal states
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, item: null, type: null });

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [menuType, setMenuType] = useState(null); // 'faq' or 'category'

  const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['faq', 'active'],
    queryFn: () => faqAPI.getActiveFAQs().then(res => res.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['faq', 'categories'],
    queryFn: () => faqAPI.getCategories().then(res => res.data),
  });

  // Filter FAQs based on search term only (all are active from the API)
  const filteredFAQs = faqs?.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Group FAQs by category with proper category data
  const faqsByCategory = categories?.reduce((acc, category) => {
    const categoryFAQs = filteredFAQs.filter(faq => faq.categoryId === category.id);
    if (categoryFAQs.length > 0) {
      acc[category.id] = {
        category,
        faqs: categoryFAQs,
      };
    }
    return acc;
  }, {}) || {};

  // Handle uncategorized FAQs
  const uncategorizedFAQs = filteredFAQs.filter(faq => 
    !categories?.some(cat => cat.id === faq.categoryId)
  );
  if (uncategorizedFAQs.length > 0) {
    faqsByCategory['uncategorized'] = {
      category: { id: 'uncategorized', name: 'General', description: 'General questions and answers' },
      faqs: uncategorizedFAQs,
    };
  }

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCreateFaq = () => {
    setSelectedFaq(null);
    setFaqModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditFaq = (faq) => {
    setSelectedFaq(faq);
    setFaqModalOpen(true);
    setMenuAnchor(null);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryModalOpen(true);
    setMenuAnchor(null);
  };

  const handleMenuOpen = (event, item, type) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuItem(item);
    setMenuType(type);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuItem(null);
    setMenuType(null);
  };

  const handleDeleteFaq = (faq) => {
    setConfirmDialog({
      open: true,
      item: faq,
      type: 'faq',
    });
    setMenuAnchor(null);
  };

  const handleDeleteCategory = (category) => {
    setConfirmDialog({
      open: true,
      item: category,
      type: 'category',
    });
    setMenuAnchor(null);
  };

  const executeDelete = () => {
    // This function is not used since delete operations are not available
    showError('Delete operations are not available in the current backend API');
  };

  if (isLoading) return <LinearProgress />;
  if (error) return <Alert severity="error">Failed to load FAQ</Alert>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Frequently Asked Questions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find answers to common questions ({filteredFAQs.length} FAQs)
          </Typography>
        </Box>
        {isAgent() && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Category />}
              onClick={handleCreateCategory}
            >
              Add Category
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateFaq}
            >
              Add FAQ
            </Button>
          </Box>
        )}
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* FAQ Categories and Items */}
      {Object.keys(faqsByCategory).length > 0 ? (
        <Stack spacing={2}>
          {Object.entries(faqsByCategory).map(([categoryId, { category, faqs: categoryFAQs }]) => {
            const isExpanded = expandedCategories[categoryId] ?? true; // Default to expanded
            const isUncategorized = categoryId === 'uncategorized';
            
            return (
              <Card key={categoryId}>
                {/* Category Header - Clickable to expand/collapse */}
                <CardContent 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    pb: isExpanded ? 2 : 2
                  }}
                  onClick={() => handleCategoryToggle(categoryId)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Help color="primary" />
                      <Typography variant="h6" fontWeight="bold">
                        {category.name}
                      </Typography>
                      <Chip label={`${categoryFAQs.length} items`} size="small" />
                      <ExpandMore 
                        sx={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s'
                        }} 
                      />
                    </Box>
                    {isAgent() && category.id !== 'uncategorized' && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, category, 'category');
                        }}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {category.description && !isUncategorized && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4 }}>
                      {category.description}
                    </Typography>
                  )}
                </CardContent>

                {/* Category Content - FAQ Items */}
                {isExpanded && (
                  <Box sx={{ px: 3, pb: 3 }}>
                    <Stack spacing={1}>
                      {categoryFAQs.map((faq) => (
                        <Accordion
                          key={faq.id}
                          expanded={expandedPanel === `faq-${faq.id}`}
                          onChange={handlePanelChange(`faq-${faq.id}`)}
                          sx={{ boxShadow: 1 }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMore />}
                            aria-controls={`faq-${faq.id}-content`}
                            id={`faq-${faq.id}-header`}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium" sx={{ flex: 1 }}>
                                {faq.question}
                              </Typography>
                              {isAgent() && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMenuOpen(e, faq, 'faq');
                                  }}
                                >
                                  <MoreVert fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ whiteSpace: 'pre-wrap' }}
                            >
                              {faq.answer}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="caption" color="text.secondary">
                              Created by {faq.createdByName} • Last updated: {format(new Date(faq.updatedAt), 'PPP')}
                            </Typography>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Card>
            );
          })}
        </Stack>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Help sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No FAQs found' : 'No FAQs available'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {searchTerm 
                ? 'Try adjusting your search terms or browse all categories.'
                : 'FAQ items will appear here once they are created.'
              }
            </Typography>
            {searchTerm && (
              <Button
                variant="outlined"
                onClick={() => setSearchTerm('')}
                sx={{ mr: 1 }}
              >
                Clear Search
              </Button>
            )}
            {isAgent() && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateFaq}
              >
                Create First FAQ
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
        {menuType === 'faq' && [
          <MenuItem key="edit" onClick={() => handleEditFaq(menuItem)} disabled>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            Edit FAQ (Coming Soon)
          </MenuItem>,
          <MenuItem key="delete" onClick={() => handleDeleteFaq(menuItem)} disabled sx={{ color: 'text.disabled' }}>
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'text.disabled' }} />
            </ListItemIcon>
            Delete FAQ (Coming Soon)
          </MenuItem>
        ]}

        {menuType === 'category' && [
          <MenuItem key="edit" onClick={() => handleEditCategory(menuItem)} disabled>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            Edit Category (Coming Soon)
          </MenuItem>,
          <MenuItem key="delete" onClick={() => handleDeleteCategory(menuItem)} disabled sx={{ color: 'text.disabled' }}>
            <ListItemIcon>
              <Delete fontSize="small" sx={{ color: 'text.disabled' }} />
            </ListItemIcon>
            Delete Category (Coming Soon)
          </MenuItem>
        ]}
      </Menu>

      {/* FAQ Modal */}
      <FAQModal
        open={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        faq={selectedFaq}
      />

      {/* Category Modal */}
      <FAQCategoryModal
        open={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        category={selectedCategory}
      />

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, item: null, type: null })}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {confirmDialog.type === 'faq' ? 'FAQ' : 'category'}?
            {confirmDialog.type === 'faq' && (
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                <strong>Question:</strong> {confirmDialog.item?.question}
              </Box>
            )}
            {confirmDialog.type === 'category' && (
              <Box component="span" sx={{ display: 'block', mt: 1 }}>
                <strong>Category:</strong> {confirmDialog.item?.name}
                <br />
                This may affect {confirmDialog.item?.faqItems?.length || 0} FAQ items in this category.
              </Box>
            )}
            <Box component="span" sx={{ color: 'warning.main', display: 'block', mt: 1 }}>
              This action cannot be undone.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, item: null, type: null })}>
            Cancel
          </Button>
          <Button 
            onClick={executeDelete}
            color="error"
            variant="contained"
            disabled={true}
          >
            Delete Operations Not Available
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FAQ;