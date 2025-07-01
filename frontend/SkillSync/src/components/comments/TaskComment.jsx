import React, { useState } from 'react';
import { Card, Typography, Avatar, Button, IconButton, Snackbar, Alert } from '@mui/material';

const TaskComment = () => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Replace with actual API call to post a comment
      const newComment = {
        content,
        author_id: 'user_id', // Replace with actual user ID
        author_name: 'John Doe', // Replace with actual user name
        author_photo: 'https://example.com/john-doe.jpg', // Replace with actual user photo URL
      };
      setComments([...comments, newComment]);
      setContent('');
      setSuccess('Comment posted successfully!');
    } catch (err) {
      setError('Failed to post comment. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id, content) => {
    setEditingCommentId(id);
    setEditingContent(content);
  };

  const handleEditSave = (id) => {
    // Replace with actual API call to update a comment
    setEditingCommentId(null);
    setSuccess('Comment updated successfully!');
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteClick = (id) => {
    // Replace with actual API call to delete a comment
    setComments(comments.filter(c => c._id !== id && c.id !== id));
    setSuccess('Comment deleted successfully!');
  };

  const handleReply = (replyContent, commentId) => {
    // Replace with actual API call to post a reply
    const newReply = {
      content: replyContent,
      author_id: 'user_id', // Replace with actual user ID
      author_name: 'John Doe', // Replace with actual user name
      author_photo: 'https://example.com/john-doe.jpg', // Replace with actual user photo URL
    };
    setComments(prevComments => ({
      ...prevComments,
      comments: [
        ...prevComments.comments.map(c =>
          c._id === commentId || c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
        ),
      ],
    }));
    setContent('');
    setSuccess('Reply posted successfully!');
  };

  return (
    <Card className="w-full max-w-xl mx-auto p-4 my-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-md text-gray-900 dark:text-gray-100">
      <Typography variant="h6" className="mb-2 font-bold text-indigo-800 dark:text-indigo-300">Task Comments</Typography>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Avatar src={user?.photo} alt={user?.name} />
          <textarea
            className="w-full resize-none rounded border border-gray-200 dark:border-gray-700 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:bg-gray-900 dark:text-gray-100"
            style={{ minHeight: 40, maxWidth: '100%' }}
            placeholder="Write a comment..."
            value={content}
            onChange={e => setContent(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
      {loading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center text-gray-500 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <TaskCommentItem key={comment._id || comment.id} comment={comment} user={user} onEdit={handleEdit} onDelete={handleDeleteClick} onReply={handleReply} />
          ))}
        </div>
      )}
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
    </Card>
  );
};

const TaskCommentItem = ({ comment, user, onEdit, onDelete, onReply, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return;
    onReply(replyContent, comment._id);
    setReplyContent('');
    setIsReplying(false);
  };

  return (
    <div className={`relative ${depth > 0 ? 'ml-8 pl-4 border-l-2 border-indigo-100 dark:border-indigo-700' : ''}`}>
      <div className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-100 dark:border-gray-700 p-4">
        <Avatar src={comment.author_photo || comment.author?.photo} alt={comment.author_name || comment.author?.name} className="w-10 h-10 border-2 border-white shadow-md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{comment.author_name || comment.author?.name || 'Unknown'}</span>
          </div>
          <p className="text-gray-800 dark:text-gray-100 text-[15px] leading-relaxed whitespace-pre-wrap break-words mb-1">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <Button size="small" onClick={() => setIsReplying(!isReplying)} className="text-gray-500 dark:text-gray-400 hover:text-blue-600">Reply</Button>
          </div>
          {isReplying && (
            <div className="mt-3 pl-2">
              <div className="flex gap-2">
                <Avatar src={user?.photo} alt={user?.name} className="w-8 h-8 mt-1 flex-shrink-0" />
                <textarea className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" placeholder={`Reply to ${comment.author_name || comment.author?.name}...`} value={replyContent} onChange={e => setReplyContent(e.target.value)} rows={2} autoFocus />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outlined" size="small" onClick={() => setIsReplying(false)}>Cancel</Button>
                <Button variant="contained" size="small" onClick={handleReplySubmit} disabled={!replyContent.trim()}>Reply</Button>
              </div>
            </div>
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-2 border-l-2 border-indigo-100 dark:border-indigo-700 pl-4">
              {comment.replies.map(reply => (
                <TaskCommentItem key={reply._id || reply.id} comment={reply} user={user} onEdit={onEdit} onDelete={onDelete} onReply={onReply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskComment; 