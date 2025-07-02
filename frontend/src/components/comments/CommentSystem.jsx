import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import CommentsSection from './CommentsSection';

const CommentSystem = ({ 
  resourceType, 
  resourceId, 
  title = "Comments",
  compact = false,
  showTabs = false 
}) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (showTabs) {
    return (
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Comments" />
          <Tab label="Activity" />
        </Tabs>
        
        <Box sx={{ p: 2 }}>
          {activeTab === 0 && (
            <CommentsSection
              resourceType={resourceType}
              resourceId={resourceId}
              compact={compact}
            />
          )}
          {activeTab === 1 && (
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Activity feed coming soon...
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <CommentsSection
        resourceType={resourceType}
        resourceId={resourceId}
        compact={compact}
      />
    </Paper>
  );
};

CommentSystem.propTypes = {
  resourceType: PropTypes.oneOf(['project', 'task']).isRequired,
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string,
  compact: PropTypes.bool,
  showTabs: PropTypes.bool
};

export default CommentSystem; 