import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import {
  Search,
  Close,
  Check,
  // Categories
  Category,
  Label,
  LocalOffer,
  Bookmark,
  Flag,
  Star,
  Circle,
  Square,
  
  // Priorities
  PriorityHigh,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Remove,
  Warning,
  Error,
  Info,
  Bolt,
  FlashOn,
  Whatshot,
  
  // Statuses
  Schedule,
  PlayArrow,
  Pause,
  Stop,
  CheckCircle,
  Cancel,
  Refresh,
  Pending,
  Done,
  Block,
  HourglassEmpty,
  Update,
  
  // General
  Settings,
  Build,
  BugReport,
  Help,
  Feedback,
  Assignment,
  Task,
  Event,
  Notifications,
  Security,
  CloudUpload,
  Dashboard,
  Analytics,
  Assessment,
  TrendingUp,
  AccountCircle,
  Group,
  Person,
  Business,
  
  // Actions
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Save,
  Send,
  Download,
  Upload,
  Share,
  
  // Status indicators
  CheckBox,
  RadioButtonUnchecked,
  ToggleOn,
  ToggleOff,
  ThumbUp,
  ThumbDown,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';

// Organize icons by category
const iconCategories = {
  'Categories': {
    icons: [
      { name: 'Category', component: Category },
      { name: 'Label', component: Label },
      { name: 'LocalOffer', component: LocalOffer },
      { name: 'Bookmark', component: Bookmark },
      { name: 'Flag', component: Flag },
      { name: 'Star', component: Star },
      { name: 'Circle', component: Circle },
      { name: 'Square', component: Square },
      { name: 'BugReport', component: BugReport },
      { name: 'Help', component: Help },
      { name: 'Feedback', component: Feedback },
      { name: 'Assignment', component: Assignment },
      { name: 'Task', component: Task },
      { name: 'Build', component: Build },
      { name: 'Settings', component: Settings },
      { name: 'Security', component: Security },
    ]
  },
  'Priorities': {
    icons: [
      { name: 'PriorityHigh', component: PriorityHigh },
      { name: 'KeyboardArrowUp', component: KeyboardArrowUp },
      { name: 'KeyboardArrowDown', component: KeyboardArrowDown },
      { name: 'Remove', component: Remove },
      { name: 'Warning', component: Warning },
      { name: 'Error', component: Error },
      { name: 'Info', component: Info },
      { name: 'Bolt', component: Bolt },
      { name: 'FlashOn', component: FlashOn },
      { name: 'Whatshot', component: Whatshot },
      { name: 'TrendingUp', component: TrendingUp },
      { name: 'Notifications', component: Notifications },
    ]
  },
  'Statuses': {
    icons: [
      { name: 'Schedule', component: Schedule },
      { name: 'PlayArrow', component: PlayArrow },
      { name: 'Pause', component: Pause },
      { name: 'Stop', component: Stop },
      { name: 'CheckCircle', component: CheckCircle },
      { name: 'Cancel', component: Cancel },
      { name: 'Refresh', component: Refresh },
      { name: 'Pending', component: Pending },
      { name: 'Done', component: Done },
      { name: 'Block', component: Block },
      { name: 'HourglassEmpty', component: HourglassEmpty },
      { name: 'Update', component: Update },
      { name: 'CheckBox', component: CheckBox },
      { name: 'RadioButtonUnchecked', component: RadioButtonUnchecked },
    ]
  },
  'Actions': {
    icons: [
      { name: 'Add', component: Add },
      { name: 'Edit', component: Edit },
      { name: 'Delete', component: Delete },
      { name: 'Visibility', component: Visibility },
      { name: 'VisibilityOff', component: VisibilityOff },
      { name: 'Save', component: Save },
      { name: 'Send', component: Send },
      { name: 'Download', component: Download },
      { name: 'Upload', component: Upload },
      { name: 'CloudUpload', component: CloudUpload },
      { name: 'Share', component: Share },
      { name: 'ToggleOn', component: ToggleOn },
      { name: 'ToggleOff', component: ToggleOff },
    ]
  },
  'General': {
    icons: [
      { name: 'Dashboard', component: Dashboard },
      { name: 'Analytics', component: Analytics },
      { name: 'Assessment', component: Assessment },
      { name: 'Event', component: Event },
      { name: 'AccountCircle', component: AccountCircle },
      { name: 'Group', component: Group },
      { name: 'Person', component: Person },
      { name: 'Business', component: Business },
      { name: 'ThumbUp', component: ThumbUp },
      { name: 'ThumbDown', component: ThumbDown },
      { name: 'Favorite', component: Favorite },
      { name: 'FavoriteBorder', component: FavoriteBorder },
    ]
  }
};

const IconPicker = ({ 
  value = 'Category', 
  onChange, 
  label = 'Icon',
  disabled = false,
  color = '#2196f3'
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Categories');

  // Get all icons for searching
  const allIcons = Object.values(iconCategories).flatMap(category => category.icons);

  // Filter icons based on search term
  const filteredIcons = searchTerm 
    ? allIcons.filter(icon => 
        icon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : iconCategories[selectedCategory]?.icons || [];

  // Get the current icon component
  const getCurrentIcon = () => {
    const icon = allIcons.find(i => i.name === value);
    return icon ? icon.component : Category;
  };

  const handleIconSelect = (iconName) => {
    onChange(iconName);
    setOpen(false);
  };

  const CurrentIconComponent = getCurrentIcon();

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      
      <Button
        variant="outlined"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          minWidth: 120,
        }}
      >
        <CurrentIconComponent sx={{ color, mr: 1 }} />
        {value}
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Choose Icon
            <IconButton onClick={() => setOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3}>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search icons..."
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

            {/* Category Filter */}
            {!searchTerm && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Categories
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.keys(iconCategories).map((category) => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => setSelectedCategory(category)}
                      color={selectedCategory === category ? 'primary' : 'default'}
                      variant={selectedCategory === category ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Icons Grid */}
            <Box>
              {searchTerm && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Search Results ({filteredIcons.length} icons)
                </Typography>
              )}
              
              <Grid container spacing={1}>
                {filteredIcons.map((icon) => {
                  const IconComponent = icon.component;
                  const isSelected = value === icon.name;
                  
                  return (
                    <Grid item key={icon.name}>
                      <Tooltip title={icon.name}>
                        <IconButton
                          onClick={() => handleIconSelect(icon.name)}
                          sx={{
                            width: 48,
                            height: 48,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            backgroundColor: isSelected ? 'primary.light' : 'transparent',
                            '&:hover': {
                              backgroundColor: isSelected ? 'primary.light' : 'action.hover',
                              transform: 'scale(1.05)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <IconComponent 
                            sx={{ 
                              color: isSelected ? 'primary.main' : color,
                              fontSize: 24 
                            }} 
                          />
                          {isSelected && (
                            <Check 
                              sx={{ 
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                fontSize: 12,
                                color: 'primary.main',
                                backgroundColor: 'background.paper',
                                borderRadius: '50%',
                              }} 
                            />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  );
                })}
              </Grid>

              {filteredIcons.length === 0 && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  textAlign="center"
                  sx={{ py: 4 }}
                >
                  No icons found matching "{searchTerm}"
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IconPicker;