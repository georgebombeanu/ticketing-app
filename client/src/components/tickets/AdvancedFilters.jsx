import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Drawer,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  Chip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  OutlinedInput,
  ListItemText,
} from '@mui/material';
import {
  FilterList,
  Clear,
  ExpandMore,
  Close,
  CalendarToday,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { usersAPI, departmentsAPI } from '../../services/api';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AdvancedFilters = ({ 
  open, 
  onClose, 
  filters, 
  onFiltersChange, 
  categories, 
  priorities, 
  statuses 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsAPI.getAll().then(res => res.data),
    enabled: open,
  });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.getAll().then(res => res.data),
    enabled: open,
  });

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      status: [],
      priority: [],
      category: [],
      assignedTo: [],
      department: [],
      team: [],
      createdBy: [],
      dateRange: { start: null, end: null },
      includeResolved: false,
      includeClosed: false,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.status?.length) count++;
    if (localFilters.priority?.length) count++;
    if (localFilters.category?.length) count++;
    if (localFilters.assignedTo?.length) count++;
    if (localFilters.department?.length) count++;
    if (localFilters.dateRange?.start || localFilters.dateRange?.end) count++;
    return count;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, p: 0 }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            <Typography variant="h6">Advanced Filters</Typography>
            {getActiveFiltersCount() > 0 && (
              <Chip 
                label={`${getActiveFiltersCount()} active`} 
                size="small" 
                color="primary" 
              />
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Filters */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Stack spacing={2}>
            {/* Quick Search */}
            <TextField
              fullWidth
              label="Search in title, description, ID"
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Enter search terms..."
            />

            {/* Status Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Status ({localFilters.status?.length || 0})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth>
                  <InputLabel>Select Statuses</InputLabel>
                  <Select
                    multiple
                    value={localFilters.status || []}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    input={<OutlinedInput label="Select Statuses" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={statuses?.find(s => s.id === value)?.name} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {statuses?.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        <Checkbox checked={localFilters.status?.includes(status.id) || false} />
                        <ListItemText primary={status.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Priority Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Priority ({localFilters.priority?.length || 0})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth>
                  <InputLabel>Select Priorities</InputLabel>
                  <Select
                    multiple
                    value={localFilters.priority || []}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    input={<OutlinedInput label="Select Priorities" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={priorities?.find(p => p.id === value)?.name} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {priorities?.map((priority) => (
                      <MenuItem key={priority.id} value={priority.id}>
                        <Checkbox checked={localFilters.priority?.includes(priority.id) || false} />
                        <ListItemText primary={priority.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Category Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Category ({localFilters.category?.length || 0})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth>
                  <InputLabel>Select Categories</InputLabel>
                  <Select
                    multiple
                    value={localFilters.category || []}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    input={<OutlinedInput label="Select Categories" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={categories?.find(c => c.id === value)?.name} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    {categories?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        <Checkbox checked={localFilters.category?.includes(category.id) || false} />
                        <ListItemText primary={category.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Assignment Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Assigned To ({localFilters.assignedTo?.length || 0})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth>
                  <InputLabel>Select Assignees</InputLabel>
                  <Select
                    multiple
                    value={localFilters.assignedTo || []}
                    onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                    input={<OutlinedInput label="Select Assignees" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={
                              value === 'unassigned' 
                                ? 'Unassigned' 
                                : users?.find(u => u.id === value)?.firstName + ' ' + 
                                  users?.find(u => u.id === value)?.lastName
                            } 
                            size="small" 
                          />
                        ))}
                      </Box>
                    )}
                    MenuProps={MenuProps}
                  >
                    <MenuItem value="unassigned">
                      <Checkbox checked={localFilters.assignedTo?.includes('unassigned') || false} />
                      <ListItemText primary="Unassigned" />
                    </MenuItem>
                    {users?.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        <Checkbox checked={localFilters.assignedTo?.includes(user.id) || false} />
                        <ListItemText primary={`${user.firstName} ${user.lastName}`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Date Range */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Created Date Range</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Stack spacing={2}>
                    <DatePicker
                      label="From Date"
                      value={localFilters.dateRange?.start}
                      onChange={(date) => handleFilterChange('dateRange', {
                        ...localFilters.dateRange,
                        start: date
                      })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                    <DatePicker
                      label="To Date"
                      value={localFilters.dateRange?.end}
                      onChange={(date) => handleFilterChange('dateRange', {
                        ...localFilters.dateRange,
                        end: date
                      })}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Stack>
                </LocalizationProvider>
              </AccordionDetails>
            </Accordion>

            {/* Additional Options */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Additional Options</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={localFilters.includeResolved || false}
                        onChange={(e) => handleFilterChange('includeResolved', e.target.checked)}
                      />
                    }
                    label="Include Resolved Tickets"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={localFilters.includeClosed || false}
                        onChange={(e) => handleFilterChange('includeClosed', e.target.checked)}
                      />
                    }
                    label="Include Closed Tickets"
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>

        {/* Actions */}
        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              onClick={clearFilters}
              startIcon={<Clear />}
              fullWidth
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={applyFilters}
              fullWidth
            >
              Apply Filters
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AdvancedFilters;