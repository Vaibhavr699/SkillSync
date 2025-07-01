// Enhanced Admin Layout and Dashboard with a Clean Black & White Theme

import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const navItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, to: '/admin' },
  { label: 'User Management', icon: <PeopleIcon />, to: '/admin/users' },
  { label: 'Project Management', icon: <WorkIcon />, to: '/admin/projects' },
];

const AdminLayout = () => {
  const location = useLocation();
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f9fafb' }}>
      <CssBaseline />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#000',
            color: '#fff',
            pt: '64px',
            borderRight: '1px solid #333',
          },
        }}
      >
        <List>
          {navItems.map((item) => (
            <ListItem
              key={item.label}
              disablePadding
              sx={{
                bgcolor: location.pathname === item.to ? '#111' : 'inherit',
                '&:hover': { bgcolor: '#1c1c1c' },
              }}
            >
              <NavLink
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  textDecoration: 'none',
                  color: '#fff',
                  padding: '12px 24px',
                  fontWeight: location.pathname === item.to ? 600 : 400,
                }}
              >
                <span style={{ marginRight: 16 }}>{item.icon}</span>
                {item.label}
              </NavLink>
            </ListItem>
          ))}
          {/* Logout Button */}
          <ListItem disablePadding>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                background: 'none',
                border: 'none',
                color: '#fff',
                padding: '12px 24px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{ marginRight: 16 }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 12h-9m0 0l3-3m-3 3l3 3" /></svg></span>
              Logout
            </button>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, minHeight: '100vh', height: '100vh', overflowY: 'auto', bgcolor: '#fff' }}
      >
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: '#000',
            color: '#fff',
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" fontWeight="bold">
              Admin Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 4, md: 6 }, bgcolor: '#f9fafb' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
