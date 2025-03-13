import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import {
    AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem,
    ListItemButton, ListItemText, Toolbar, Typography, Button, ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const drawerWidth = 240;

const navItems = [
    { name: 'Dashboard', icon: <DashboardIcon /> },
    { name: 'Generate Pass', icon: <QrCode2Icon /> },
    { name: 'Scan Pass', icon: <CameraAltIcon /> },
];

const AppbarComponent = (props) => {
    const { window } = props;
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Dashboard');

    const handleDrawerToggle = () => {
        setMobileOpen((prevState) => !prevState);
    };

    const handleNavigation = (item) => {
        setActiveTab(item);
        if (item === 'Generate Pass') {
            router.push('/generate-pass');
        } else if (item === 'Scan Pass') {
            router.push('/qr-scanner');
        } else {
            router.push('/');
        }
    };

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>Holi Harmonix</Typography>
            <Divider />
            <List>
                {navItems.map(({ name, icon }) => (
                    <ListItem key={name} disablePadding>
                        <ListItemButton
                            sx={{
                                textAlign: 'center',
                                backgroundColor: activeTab === name ? '#1976d2' : 'transparent',
                                color: activeTab === name ? '#fff' : '#000',
                            }}
                            onClick={() => handleNavigation(name)}
                        >
                            <ListItemIcon sx={{ color: activeTab === name ? '#fff' : '#000' }}>
                                {icon}
                            </ListItemIcon>
                            <ListItemText primary={name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar component="nav">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}>
                        Holi Harmonix
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {navItems.map(({ name, icon }) => (
                            <Button
                                key={name}
                                sx={{ color: activeTab === name ? '#FFD700' : '#fff', fontWeight: activeTab === name ? 'bold' : 'normal' }}
                                onClick={() => handleNavigation(name)}
                                startIcon={icon}
                            >
                                {name}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </AppBar>
            <nav>
                <Drawer
                    container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>
        </Box>
    );
};

AppbarComponent.propTypes = {
    window: PropTypes.func,
};

export default AppbarComponent;
