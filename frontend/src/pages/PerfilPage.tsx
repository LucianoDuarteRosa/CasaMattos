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
    InputAdornment,
    Snackbar,
} from '@mui/material';
import {
    Edit as EditIcon,
    Key as KeyIcon,
    Brightness4 as DarkIcon,
    Brightness7 as LightIcon,
    Upload as UploadIcon,
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { usuarioService } from '@/services/usuarioService';
import { authService } from '@/services/authService';
import { SERVER_BASE_URL } from '@/services/api';
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
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity as 'success' | 'error');
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

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

    // Estados para upload de imagem
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            showNotification('Erro ao carregar perfil do usuário', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = () => {
        setSelectedFile(null); // Limpar arquivo selecionado
        setOpenEditDialog(true);
    };

    const handleChangePassword = () => {
        setPasswordData({ senhaAtual: '', novaSenha: '' });
        setOpenPasswordDialog(true);
    };

    const handleUpdateProfile = async () => {
        if (!usuario) return;

        try {
            // Atualizar os dados do perfil incluindo a imagemUrl atual
            const updateData: UpdateUsuarioData = {
                nomeCompleto: editData.nomeCompleto,
                nickname: editData.nickname,
                email: editData.email,
                telefone: editData.telefone,
                imagemUrl: selectedFile ? '' : (editData.imagemUrl || '') // Se tem arquivo, limpar; senão, manter atual
            };

            const updatedUser = await usuarioService.update(usuario.id, updateData);

            // Se há um arquivo selecionado, fazer upload
            if (selectedFile) {
                try {
                    await usuarioService.uploadImage(usuario.id, selectedFile);
                    // Atualizar localStorage com a nova imagem
                    await authService.refreshCurrentUser();
                    showNotification('Perfil e imagem atualizados com sucesso!', 'success');
                } catch (uploadError: any) {
                    console.error('Erro no upload da imagem:', uploadError);
                    showNotification('Perfil atualizado, mas erro ao fazer upload da imagem', 'warning');
                }
            } else {
                // Se mudou nome ou outras informações, atualizar localStorage
                await authService.refreshCurrentUser();
                showNotification('Perfil atualizado com sucesso!', 'success');
            }

            setUsuario(updatedUser);
            setSelectedFile(null);
            setOpenEditDialog(false);

            // Recarregar os dados do perfil para refletir as mudanças
            await loadUserProfile();
        } catch (error: any) {
            showNotification(error.response?.data?.error || 'Erro ao atualizar perfil', 'error');
        }
    };

    const handleUpdatePassword = async () => {
        if (!usuario) return;

        if (passwordData.novaSenha.length < 6) {
            showNotification('A nova senha deve ter pelo menos 6 caracteres', 'warning');
            return;
        }

        try {
            await usuarioService.updatePassword(usuario.id, passwordData);
            setOpenPasswordDialog(false);
            showNotification('Senha alterada com sucesso!', 'success');
        } catch (error: any) {
            showNotification(error.response?.data?.error || 'Erro ao alterar senha', 'error');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    // Função para abrir URL da imagem no navegador
    const handleOpenImageUrl = () => {
        if (editData.imagemUrl) {
            const fullImageUrl = editData.imagemUrl.startsWith('http')
                ? editData.imagemUrl
                : `${SERVER_BASE_URL}${editData.imagemUrl}`;
            window.open(fullImageUrl, '_blank');
        }
    };

    // Função para selecionar arquivo de imagem
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Verificar se é uma imagem
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor, selecione apenas arquivos de imagem', 'warning');
                return;
            }

            // Verificar tamanho (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Arquivo muito grande. Tamanho máximo: 5MB', 'warning');
                return;
            }

            setSelectedFile(file);

            // Criar preview local
            const reader = new FileReader();
            reader.onload = () => {
                setEditData({
                    ...editData,
                    imagemUrl: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        }
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
            {/* Card do perfil */}
            <Paper sx={{ p: 4, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        src={usuario.imagemUrl ? `${SERVER_BASE_URL}${usuario.imagemUrl}` : ''}
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
                            <Typography variant="subtitle1" gutterBottom>
                                Imagem de Perfil
                            </Typography>
                            <TextField
                                fullWidth
                                label="URL da Imagem"
                                value={editData.imagemUrl}
                                onChange={(e) => setEditData({ ...editData, imagemUrl: e.target.value })}
                                placeholder="https://exemplo.com/minha-foto.jpg ou faça upload"
                                helperText="Cole o link de uma imagem ou use o botão para fazer upload"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleOpenImageUrl}
                                                disabled={!editData.imagemUrl}
                                                title="Abrir imagem"
                                            >
                                                <OpenInNewIcon />
                                            </IconButton>
                                            <input
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                id="upload-image"
                                                type="file"
                                                onChange={handleFileSelect}
                                            />
                                            <label htmlFor="upload-image">
                                                <IconButton component="span" title="Fazer upload">
                                                    <UploadIcon />
                                                </IconButton>
                                            </label>
                                        </InputAdornment>
                                    )
                                }}
                            />

                            {/* Preview da imagem */}
                            {editData.imagemUrl && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Avatar
                                        src={editData.imagemUrl.startsWith('data:') ? editData.imagemUrl : `${SERVER_BASE_URL}${editData.imagemUrl}`}
                                        sx={{ width: 80, height: 80 }}
                                    >
                                        {(editData.nomeCompleto || 'U').charAt(0).toUpperCase()}
                                    </Avatar>
                                </Box>
                            )}
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

            {/* Snackbar para notificações */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PerfilPage;
