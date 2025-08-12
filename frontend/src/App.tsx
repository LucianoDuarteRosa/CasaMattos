import React from 'react';
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

// Serviços
import { authService } from '@/services/authService';

const theme = createTheme({
    palette: {
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

// Componente para proteger rotas
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const token = authService.getToken();
    return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
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
                                    <Layout>
                                        <Routes>
                                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                            <Route path="/dashboard" element={<DashboardPage />} />
                                            <Route path="/produtos" element={<ProdutosPage />} />
                                            <Route path="/fornecedores" element={<FornecedoresPage />} />
                                            <Route path="/ruas" element={<RuasPage />} />
                                            <Route path="/predios" element={<PrediosPage />} />
                                            <Route path="/enderecamentos" element={<EnderecamentosPage />} />
                                            <Route path="/listas" element={<ListasPage />} />
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
