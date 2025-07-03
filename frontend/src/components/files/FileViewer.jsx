import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Download,
  Visibility,
  Delete,
  AttachFile,
  Image,
  PictureAsPdf,
  Description,
  TableChart,
  Slideshow,
  Archive,
  Code,
  InsertDriveFile
} from '@mui/icons-material';
import {
  PaperClipIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const API_URL = import.meta.env.VITE_API_URL || '';

const getFileIcon = (file) => {
  const mimeType = file.mimetype || file.type || '';
  const ext = (file.filename || file.name || file.originalname || '').split('.').pop()?.toLowerCase();
  if (mimeType.startsWith('image/')) return <PhotoIcon className="w-6 h-6 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <VideoCameraIcon className="w-6 h-6 text-purple-500" />;
  if (mimeType.startsWith('audio/')) return <SpeakerWaveIcon className="w-6 h-6 text-pink-500" />;
  if (mimeType.includes('pdf')) return <DocumentTextIcon className="w-6 h-6 text-red-500" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return <ArchiveBoxIcon className="w-6 h-6 text-yellow-500" />;
  if (mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('text/')) return <CodeBracketIcon className="w-6 h-6 text-green-500" />;
  // Fallback by extension
  switch (ext) {
    case 'pdf': return <DocumentTextIcon className="w-6 h-6 text-red-500" />;
    case 'doc':
    case 'docx': return <DocumentTextIcon className="w-6 h-6 text-blue-400" />;
    case 'xls':
    case 'xlsx': return <DocumentTextIcon className="w-6 h-6 text-green-400" />;
    case 'ppt':
    case 'pptx': return <DocumentTextIcon className="w-6 h-6 text-orange-400" />;
    case 'zip':
    case 'rar':
    case '7z': return <ArchiveBoxIcon className="w-6 h-6 text-yellow-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
    case 'svg': return <PhotoIcon className="w-6 h-6 text-blue-500" />;
    default: return <PaperClipIcon className="w-6 h-6 text-gray-400" />;
  }
};

const getFileName = (file) => file.filename || file.name || file.originalname || 'Unnamed File';
const getFileType = (file) => file.mimetype || file.type || 'Unknown type';
const getFileSize = (file) => (typeof file.size === 'number' && !isNaN(file.size)) ? (file.size / 1024).toFixed(1) + ' KB' : '';

const FileViewer = ({ files = [], onDelete, readOnly = false, title = "Project Files" }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDialog, setPreviewDialog] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (file) => {
    const response = await fetch(`${API_URL}/files/${file.id}/download`);
    if (!response.ok) {
      alert('Failed to download file');
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.name || file.filename || file.originalname || 'downloaded_file');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePreview = (file) => {
    setSelectedFile(file);
    setPreviewDialog(true);
  };

  const canPreview = (file) => {
    const mimeType = file.mimetype || file.type;
    const baseName = file.filename || file.name || file.originalname || '';
    const extension = baseName.split('.').pop()?.toLowerCase();
    return (
      mimeType?.startsWith('image/') ||
      mimeType?.includes('pdf') ||
      mimeType?.includes('text/') ||
      ['txt', 'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)
    );
  };

  if (files.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <PaperClipIcon className="w-10 h-10 mx-auto mb-2" />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No files uploaded
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upload files to share with your project team
        </Typography>
      </Paper>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100">
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaperClipIcon className="w-5 h-5 text-gray-500" />
        {title} ({files.length})
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, idx) => {
          const fileName = getFileName(file);
          const fileType = getFileType(file);
          const fileSize = getFileSize(file);
          const fileUrl = file.url || `/uploads/${file.filename || file.name}`;
          const canPreviewFile = canPreview(file);
          return (
            <div key={file.id || idx} className="bg-white border rounded-lg p-4 flex flex-col gap-2 shadow hover:shadow-lg transition">
              <div className="flex items-center gap-3">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{fileName}</div>
                  <div className="text-xs text-gray-400 truncate">{fileType}</div>
                  {fileSize && <div className="text-xs text-gray-400">{fileSize}</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 w-full">
                {canPreviewFile && fileUrl && (
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex-1 min-w-[110px]"
                    onClick={() => handlePreview(file)}
                  >
                    <EyeIcon className="w-4 h-4" /> Preview
                  </button>
                )}
                {fileUrl && (
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex-1 min-w-[110px]"
                    onClick={() => handleDownload(file)}
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" /> Download
                  </button>
                )}
                {!readOnly && onDelete && fileUrl && (
                  <button
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700 flex-1 min-w-[110px]"
                    onClick={() => onDelete(file)}
                  >
                    <TrashIcon className="w-4 h-4" /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* File Preview Dialog */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedFile?.filename || selectedFile?.name || selectedFile?.originalname}
        </DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box>
              {selectedFile.mimetype?.startsWith('image/') ? (
                <img 
                  src={selectedFile.url || `/uploads/${selectedFile.filename || selectedFile.name}`}
                  alt={selectedFile.filename || selectedFile.name}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              ) : selectedFile.mimetype?.includes('pdf') ? (
                <iframe
                  src={selectedFile.url || `/uploads/${selectedFile.filename || selectedFile.name}`}
                  width="100%"
                  height="500px"
                  title="PDF Preview"
                />
              ) : (
                <Alert severity="info">
                  Preview not available for this file type. Please download to view.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
          {selectedFile && (
            <Button 
              onClick={() => handleDownload(selectedFile)}
              variant="contained"
              startIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              Download
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FileViewer;