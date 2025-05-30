import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Stack,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { faqAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500, 'Question must be less than 500 characters'),
  answer: z.string().min(1, 'Answer is required').max(2000, 'Answer must be less than 2000 characters'),
  categoryId: z.number().min(1, 'Category is required'),
  isActive: z.boolean(),
});

const FAQModal = ({ open, onClose, faq = null }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!faq;

  const { data: categories } = useQuery({
    queryKey: ['faq', 'categories'],
    queryFn: () => faqAPI.getCategories().then(res => res.data),
    enabled: open,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      categoryId: '',
      isActive: true,
    },
  });

  // Update form when faq prop changes
  useEffect(() => {
    if (faq && open) {
      reset({
        question: faq.question || '',
        answer: faq.answer || '',
        categoryId: faq.categoryId || '',
        isActive: faq.isActive ?? true,
      });
    } else if (open && !faq) {
      reset({
        question: '',
        answer: '',
        categoryId: '',
        isActive: true,
      });
    }
  }, [faq, open, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        return faqAPI.updateFAQ(faq.id, data);
      } else {
        return faqAPI.createFAQ(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faq'] });
      showSuccess(`FAQ ${isEdit ? 'updated' : 'created'} successfully!`);
      handleClose();
    },
    onError: (error) => {
      showError(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} FAQ`);
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? `Edit FAQ` : 'Create New FAQ'}
      </DialogTitle>
      
      <DialogContent>
        <form onSubmit={handleSubmit(mutation.mutate)}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {mutation.error && (
              <Alert severity="error">
                {mutation.error.response?.data?.message || 'An error occurred'}
              </Alert>
            )}

            {/* Basic Information */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                FAQ Information
              </Typography>
              
              <Stack spacing={2}>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.categoryId}>
                      <InputLabel>Category</InputLabel>
                      <Select
                        {...field}
                        label="Category"
                        value={field.value || ''}
                      >
                        {categories?.filter(cat => cat.isActive).map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.categoryId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.categoryId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />

                <Controller
                  name="question"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Question"
                      fullWidth
                      multiline
                      rows={2}
                      error={!!errors.question}
                      helperText={errors.question?.message}
                      placeholder="What question does this FAQ answer?"
                    />
                  )}
                />

                <Controller
                  name="answer"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Answer"
                      fullWidth
                      multiline
                      rows={6}
                      error={!!errors.answer}
                      helperText={errors.answer?.message}
                      placeholder="Provide a comprehensive answer to the question. You can include step-by-step instructions, links, or any other helpful information."
                    />
                  )}
                />

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Active FAQ (visible to users)"
                      sx={{ mt: 1 }}
                    />
                  )}
                />
              </Stack>
            </Paper>

            {/* Additional Info for Edit */}
            {isEdit && faq && (
              <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                <Typography variant="body2">
                  <strong>Category:</strong> {faq.categoryName}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Created:</strong> {new Date(faq.createdAt).toLocaleDateString()} by {faq.createdByName}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  <strong>Last Updated:</strong> {new Date(faq.updatedAt).toLocaleDateString()}
                </Typography>
              </Paper>
            )}
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit(mutation.mutate)} 
          variant="contained"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update FAQ' : 'Create FAQ')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FAQModal;