import React, { useState } from 'react';
import {
  Box,
  Button,
  Popover,
  Grid,
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Palette,
  Check,
} from '@mui/icons-material';

// Predefined color palette
const predefinedColors = [
  '#f44336', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
  '#009688', '#4caf50', '#8bc34a', '#cddc39',
  '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  '#795548', '#9e9e9e', '#607d8b', '#000000',
];

const ColorPicker = ({ 
  value = '#2196f3', 
  onChange, 
  label = 'Color',
  disabled = false 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [customColor, setCustomColor] = useState(value);

  const handleClick = (event) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorSelect = (color) => {
    onChange(color);
    setCustomColor(color);
    handleClose();
  };

  const handleCustomColorChange = (event) => {
    const newColor = event.target.value;
    setCustomColor(newColor);
    onChange(newColor);
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={disabled}
        startIcon={<Palette />}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          minWidth: 120,
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: 1,
            backgroundColor: value,
            border: '1px solid',
            borderColor: 'divider',
            mr: 1,
          }}
        />
        {value}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, width: 280 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Choose Color
            </Typography>
            
            {/* Predefined Colors */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Predefined Colors
              </Typography>
              <Grid container spacing={0.5}>
                {predefinedColors.map((color) => (
                  <Grid item key={color}>
                    <Tooltip title={color}>
                      <IconButton
                        size="small"
                        onClick={() => handleColorSelect(color)}
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: color,
                          border: value === color ? '3px solid' : '1px solid',
                          borderColor: value === color ? 'primary.main' : 'divider',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        {value === color && (
                          <Check 
                            sx={{ 
                              color: getContrastColor(color),
                              fontSize: 16 
                            }} 
                          />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Custom Color Input */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Custom Color
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  type="color"
                  value={customColor}
                  onChange={handleCustomColorChange}
                  size="small"
                  sx={{ width: 60 }}
                />
                <TextField
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    // Only update if it's a valid hex color
                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                      onChange(e.target.value);
                    }
                  }}
                  size="small"
                  placeholder="#000000"
                  sx={{ flex: 1 }}
                />
              </Box>
            </Box>

            {/* Preview */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Preview
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 40,
                  backgroundColor: value,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ 
                    color: getContrastColor(value),
                    fontWeight: 'medium',
                  }}
                >
                  Sample Text
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Popover>
    </Box>
  );
};

// Helper function to get contrasting text color
const getContrastColor = (backgroundColor) => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default ColorPicker;