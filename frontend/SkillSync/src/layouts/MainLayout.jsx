import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { useTheme } from '@mui/material/styles';

const drawerWidth = 240;
const navbarHeight = 64;

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* Navbar */}
      <Navbar
        handleDrawerToggle={handleDrawerToggle}
        darkMode={false} // or pass from props/context
        toggleDarkMode={() => {}}
      />

      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          m: 0,
          width: '100%',
          minHeight: '100vh',
          overflowY: 'auto',
        }}
        className="bg-gradient-to-br from-indigo-200 via-blue-100 to-blue-300 w-full min-h-screen h-full"
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
