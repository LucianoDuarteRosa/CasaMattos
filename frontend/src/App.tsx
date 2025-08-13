import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';

// Componentes
import Layout from '@/components/Layout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ProdutosPage from '@/pages/ProdutosPage';
import FornecedoresPage from '@/pages/FornecedoresPage';
import RuasPage from '@/pages/RuasPage';
import PrediosPage from '@/pages/PrediosPage';
import EnderecamentosPage from '@/pages/EnderecamentosPage';
import ListasPage from '@/pages/ListasPage';
import UsuariosPage from '@/pages/UsuariosPage';
import PerfilPage from '@/pages/PerfilPage';

// Serviços
import { authService } from '@/services/authService';

// Componente para proteger rotas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = authService.getToken();
    return token ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para rotas de administrador
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const user = authService.getCurrentUser();
    const isAdmin = user?.idPerfil === 1;

    return isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    const theme = createTheme({
        palette: {
            mode: isDarkMode ? 'dark' : 'light',
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
        },
        typography: {
            fontFamily: 'Roboto, Arial, sans-serif',
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <SnackbarProvider maxSnack={3}>
                <Router>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/*"
                            element={
                                <PrivateRoute>
                                    <Layout isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode}>
                                        <Routes>
                                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                            <Route path="/dashboard" element={<DashboardPage />} />
                                            <Route path="/produtos" element={<ProdutosPage />} />
                                            <Route path="/fornecedores" element={<FornecedoresPage />} />
                                            <Route path="/ruas" element={<RuasPage />} />
                                            <Route path="/predios" element={<PrediosPage />} />
                                            <Route path="/enderecamentos" element={<EnderecamentosPage />} />
                                            <Route path="/listas" element={<ListasPage />} />
                                            <Route
                                                path="/usuarios"
                                                element={
                                                    <AdminRoute>
                                                        <UsuariosPage />
                                                    </AdminRoute>
                                                }
                                            />
                                            <Route
                                                path="/perfil"
                                                element={
                                                    <PerfilPage
                                                        isDarkMode={isDarkMode}
                                                        toggleDarkMode={toggleDarkMode}
                                                    />
                                                }
                                            />
                                        </Routes>
                                    </Layout>
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </Router>
            </SnackbarProvider>
        </ThemeProvider>
    );
};

export default App;
