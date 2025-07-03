import { useState, useEffect } from 'react';
import { 
  Avatar,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Send, 
  Reply, 
  Edit, 
  Delete, 
  ThumbUp,
  ThumbUpOutlined,
  AttachFile,
  MoreVert
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  updateComment, 
  deleteComment, 
  createComment, 
  getComments,
  likeComment,
  unlikeComment
} from "../../store/slices/commentSlice";
import { formatDistanceToNow } from 'date-fns';

const CommentsSection = ({ resourceType, resourceId, compact = false }) => {
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const commentsRaw = useSelector(state => state.comments.comments[resourceType]?.[resourceId]);
  const comments = Array.isArray(commentsRaw) ? commentsRaw : [];
  const [commentCount, setCommentCount] = useState(0);
  
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const loading = useSelector(state => state.comments.loading);

  useEffect(() => {
    dispatch(getComments({ resourceType, resourceId }));
  }, [dispatch, resourceType, resourceId]);

  useEffect(() => {
    setCommentCount(comments.length);
  }, [comments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (files.length > 0) {
        const formData = new FormData();
        formData.append('content', content);
        formData.append('entityId', resourceId);
        formData.append('entityType', resourceType);
        files.forEach((file) => {
          formData.append('files', file);
        });
        result = await dispatch(createComment({
          resourceType,
          resourceId,
          content,
          files: formData
        }));
      } else {
        result = await dispatch(createComment({
          resourceType,
          resourceId,
          content
        }));
      }
      setContent('');
      setFiles([]);
      setSuccess('Comment posted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (content, replyTo = null) => {
    try {
      await dispatch(createComment({
        resourceType,
        resourceId,
        content,
        replyTo
      }));
      setReplyingTo(null);
      setSuccess('Reply posted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to post reply');
    }
  };

  const handleUpdateComment = async (commentId, content) => {
    if (!commentId) {
      setError('Invalid comment ID');
      return;
    }
    try {
      await dispatch(updateComment({
        resourceType,
        resourceId,
        commentId,
        content
      }));
      setEditingComment(null);
      setSuccess('Comment updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) {
      setError('Invalid comment ID');
      return;
    }
    try {
      await dispatch(deleteComment({
        resourceType,
        resourceId,
        commentId
      }));
      setSuccess('Comment deleted successfully!');
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await dispatch(likeComment({
        resourceType,
        resourceId,
        commentId
      }));
    } catch (err) {
      setError(err.message || 'Failed to like comment');
    }
  };

  const handleUnlikeComment = async (commentId) => {
    try {
      await dispatch(unlikeComment({
        resourceType,
        resourceId,
        commentId
      }));
    } catch (err) {
      setError(err.message || 'Failed to unlike comment');
    }
  };

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const normalizeIds = (comments) =>
    comments.map(comment => ({
      ...comment,
      _id: String(comment._id),
      author: {
        ...comment.author,
        _id: comment.author && comment.author._id !== undefined ? String(comment.author._id) : '',
        name: comment.author && comment.author.name ? String(comment.author.name) : 'Unknown User',
      },
      createdAt: comment.createdAt || comment.created_at || new Date(0).toISOString(),
      replies: comment.replies ? normalizeIds(comment.replies) : []
    }));

  const normalizedComments = normalizeIds(comments);

  const CommentItem = ({ comment, depth = 0, onReply, onEdit, onDelete, user }) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [editContent, setEditContent] = useState(comment.content);
    const [showOptions, setShowOptions] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const handleReplySubmit = () => {
      if (!replyContent.trim()) return;
      onReply(replyContent, comment._id);
      setReplyContent('');
      setIsReplying(false);
    };

    const handleEditSubmit = () => {
      if (!editContent.trim()) return;
      onEdit(comment._id, editContent);
      setIsEditing(false);
    };

    return (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-3 items-start">
        <div className="flex items-center gap-3">
          <Avatar src={comment.author?.photo} alt={comment.author?.name} className="w-8 h-8 mt-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white">{comment.author?.name || 'Unknown User'}</span>
              {(user?._id === comment.author?._id || user?.id === comment.author?.id || user?._id === comment.author?.id || user?.id === comment.author?._id) && (
                <div className="relative ml-2">
                  <button onClick={() => setShowOptions(!showOptions)} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                    <MoreVert />
                  </button>
                  {showOptions && (
                    <div className="absolute z-10 right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
                      <button onClick={() => { setIsEditing(true); setIsReplying(false); setShowOptions(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Edit</button>
                      <button onClick={() => { onDelete(comment._id); setShowOptions(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Delete</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {isEditing ? (
              <div className="mb-3">
                <textarea className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" value={editContent} onChange={e => setEditContent(e.target.value)} rows={3} autoFocus />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleEditSubmit} className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line break-words">{comment.content}</p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <button onClick={() => { setIsReplying(!isReplying); setIsEditing(false); }} className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">
                <Reply className="text-sm" /> Reply
              </button>
            </div>
            {isReplying && (
              <div className="mt-3 pl-2">
                <div className="flex gap-2">
                  <Avatar src={user?.photo} alt={user?.name} className="w-8 h-8 mt-1 flex-shrink-0" />
                  <textarea className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder={`Reply to ${comment.author?.name}...`} value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={2} autoFocus />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setIsReplying(false)} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                  <button onClick={handleReplySubmit} disabled={!replyContent.trim()} className={`px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${!replyContent.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>Reply</button>
                </div>
              </div>
            )}
            {comment.replies?.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowReplies(v => !v)}
                  className="text-xs text-blue-600 hover:underline mb-2"
                >
                  {showReplies ? `Hide replies (${comment.replies.length})` : `Show replies (${comment.replies.length})`}
                </button>
                {showReplies && (
                  <div className="space-y-3">
                    {comment.replies.map(reply => (
                      <CommentItem key={reply._id} comment={reply} depth={depth + 1} onReply={onReply} onEdit={onEdit} onDelete={onDelete} user={user} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Comments ({commentCount})</h2>
            {loading && (
              <CircularProgress size={20} />
            )}
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex gap-3 mb-4">
            <Avatar 
              src={user?.photo} 
              alt={user?.name} 
              className="w-10 h-10 flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write a comment..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
              />
              
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AttachFile className="text-gray-500 text-sm" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                          {file.name} ({formatFileSize(file.size)})
                        </span>
                      </div>
                      <button 
                        onClick={() => removeFile(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-between items-center mt-3">
                <div>
                  <input
                    type="file"
                    id="comment-file-upload"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="comment-file-upload"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <AttachFile className="mr-1 text-sm" />
                    Attach files
                  </label>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (!content.trim() && files.length === 0)}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isSubmitting || (!content.trim() && files.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <CircularProgress size={16} color="inherit" />
                      Posting...
                    </span>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {loading && !comments.length ? (
            <div className="flex justify-center py-8">
              <CircularProgress />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {normalizedComments.map(comment => (
                <CommentItem key={comment._id} comment={comment} onReply={handleAddComment} onEdit={handleUpdateComment} onDelete={handleDeleteComment} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CommentsSection;