import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Switch,
    FormControlLabel,
    IconButton,
} from '@mui/material';
import {
    Edit as EditIcon,
    Key as KeyIcon,
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { usuarioService } from '@/services/usuarioService';
import { IUsuario, UpdateUsuarioData, UpdateUsuarioSenhaData } from '@/types';

interface PerfilPageProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const PerfilPage: React.FC<PerfilPageProps> = ({ isDarkMode, toggleDarkMode }) => {
    const [usuario, setUsuario] = useState<IUsuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    // Estados para formulários
    const [editData, setEditData] = useState<UpdateUsuarioData>({
        nomeCompleto: '',
        nickname: '',
        email: '',
        telefone: '',
        imagemUrl: ''
    });

    const [passwordData, setPasswordData] = useState<UpdateUsuarioSenhaData>({
        senhaAtual: '',
        novaSenha: ''
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const userData = await usuarioService.getProfile();
            setUsuario(userData);
            setEditData({
                nomeCompleto: userData.nomeCompleto,
                nickname: userData.nickname,
                email: userData.email,
                telefone: userData.telefone || '',
                imagemUrl: userData.imagemUrl || ''
            });
        } catch (error: any) {
            console.error('Erro ao carregar perfil:', error);
            enqueueSnackbar('Erro ao carregar perfil do usuário', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const getSaudacao = () => {
        const hora = new Date().getHours();
        const nome = usuario?.nickname || usuario?.nomeCompleto || '';

        if (hora < 12) return `Bom dia, ${nome}! ☀️`;
        if (hora < 18) return `Boa tarde, ${nome}! 🌤️`;
        return `Boa noite, ${nome}! 🌙`;
    };

    const handleEditProfile = () => {
        setOpenEditDialog(true);
    };

    const handleChangePassword = () => {
        setPasswordData({ senhaAtual: '', novaSenha: '' });
        setOpenPasswordDialog(true);
    };

    const handleUpdateProfile = async () => {
        if (!usuario) return;

        try {
            const updatedUser = await usuarioService.update(usuario.id, editData);
            setUsuario(updatedUser);
            setOpenEditDialog(false);
            enqueueSnackbar('Perfil atualizado com sucesso!', { variant: 'success' });

            // Recarregar os dados do perfil para refletir as mudanças
            await loadUserProfile();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || 'Erro ao atualizar perfil', { variant: 'error' });
        }
    };

    const handleUpdatePassword = async () => {
        if (!usuario) return;

        if (passwordData.novaSenha.length < 6) {
            enqueueSnackbar('A nova senha deve ter pelo menos 6 caracteres', { variant: 'warning' });
            return;
        }

        try {
            await usuarioService.updatePassword(usuario.id, passwordData);
            setOpenPasswordDialog(false);
            enqueueSnackbar('Senha alterada com sucesso!', { variant: 'success' });
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || 'Erro ao alterar senha', { variant: 'error' });
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <Typography>Carregando perfil...</Typography>
            </Box>
        );
    }

    if (!usuario) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Erro ao carregar dados do usuário. Tente fazer login novamente.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            {/* Cabeçalho com saudação */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {getSaudacao()}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Gerencie suas informações pessoais e preferências
                </Typography>
            </Box>

            {/* Card do perfil */}
            <Paper sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        src={usuario.imagemUrl}
                        alt={usuario.nomeCompleto}
                        sx={{ width: 120, height: 120, mr: 3, fontSize: '3rem' }}
                    >
                        {usuario.nomeCompleto.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" gutterBottom>
                            {usuario.nomeCompleto}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            @{usuario.nickname}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {usuario.perfil?.nomePerfil || 'Perfil não definido'}
                        </Typography>
                    </Box>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={handleEditProfile}
                            sx={{ mr: 1 }}
                        >
                            Editar Perfil
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<KeyIcon />}
                            onClick={handleChangePassword}
                        >
                            Alterar Senha
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Informações do usuário */}
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Email
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {usuario.email}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Telefone
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {usuario.telefone || 'Não informado'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Status
                        </Typography>
                        <Typography variant="body1" color={usuario.ativo ? 'success.main' : 'error.main'} gutterBottom>
                            {usuario.ativo ? '✅ Ativo' : '❌ Inativo'}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Membro desde
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {formatDate(usuario.createdAt)}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Configurações do tema */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Configurações de Aparência
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton sx={{ mr: 1 }}>
                            {isDarkMode ? <DarkIcon /> : <LightIcon />}
                        </IconButton>
                        <Typography variant="body1">
                            Modo {isDarkMode ? 'Escuro' : 'Claro'}
                        </Typography>
                    </Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isDarkMode}
                                onChange={toggleDarkMode}
                                color="primary"
                            />
                        }
                        label=""
                    />
                </Box>
            </Paper>

            {/* Dialog para editar perfil */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nome Completo"
                                value={editData.nomeCompleto}
                                onChange={(e) => setEditData({ ...editData, nomeCompleto: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Apelido"
                                value={editData.nickname}
                                onChange={(e) => setEditData({ ...editData, nickname: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Telefone"
                                value={editData.telefone}
                                onChange={(e) => setEditData({ ...editData, telefone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="URL da Imagem de Perfil"
                                value={editData.imagemUrl}
                                onChange={(e) => setEditData({ ...editData, imagemUrl: e.target.value })}
                                placeholder="https://exemplo.com/minha-foto.jpg"
                                helperText="Cole o link de uma imagem para usar como foto de perfil"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleUpdateProfile} variant="contained">
                        Salvar Alterações
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para alterar senha */}
            <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Senha Atual"
                                type="password"
                                value={passwordData.senhaAtual}
                                onChange={(e) => setPasswordData({ ...passwordData, senhaAtual: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nova Senha"
                                type="password"
                                value={passwordData.novaSenha}
                                onChange={(e) => setPasswordData({ ...passwordData, novaSenha: e.target.value })}
                                required
                                helperText="A senha deve ter pelo menos 6 caracteres"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPasswordDialog(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleUpdatePassword} variant="contained">
                        Alterar Senha
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PerfilPage;
