import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
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

  return (
    <Paper elevation={0} sx={{ width: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      {showTabs ? (
        <>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ px: 2, pt: 1 }}
          >
            <Tab label="Comments" sx={{ textTransform: 'none', fontWeight: 500 }} />
            <Tab label="Activity" sx={{ textTransform: 'none', fontWeight: 500 }} />
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
        </>
      ) : (
        <>
          <Box sx={{ px: 2, pt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, textBase: 'sm:text-lg' }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <CommentsSection
              resourceType={resourceType}
              resourceId={resourceId}
              compact={compact}
            />
          </Box>
        </>
      )}
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
