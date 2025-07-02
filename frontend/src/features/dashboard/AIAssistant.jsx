import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText,
  CircularProgress,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import { Send, HelpOutline } from '@mui/icons-material';
import { askAI } from '../../api/ai';

const AIAssistant = () => {
  const { projectId } = useParams();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const userMessage = { role: 'user', content: question };
    setConversation(prev => [...prev, userMessage]);
    setQuestion('');

    try {
      const response = await askAI(projectId, question);
      const aiMessage = { 
        role: 'ai', 
        content: response.answer,
        sources: response.sources 
      };
      setConversation(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = { 
        role: 'ai', 
        content: 'Sorry, I encountered an error. Please try again later.',
        isError: true 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Project Assistant
        </Typography>
        <Tooltip title="Ask about project details, tasks, or discussions">
          <IconButton>
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </Box>

      <Paper sx={{ p: 2, mb: 2, height: '400px', overflow: 'auto' }}>
        {conversation.length === 0 ? (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            textAlign: 'center',
            color: 'text.secondary'
          }}>
            <Typography variant="h6">How can I help you today?</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Ask questions like "What are we working on this week?" or 
              "Summarize the project status"
            </Typography>
          </Box>
        ) : (
          <List>
            {conversation.map((msg, index) => (
              <Box key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle2" 
                        color={msg.role === 'user' ? 'primary' : msg.isError ? 'error' : 'text.primary'}
                        sx={{ fontWeight: 'bold' }}
                      >
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color={msg.isError ? 'error' : 'text.primary'}
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {msg.content}
                        </Typography>
                        {msg.sources && msg.sources.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Sources:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                              {msg.sources.map((source, i) => (
                                <Chip 
                                  key={i} 
                                  label={source.type === 'task' ? `Task: ${source.title}` : `Comment`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
                {index < conversation.length - 1 && <Divider component="li" />}
              </Box>
            ))}
            {isLoading && (
              <ListItem>
                <CircularProgress size={24} />
              </ListItem>
            )}
          </List>
        )}
      </Paper>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask a question about the project..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!question.trim() || isLoading}
          endIcon={<Send />}
        >
          Ask
        </Button>
      </Box>
    </Box>
  );
};

export default AIAssistant;