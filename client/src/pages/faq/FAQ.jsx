import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from '@mui/material';
import {
  Add,
  Search,
  ExpandMore,
  Help,
} from '@mui/icons-material';
import { faqAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const FAQ = () => {
  const { isAgent } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPanel, setExpandedPanel] = useState(false);

  const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['faq', 'active'],
    queryFn: () => faqAPI.getActiveFAQs().then(res => res.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['faq', 'categories'],
    queryFn: () => faqAPI.getCategories().then(res => res.data),
  });

  // Filter FAQs based on search term
  const filteredFAQs = faqs?.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Group FAQs by category
  const faqsByCategory = filteredFAQs.reduce((acc, faq) => {
    const categoryName = faq.categoryName || 'General';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(faq);
    return acc;
  }, {});

  const handlePanelChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
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
            Find answers to common questions
          </Typography>
        </Box>
        {isAgent() && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {/* TODO: Implement */}}
          >
            Add FAQ
          </Button>
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
        <Stack spacing={3}>
          {Object.entries(faqsByCategory).map(([categoryName, categoryFAQs]) => (
            <Card key={categoryName}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Help color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    {categoryName}
                  </Typography>
                  <Chip label={`${categoryFAQs.length} items`} size="small" />
                </Box>

                <Stack spacing={1}>
                  {categoryFAQs.map((faq) => (
                    <Accordion
                      key={faq.id}
                      expanded={expandedPanel === `faq-${faq.id}`}
                      onChange={handlePanelChange(`faq-${faq.id}`)}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls={`faq-${faq.id}-content`}
                        id={`faq-${faq.id}-header`}
                      >
                        <Typography variant="subtitle1" fontWeight="medium">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {faq.answer}
                        </Typography>
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" color="text.secondary">
                            Created by {faq.createdByName} • Last updated: {new Date(faq.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
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
                onClick={() => {/* TODO */}}
              >
                Create First FAQ
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default FAQ;