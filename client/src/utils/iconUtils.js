import React from 'react';
import {
  // Categories
  Category,
  Label,
  LocalOffer,
  Bookmark,
  Flag,
  Star,
  Circle,
  Square,
  BugReport,
  Help,
  Feedback,
  Assignment,
  Task,
  Build,
  Settings,
  Security,
  
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
  TrendingUp,
  Notifications,
  
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
  CheckBox,
  RadioButtonUnchecked,
  
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
  CloudUpload,
  Share,
  ToggleOn,
  ToggleOff,
  
  // General
  Dashboard,
  Analytics,
  Assessment,
  Event,
  AccountCircle,
  Group,
  Person,
  Business,
  ThumbUp,
  ThumbDown,
  Favorite,
  FavoriteBorder,
} from '@mui/icons-material';

// Icon mapping object
const iconMap = {
  // Categories
  Category,
  Label,
  LocalOffer,
  Bookmark,
  Flag,
  Star,
  Circle,
  Square,
  BugReport,
  Help,
  Feedback,
  Assignment,
  Task,
  Build,
  Settings,
  Security,
  
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
  TrendingUp,
  Notifications,
  
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
  CheckBox,
  RadioButtonUnchecked,
  
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
  CloudUpload,
  Share,
  ToggleOn,
  ToggleOff,
  
  // General
  Dashboard,
  Analytics,
  Assessment,
  Event,
  AccountCircle,
  Group,
  Person,
  Business,
  ThumbUp,
  ThumbDown,
  Favorite,
  FavoriteBorder,
};

// Get icon component by name
export const getIconComponent = (iconName) => {
  return iconMap[iconName] || Category; // Default to Category if not found
};

// Render icon with props
export const renderIcon = (iconName, props = {}) => {
  const IconComponent = getIconComponent(iconName);
  return React.createElement(IconComponent, props);
};