import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Divider,
  Chip,
  Collapse,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Send,
  Reply,
  Edit,
  Delete,
  MoreVert,
  AttachFile,
  Download,
  ExpandMore,
  ExpandLess,
  ThumbUp,
  ThumbUpOutlined
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const CommentThread = ({ 
  comments, 
  onAddComment, 
  onUpdateComment,
  onDeleteComment,
  onLikeComment,
  onUnlikeComment,
  currentUser,
  maxDepth = 3,
  compact = false 
}) => {
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setEditingComment(null);
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  const handleDeleteClick = (comment) => {
    setDeleteTargetId(comment._id || comment.id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onDeleteComment(deleteTargetId);
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleDeleteCancelDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleLike = (comment) => {
    if (comment.isLiked) {
      onUnlikeComment(comment._id);
    } else {
      onLikeComment(comment._id);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleFileDownload = (file) => {
    window.open(file.url, '_blank');
  };

  const renderComment = (comment, depth = 0) => {
    const isAuthor = currentUser?._id === comment.author?._id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment._id);
    const canShowMoreReplies = depth < maxDepth;
    return (
      <div
        key={comment._id || comment.id}
        className={`group flex gap-3 mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4 ${depth > 0 ? 'ml-10' : ''}`}
        style={{ position: 'relative' }}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar
            src={comment.author?.profilePicture || comment.author?.photo || `https://ui-avatars.com/api/?name=${comment.author?.name?.charAt(0) || 'U'}`}
            alt={comment.author?.name || 'Unknown User'}
            className="w-10 h-10 border-2 border-white shadow-md"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
          />
        </div>
        {/* Bubble */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{comment.author?.name || 'Unknown User'}</span>
              {/* Robust author check for edit/delete buttons */}
              <span className="flex gap-1">
                <button className="hover:text-blue-600 font-semibold transition flex items-center gap-1" onClick={() => handleReply(comment)}>
                  <Reply fontSize="small" />
                </button>
                {(currentUser && (
                  String(currentUser._id || currentUser.id) === String(comment.author_id || comment.author?._id)
                )) && (
                  <>
                    <button className="hover:text-blue-600 font-semibold transition flex items-center gap-1" onClick={() => handleEdit(comment)}>
                      <Edit fontSize="small" />
                    </button>
                    <button className="hover:text-red-600 font-semibold transition flex items-center gap-1" onClick={() => handleDeleteClick(comment)}>
                      <Delete fontSize="small" />
                    </button>
                  </>
                )}
              </span>
            </div>
            {/* Content */}
            <div className="text-gray-800 dark:text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-2">
              {comment.content}
            </div>
            {/* Attachments */}
            {comment.attachments && comment.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {comment.attachments.map(file => (
                  <div key={file.id || file.file_id || file.url} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 max-w-xs w-full sm:w-40 md:w-48 lg:w-56">
                    {file.mimetype?.startsWith('image/') ? (
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <img src={file.url} alt={file.filename} className="rounded shadow w-full h-auto object-contain max-h-32" style={{ maxWidth: '100%' }} />
                      </a>
                    ) : (
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="block text-blue-700 hover:underline truncate" title={file.filename}>
                        <span className="inline-block align-middle mr-1">📄</span>{file.filename}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Nested replies */}
          {hasReplies && canShowMoreReplies && (
            <div className="mt-2 border-l-2 border-gray-200 pl-4">
              {comment.replies.map(reply => renderComment(reply, depth + 1))}
            </div>
          )}
          {/* Edit Form */}
          {editingComment?._id === comment._id && (
            <div className="mt-2 animate-fade-in">
              <EditForm
                comment={comment}
                onSubmit={(content) => {
                  onUpdateComment(comment._id || comment.id, content);
                  setEditingComment(null);
                }}
                onCancel={() => setEditingComment(null)}
              />
            </div>
          )}
          {/* Reply Form */}
          {replyingTo?._id === comment._id && (
            <div className="mt-2 animate-fade-in">
              <ReplyForm
                onSubmit={(content) => {
                  onAddComment(content, comment._id);
                  setReplyingTo(null);
                }}
                onCancel={() => setReplyingTo(null)}
                placeholder={`Replying to ${comment.author?.name}...`}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {comments.map((comment) => renderComment(comment))}

      {/* Comment Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          handleEdit(selectedComment);
          setMenuAnchor(null);
        }}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedComment)}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancelDialog}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this comment? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancelDialog} color="primary">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Reply Form Component
const ReplyForm = ({ onSubmit, onCancel, placeholder }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        multiline
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        variant="outlined"
        size="small"
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={!content.trim()}
        >
          Reply
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

// Edit Form Component
const EditForm = ({ comment, onSubmit, onCancel }) => {
  const [content, setContent] = useState(comment.content);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && content !== comment.content) {
      onSubmit(content);
    } else {
      onCancel();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        multiline
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          size="small"
          disabled={!content.trim() || content === comment.content}
        >
          Save
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

CommentThread.propTypes = {
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      author: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        photo: PropTypes.string
      }).isRequired,
      attachments: PropTypes.array,
      replies: PropTypes.array,
      isLiked: PropTypes.bool,
      likes: PropTypes.number
    })
  ).isRequired,
  onAddComment: PropTypes.func.isRequired,
  onUpdateComment: PropTypes.func.isRequired,
  onDeleteComment: PropTypes.func.isRequired,
  onLikeComment: PropTypes.func.isRequired,
  onUnlikeComment: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  maxDepth: PropTypes.number,
  compact: PropTypes.bool
};

export default CommentThread; 