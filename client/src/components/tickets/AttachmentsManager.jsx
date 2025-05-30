import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  LinearProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import {
  CloudUpload,
  AttachFile,
  Delete,
  Download,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ticketsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

// Simulated file upload - in real implementation, you'd upload to your server/cloud storage
const uploadFile = async (file) => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In real implementation, upload file and return the path
  const fakePath = `/uploads/${Date.now()}_${file.name}`;
  return {
    fileName: file.name,
    filePath: fakePath,
    size: file.size,
    type: file.type,
  };
};

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return <Image />;
  } else if (extension === 'pdf') {
    return <PictureAsPdf />;
  } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
    return <Description />;
  } else {
    return <InsertDriveFile />;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const AttachmentsManager = ({ ticketId, attachments = [], canUpload = true, canDelete = true }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [uploading, setUploading] = useState(false);

  const addAttachmentMutation = useMutation({
    mutationFn: async (fileData) => {
      return ticketsAPI.addAttachment(ticketId, {
        ticketId: parseInt(ticketId),
        fileName: fileData.fileName,
        filePath: fileData.filePath,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      showSuccess('File uploaded successfully!');
    },
    onError: (error) => {
      showError('Failed to upload file: ' + (error.response?.data?.message || error.message));
    },
  });

  const removeAttachmentMutation = useMutation({
    mutationFn: (attachmentId) => ticketsAPI.removeAttachment(attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-attachments', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      showSuccess('File removed successfully!');
    },
    onError: (error) => {
      showError('Failed to remove file: ' + (error.response?.data?.message || error.message));
    },
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!canUpload) return;

    for (const file of acceptedFiles) {
      // Validate file size (e.g., max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        showError(`File "${file.name}" is too large. Maximum size is 10MB.`);
        continue;
      }

      setUploading(true);
      try {
        // Upload file to server/storage
        const fileData = await uploadFile(file);
        
        // Add attachment record to ticket
        await addAttachmentMutation.mutateAsync(fileData);
      } catch (error) {
        showError(`Failed to upload "${file.name}": ${error.message}`);
      }
    }
    setUploading(false);
  }, [canUpload, addAttachmentMutation, showError, showSuccess, ticketId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: !canUpload || uploading,
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleDownload = (attachment) => {
    // In real implementation, this would download from your server/storage
    showSuccess(`Download started for ${attachment.fileName}`);
  };

  const handleDelete = (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      removeAttachmentMutation.mutate(attachmentId);
    }
  };

  return (
    <Box>
      {/* Upload Area */}
      {canUpload && (
        <Paper
          {...getRootProps()}
          sx={{
            p: 3,
            mb: 2,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'grey.300',
            backgroundColor: isDragActive ? 'action.hover' : 'background.default',
            cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1,
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          
          {uploading ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                Uploading...
              </Typography>
              <LinearProgress variant="indeterminate" sx={{ mt: 1 }} />
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" gutterBottom>
                {isDragActive
                  ? 'Drop files here...'
                  : 'Drag & drop files here, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maximum file size: 10MB • Supported: Images, PDFs, Documents
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AttachFile />}
                sx={{ mt: 2 }}
                disabled={uploading}
              >
                Choose Files
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Attachments List */}
      {attachments.length > 0 ? (
        <List>
          {attachments.map((attachment) => (
            <ListItem
              key={attachment.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemIcon>
                {getFileIcon(attachment.fileName)}
              </ListItemIcon>
              
              <ListItemText
                primary={attachment.fileName}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded by {attachment.userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      • {format(new Date(attachment.uploadedAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                    {attachment.size && (
                      <Chip 
                        label={formatFileSize(attachment.size)} 
                        size="small" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                }
              />
              
              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(attachment)}
                    title="Download"
                  >
                    <Download fontSize="small" />
                  </IconButton>
                  {canDelete && (
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(attachment.id)}
                      title="Delete"
                      disabled={removeAttachmentMutation.isPending}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Alert severity="info" sx={{ mt: 1 }}>
          No attachments yet. {canUpload && 'Upload files to get started.'}
        </Alert>
      )}

      {/* Upload Status */}
      {addAttachmentMutation.isPending && (
        <Alert severity="info" sx={{ mt: 1 }}>
          Adding attachment to ticket...
        </Alert>
      )}
    </Box>
  );
};

export default AttachmentsManager;