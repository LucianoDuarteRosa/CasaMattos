import React, { useState } from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useTheme,
    useMediaQuery,
    Avatar,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard,
    Inventory,
    Business,
    LocationOn,
    Assignment,
    AccountCircle,
    Logout,
    Settings,
    People,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';

const drawerWidth = 240;

interface Props {
    children: React.ReactNode;
    isDarkMode?: boolean;
    toggleDarkMode?: () => void;
}

const Layout: React.FC<Props> = ({ children, isDarkMode, toggleDarkMode }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Obter dados do usuário atual
    const currentUser = authService.getCurrentUser();
    const isAdmin = currentUser?.idPerfil === 1;

    // Criar menu baseado no perfil do usuário
    const getMenuItems = () => {
        const baseItems = [
            { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
            { text: 'Produtos', icon: <Inventory />, path: '/produtos' },
            { text: 'Fornecedores', icon: <Business />, path: '/fornecedores' },
            { text: 'Ruas', icon: <LocationOn />, path: '/ruas' },
            { text: 'Prédios', icon: <LocationOn />, path: '/predios' },
            { text: 'Endereçamentos', icon: <LocationOn />, path: '/enderecamentos' },
            { text: 'Listas', icon: <Assignment />, path: '/listas' },
        ];

        // Adicionar menu de usuários apenas para administradores
        if (isAdmin) {
            baseItems.push({ text: 'Usuários', icon: <People />, path: '/usuarios' });
        }

        return baseItems;
    };

    const getSaudacao = () => {
        const hora = new Date().getHours();
        const nome = currentUser?.nickname || currentUser?.nomeCompleto || 'Usuário';

        if (hora < 12) return `Bom dia, ${nome}! ☀️`;
        if (hora < 18) return `Boa tarde, ${nome}! 🌤️`;
        return `Boa noite, ${nome}! 🌙`;
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuClick = (path: string) => {
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handlePerfil = () => {
        navigate('/perfil');
        handleProfileMenuClose();
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
        handleProfileMenuClose();
    };

    const menuItems = getMenuItems();

    const drawer = (
        <div>
            <Toolbar>
                <Typography variant="h6" noWrap component="div">
                    Casa Mattos
                </Typography>
            </Toolbar>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => handleMenuClick(item.path)}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {getSaudacao()}
                    </Typography>

                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                    >
                        <Avatar
                            sx={{ width: 32, height: 32 }}
                            src={currentUser?.imagemUrl}
                            alt={currentUser?.nomeCompleto}
                        >
                            {currentUser?.nomeCompleto?.charAt(0).toUpperCase() || <AccountCircle />}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        onClick={handleProfileMenuClose}
                    >
                        <MenuItem onClick={handlePerfil}>
                            <ListItemIcon>
                                <Settings fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Meu Perfil" />
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Sair" />
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
                aria-label="mailbox folders"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    pr: 0, // Remove padding right
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                }}
            >
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
