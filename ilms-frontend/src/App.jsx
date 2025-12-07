import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Avatar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Collapse
} from '@mui/material';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ExpandLess, ExpandMore } from '@mui/icons-material'; // Added imports
import MaterialList from './components/MaterialList';
import MaterialForm from './components/MaterialForm';
import MaterialCreate from './components/MaterialCreate';
import PackagingHierarchyEditor from './components/PackagingHierarchyEditor';
import LocationList from './components/Location/LocationList';
import MasterDefinitions from './components/MasterDefinitions'; // Added import
import LabelDashboard from './components/LabelManagement/LabelDashboard'; // Restored Import
import PrintStation from './components/LabelManagement/Print/PrintStation'; // Add import
import PackingDashboard from './components/Packing/PackingDashboard';

import Registration from './components/Inventory/Registration';
import PackingStation from './components/Inventory/PackingStation';
import SearchPortal from './components/Trace/SearchPortal';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Footer from './components/Footer';
import {
  Menu as MenuIcon,
  AddCircleOutline,
  Inventory2,
  Dashboard as DashboardIcon,
  Notifications,
  Settings,
  Logout,
  LocalShipping,
  Store,
  Style,
  QrCodeScanner,
  Timeline,
  ListAlt, // Added icon
  Storage // Added icon
} from '@mui/icons-material';

const AnimatedBox = motion(Box);

function NavBar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [masterDataOpen, setMasterDataOpen] = useState(false); // Default closed

  const menuItems = [
    { label: 'Dashboard', icon: DashboardIcon, path: '/' },
    {
      label: 'Master Data',
      icon: Storage,
      children: [
        { label: 'Materials', icon: Inventory2, path: '/materials' },
        { label: 'Locations', icon: Store, path: '/locations' },
        { label: 'Definitions', icon: ListAlt, path: '/master-definitions' },
      ]
    },
    { label: 'Label Management', icon: Style, path: '/labels' },
    { label: 'Packing Station', icon: QrCodeScanner, path: '/packing' }, // Added Packing
  ];

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const renderMenuItem = (item, index) => {
    if (item.children) {
      return (
        <React.Fragment key={item.label}>
          <ListItemButton onClick={() => setMasterDataOpen(!masterDataOpen)} sx={{ borderRadius: 2, mb: 1, color: 'white' }}>
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><item.icon /></ListItemIcon>
            <ListItemText primary={item.label} />
            {masterDataOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={masterDataOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child, cIndex) => (
                <ListItemButton
                  key={child.path}
                  onClick={() => { navigate(child.path); setDrawerOpen(false); }}
                  selected={location.pathname === child.path}
                  sx={{ pl: 4, borderRadius: 2, mb: 1, color: 'white', '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)' } }}
                >
                  <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><child.icon /></ListItemIcon>
                  <ListItemText primary={child.label} />
                </ListItemButton>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
    return (
      <ListItemButton
        key={item.path}
        onClick={() => { navigate(item.path); setDrawerOpen(false); }}
        selected={location.pathname === item.path}
        sx={{
          borderRadius: 2, mb: 1, color: 'white',
          '&.Mui-selected': { bgcolor: 'rgba(255, 255, 255, 0.15)' },
          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
        }}
      >
        <ListItemIcon sx={{ color: 'white', minWidth: 40 }}><item.icon /></ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    );
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: 'linear-gradient(135deg, rgba(10, 25, 41, 0.95), rgba(25, 118, 210, 0.95))',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>

          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, background: 'linear-gradient(135deg, #FFFFFF, #90CAF9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 4px 12px rgba(255, 255, 255, 0.3)' }}>
              <LocalShipping sx={{ fontSize: 24, color: 'primary.dark' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, display: { xs: 'none', sm: 'block' } }}>
              TraceRoo ILMS
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error"><Notifications /></Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Account">
              <IconButton onClick={handleProfileClick} sx={{ p: 0.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>IL</Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1.5, minWidth: 200, borderRadius: 2 } }}
      >
        <MenuItem onClick={handleProfileClose}><ListItemIcon><Settings fontSize="small" /></ListItemIcon>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleProfileClose(); onLogout(); }}><ListItemIcon><Logout fontSize="small" /></ListItemIcon>Logout</MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, background: 'linear-gradient(180deg, #0A1929, #1976D2)', color: 'white' } }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            {/* Logo placeholder */}
            <Typography variant="h6" fontWeight="bold">TraceRoo</Typography>
          </Box>
          <List>
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </List>
        </Box>
      </Drawer>
      {/* Side Rail omitted for brevity if drawer is enough, or implement simplified version */}
    </>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalStyles styles={{ body: { scrollBehavior: 'smooth' } }} />
      <NavBar onLogout={() => setIsAuthenticated(false)} />
      <Container maxWidth="xl" sx={{ mt: 3, mb: 6, flex: 1, display: 'flex', flexDirection: 'column', pl: { xs: 2, sm: 10 } }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materials/new" element={<MaterialCreate />} />
          <Route path="/materials/:code" element={<MaterialForm />} />
          <Route path="/materials" element={<MaterialList />} />
          <Route path="/packaging" element={<LabelDashboard />} />
          <Route path="/locations" element={<LocationList />} />
          <Route path="/master-definitions" element={<MasterDefinitions />} />
          <Route path="/labels" element={<LabelDashboard />} />
          <Route path="/label-templates" element={<LabelDashboard />} />
          <Route path="/label-templates/*" element={<LabelDashboard />} />
          <Route path="/print/:hierarchyId" element={<PrintStation />} />
          <Route path="/inventory/register" element={<Registration />} />
          <Route path="/inventory/packing" element={<PackingStation />} />
          <Route path="/packing" element={<PackingDashboard />} />
          <Route path="/trace" element={<SearchPortal />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
}
