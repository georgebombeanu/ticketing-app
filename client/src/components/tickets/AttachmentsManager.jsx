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
  Visibility,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ticketsAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import useAuthStore from '../../store/authStore';
import FilePreview from './FilePreview';

// Enhanced file upload with progress tracking
const uploadFileWithProgress = async (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileSize', file.size.toString());
    formData.append('fileType', file.type);

    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            fileName: file.name,
            filePath: result.filePath || `/uploads/${result.fileId}`,
            size: file.size,
            type: file.type,
            fileId: result.fileId,
          });
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed: Network error'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    // Start upload
    xhr.open('POST', `${import.meta.env.VITE_API_URL || 'http://localhost:5097/api'}/files/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${useAuthStore.getState().token}`);
    xhr.send(formData);
  });
};

const getFileIcon = (fileName, fileType) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension) || fileType?.startsWith('image/')) {
    return <Image />;
  } else if (extension === 'pdf' || fileType === 'application/pdf') {
    return <PictureAsPdf />;
  } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension) || fileType?.startsWith('text/')) {
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

const canPreviewFile = (fileName, fileType) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension) || fileType?.startsWith('image/');
  const isPdf = extension === 'pdf' || fileType === 'application/pdf';
  const isText = ['txt', 'md'].includes(extension) || fileType?.startsWith('text/');
  
  return isImage || isPdf || isText;
};

const AttachmentsManager = ({ ticketId, attachments = [], canUpload = true, canDelete = true }) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (!canUpload) return;

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        const errorMessages = errors.map(e => {
          switch (e.code) {
            case 'file-too-large':
              return 'File is too large (max 10MB)';
            case 'file-invalid-type':
              return 'File type not supported';
            case 'too-many-files':
              return 'Too many files selected';
            default:
              return e.message;
          }
        }).join(', ');
        showError(`${file.name}: ${errorMessages}`);
      });
    }

    // Process accepted files
    for (const file of acceptedFiles) {
      const fileId = `${Date.now()}-${file.name}`;
      
      try {
        // Initialize progress tracking
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Upload file with progress tracking
        const fileData = await uploadFileWithProgress(file, (progress) => {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        });
        
        // Add attachment record to ticket
        await addAttachmentMutation.mutateAsync({
          ...fileData,
          ticketId: parseInt(ticketId),
        });

        // Remove from progress tracking
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });

      } catch (error) {
        console.error('Upload error:', error);
        showError(`Failed to upload "${file.name}": ${error.message}`);
        
        // Remove from progress tracking on error
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    }
  }, [canUpload, addAttachmentMutation, showError, showSuccess, ticketId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    disabled: !canUpload || Object.keys(uploadProgress).length > 0,
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
    },
  });

  const handlePreview = (attachment) => {
    setPreviewFile(attachment);
    setPreviewOpen(true);
  };

  const handleDownload = async (attachment) => {
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

      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.fileName;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess(`Downloaded ${attachment.fileName} successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      showError(`Failed to download ${attachment.fileName}: ${error.message}`);
    }
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
            borderColor: isDragActive || dragActive ? 'primary.main' : 'grey.300',
            backgroundColor: isDragActive || dragActive ? 'primary.light' : 'background.default',
            cursor: Object.keys(uploadProgress).length > 0 ? 'not-allowed' : 'pointer',
            opacity: Object.keys(uploadProgress).length > 0 ? 0.6 : 1,
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <input {...getInputProps()} />
          <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          
          {Object.keys(uploadProgress).length > 0 ? (
            <Box>
              <Typography variant="body1" gutterBottom>
                Uploading files...
              </Typography>
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <Box key={fileId} sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {fileId.split('-').slice(1).join('-')} - {progress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              ))}
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" gutterBottom>
                {isDragActive || dragActive
                  ? 'Drop files here...'
                  : 'Drag & drop files here, or click to select'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Maximum file size: 10MB • Supported: Images, PDFs, Documents, Archives
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AttachFile />}
                disabled={Object.keys(uploadProgress).length > 0}
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
                {getFileIcon(attachment.fileName, attachment.type)}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {attachment.fileName}
                    </Typography>
                    {canPreviewFile(attachment.fileName, attachment.type) && (
                      <Chip 
                        label="Previewable" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                }
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
                  {canPreviewFile(attachment.fileName, attachment.type) && (
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(attachment)}
                      title="Preview"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  )}
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

      {Object.keys(uploadProgress).length > 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="body2">
            Uploading {Object.keys(uploadProgress).length} file(s)...
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Please don't close this page during upload.
          </Typography>
        </Alert>
      )}

      {/* File Preview Dialog */}
      <FilePreview
        attachment={previewFile}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewFile(null);
        }}
      />
    </Box>
  );
};

export default AttachmentsManager;