import React, { useState } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    Container,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, Login } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/authService';
import { ILoginRequest } from '@/types';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginRequest>();

    const onSubmit = async (data: ILoginRequest) => {
        try {
            setLoading(true);
            setError('');

            const response = await authService.login(data);
            authService.setAuthData(response.token, response.usuario);

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh',
                    justifyContent: 'center',
                }}
            >
                <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Login sx={{ m: 1, bgcolor: 'primary.main', borderRadius: '50%', p: 1, color: 'white', fontSize: 40 }} />
                        <Typography component="h1" variant="h4" gutterBottom>
                            Armazenamento
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Sistema de Gestão
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                {...register('email', {
                                    required: 'Email é obrigatório',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Email inválido',
                                    },
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Senha"
                                type={showPassword ? 'text' : 'password'}
                                id="senha"
                                autoComplete="current-password"
                                {...register('senha', {
                                    required: 'Senha é obrigatória',
                                    minLength: {
                                        value: 6,
                                        message: 'Senha deve ter pelo menos 6 caracteres',
                                    },
                                })}
                                error={!!errors.senha}
                                helperText={errors.senha?.message}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;
