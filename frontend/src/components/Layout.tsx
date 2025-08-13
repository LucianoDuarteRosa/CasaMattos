import React, { useState, useEffect } from 'react';
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
    Person,
    People,
    DarkMode,
    LightMode,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '@/services/authService';
import { SERVER_BASE_URL } from '@/services/api';

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
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Obter dados do usuário atual e escutar mudanças no localStorage
    useEffect(() => {
        const loadUserData = async () => {
            const user = authService.getCurrentUser();

            // Se o usuário existe mas não tem imagemUrl, tentar recarregar do servidor
            if (user && !user.imagemUrl) {
                try {
                    const refreshedUser = await authService.refreshCurrentUser();
                    setCurrentUser(refreshedUser);
                } catch (error) {
                    console.error('Layout - Erro ao recarregar usuário:', error);
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(user);
            }
        };

        loadUserData();

        // Escutar mudanças no localStorage
        const handleStorageChange = () => {
            const updatedUser = authService.getCurrentUser();
            setCurrentUser(updatedUser);
        };

        window.addEventListener('storage', handleStorageChange);

        // Também escutar eventos customizados para mudanças locais
        window.addEventListener('userUpdated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userUpdated', handleStorageChange);
        };
    }, []); const isAdmin = currentUser?.idPerfil === 1;

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
                            src={currentUser?.imagemUrl ? `${SERVER_BASE_URL}${currentUser.imagemUrl}` : ''}
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
                                <Person fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Meu Perfil" />
                        </MenuItem>
                        <MenuItem onClick={toggleDarkMode}>
                            <ListItemIcon>
                                {isDarkMode ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                            </ListItemIcon>
                            <ListItemText primary={isDarkMode ? "Modo Claro" : "Modo Escuro"} />
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
