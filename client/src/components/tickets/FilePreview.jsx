import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Toolbar,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Download,
  ZoomIn,
  ZoomOut,
  RotateRight,
  Fullscreen,
  Refresh,
} from '@mui/icons-material';
import { useToast } from '../../contexts/ToastContext';
import useAuthStore from '../../store/authStore';

const FilePreview = ({ attachment, open, onClose }) => {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const isImage = attachment?.type?.startsWith('image/');
  const isPdf = attachment?.type === 'application/pdf';
  const isText = attachment?.type?.startsWith('text/') || 
                 attachment?.fileName?.endsWith('.txt') ||
                 attachment?.fileName?.endsWith('.md');

  const canPreview = isImage || isPdf || isText;

  useEffect(() => {
    if (open && attachment && canPreview) {
      loadPreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [open, attachment]);

  const loadPreview = async () => {
    if (!attachment) return;
    
    setLoading(true);
    setError(null);
    setZoom(100);
    setRotation(0);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5097/api'}/files/download/${attachment.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Preview load error:', err);
      setError('Failed to load file preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5097/api'}/files/download/${attachment.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${useAuthStore.getState().token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('File downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      showError('Failed to download file');
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleFullscreen = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>Loading preview...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 400, justifyContent: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={loadPreview} startIcon={<Refresh />}>
            Retry
          </Button>
        </Box>
      );
    }

    if (!canPreview) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 400, justifyContent: 'center' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Preview not available for this file type
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            File: {attachment?.fileName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Type: {attachment?.type || 'Unknown'}
          </Typography>
          <Button onClick={handleDownload} variant="contained" startIcon={<Download />}>
            Download to View
          </Button>
        </Box>
      );
    }

    if (!previewUrl) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography variant="body2" color="text.secondary">
            No preview available
          </Typography>
        </Box>
      );
    }

    if (isImage) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '60vh',
          overflow: 'auto',
          bgcolor: 'grey.100',
          position: 'relative'
        }}>
          <img
            src={previewUrl}
            alt={attachment.fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
          />
        </Box>
      );
    }

    if (isPdf) {
      return (
        <Box sx={{ height: '60vh', width: '100%' }}>
          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={`PDF Preview: ${attachment.fileName}`}
          />
        </Box>
      );
    }

    if (isText) {
      return (
        <Box sx={{ 
          height: '60vh', 
          overflow: 'auto', 
          bgcolor: 'grey.50', 
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1
        }}>
          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            title={`Text Preview: ${attachment.fileName}`}
          />
        </Box>
      );
    }

    return null;
  };

  if (!attachment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="div" noWrap>
              {attachment.fileName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {attachment.type} • {attachment.size && formatFileSize(attachment.size)}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Controls Toolbar */}
      {canPreview && previewUrl && (
        <Toolbar variant="dense" sx={{ minHeight: 48, bgcolor: 'action.hover' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 1 }}>
            {isImage && (
              <>
                <Tooltip title="Zoom Out">
                  <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 25}>
                    <ZoomOut fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
                  {zoom}%
                </Typography>
                
                <Tooltip title="Zoom In">
                  <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 300}>
                    <ZoomIn fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Rotate">
                  <IconButton size="small" onClick={handleRotate}>
                    <RotateRight fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Tooltip title="Open in New Tab">
              <IconButton size="small" onClick={handleFullscreen}>
                <Fullscreen fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Download">
              <IconButton size="small" onClick={handleDownload}>
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      )}

      <DialogContent sx={{ p: 0, flex: 1, overflow: 'hidden' }}>
        {renderPreview()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleDownload} startIcon={<Download />}>
          Download
        </Button>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default FilePreview;