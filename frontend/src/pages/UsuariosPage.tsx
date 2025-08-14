import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    Alert,
    Avatar,
    Paper,
    IconButton,
    InputAdornment,
    Snackbar
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Lock as LockIcon, OpenInNew as OpenInNewIcon, Upload as UploadIcon } from '@mui/icons-material';
import { usuarioService } from '../services/usuarioService';
import { authService } from '../services/authService';
import { SERVER_BASE_URL } from '../services/api';
import { IUsuario, CreateUsuarioData, UpdateUsuarioData, UpdateUsuarioSenhaData, IPerfil } from '../types';
import { dataGridPtBR } from '../utils/dataGridLocale';
import { dataGridStyles } from '../utils/dataGridStyles';
import { UppercaseTextField } from '../components/UppercaseTextField';
import { useUppercaseForm } from '../hooks';

const UsuariosPage: React.FC = () => {
    const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [perfis] = useState<IPerfil[]>([
        { id: 1, nomePerfil: 'Administrador' },
        { id: 2, nomePerfil: 'Operador' }
    ]);
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [editingUsuario, setEditingUsuario] = useState<IUsuario | null>(null);

    // Usar o hook personalizado para formulário com campos em maiúscula
    const { data: formData, handleChange, setData: setFormData } = useUppercaseForm(
        {
            nomeCompleto: '',
            nickname: '',
            email: '',
            telefone: '',
            senha: '',
            idPerfil: 2,
            imagemUrl: ''
        } as CreateUsuarioData,
        ['nomeCompleto', 'nickname'] // Nome e nickname devem ser maiúscula
    );

    // Função helper para atualizar campos individuais
    const updateField = (field: keyof CreateUsuarioData, value: any) => {
        setFormData({ [field]: value });
    };
    const [passwordData, setPasswordData] = useState<UpdateUsuarioSenhaData>({
        senhaAtual: '',
        novaSenha: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
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

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuarioService.list();
            setUsuarios(data);
        } catch (error: any) {
            showNotification(error.response?.data?.error || 'Erro ao carregar usuários', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            await loadUsuarios();
            return;
        }

        // Filtragem local por enquanto
        try {
            setLoading(true);
            const data = await usuarioService.list();
            const filtered = data.filter(usuario =>
                usuario.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                usuario.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setUsuarios(filtered);
        } catch (error: any) {
            showNotification(error.response?.data?.error || 'Erro ao buscar usuários', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (usuario?: IUsuario) => {
        setSelectedFile(null); // Limpar arquivo selecionado
        setPreviewUrl(''); // Limpar preview URL
        if (usuario) {
            setEditingUsuario(usuario);
            setFormData({
                nomeCompleto: usuario.nomeCompleto,
                nickname: usuario.nickname,
                email: usuario.email,
                telefone: usuario.telefone || '',
                senha: '',
                idPerfil: usuario.idPerfil,
                imagemUrl: usuario.imagemUrl || ''
            });
        } else {
            setEditingUsuario(null);
            setFormData({
                nomeCompleto: '',
                nickname: '',
                email: '',
                telefone: '',
                senha: '',
                idPerfil: 2,
                imagemUrl: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingUsuario(null);
        setSelectedFile(null);
        // Limpar preview URL para evitar memory leaks
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl('');
        }
    };

    const handleSubmit = async () => {
        try {
            let savedUsuario: IUsuario;

            if (editingUsuario) {
                const updateData: UpdateUsuarioData = {
                    nomeCompleto: formData.nomeCompleto,
                    nickname: formData.nickname,
                    email: formData.email,
                    telefone: formData.telefone,
                    idPerfil: formData.idPerfil,
                    imagemUrl: selectedFile ? (editingUsuario.imagemUrl || '') : (formData.imagemUrl || editingUsuario.imagemUrl || '')
                };
                savedUsuario = await usuarioService.update(editingUsuario.id, updateData);

                // Se há um arquivo selecionado, fazer upload
                if (selectedFile) {
                    try {
                        await usuarioService.uploadImage(editingUsuario.id, selectedFile);
                        showNotification('Usuário e imagem atualizados com sucesso!', 'success');
                    } catch (uploadError) {
                        showNotification('Usuário atualizado, mas erro ao fazer upload da imagem', 'warning');
                    }
                } else {
                    showNotification('Usuário atualizado com sucesso!', 'success');
                }

                // Se é o próprio usuário logado, sempre atualizar dados no localStorage
                if (currentUser && currentUser.id === editingUsuario.id) {
                    try {
                        await authService.refreshCurrentUser();
                    } catch (refreshError) {
                        // Erro silencioso ao recarregar dados do usuário
                    }
                }
            } else {
                const createData: CreateUsuarioData = {
                    nomeCompleto: formData.nomeCompleto,
                    nickname: formData.nickname,
                    email: formData.email,
                    telefone: formData.telefone,
                    senha: formData.senha,
                    idPerfil: formData.idPerfil,
                    imagemUrl: selectedFile ? '' : (formData.imagemUrl || '') // Se tem arquivo, limpar; senão, usar valor do form
                };

                savedUsuario = await usuarioService.create(createData);

                // Se há um arquivo selecionado, fazer upload
                if (selectedFile) {
                    try {
                        await usuarioService.uploadImage(savedUsuario.id, selectedFile);

                        // Se é o próprio usuário logado (improvável para criação, mas por segurança)
                        if (currentUser && currentUser.id === savedUsuario.id) {
                            try {
                                await authService.refreshCurrentUser();
                            } catch (refreshError) {
                                // Erro silencioso ao recarregar dados do usuário
                            }
                        }
                        showNotification('Usuário criado e imagem enviada com sucesso!', 'success');
                    } catch (uploadError) {
                        showNotification('Usuário criado, mas erro ao fazer upload da imagem', 'warning');
                    }
                } else {
                    showNotification('Usuário criado com sucesso!', 'success');
                }
            }

            handleCloseDialog();
            loadUsuarios();
        } catch (error: any) {
            showNotification(error.response?.data?.error || 'Erro ao salvar usuário', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
            try {
                await usuarioService.delete(id);
                showNotification('Usuário deletado com sucesso!', 'success');
                loadUsuarios();
            } catch (error: any) {
                showNotification(error.response?.data?.error || 'Erro ao deletar usuário', 'error');
            }
        }
    };

    const handleOpenPasswordDialog = (usuario: IUsuario) => {
        setEditingUsuario(usuario);
        setPasswordData({ senhaAtual: '', novaSenha: '' });
        setPasswordDialogOpen(true);
    };

    const handleUpdatePassword = async () => {
        if (!editingUsuario) return;

        try {
            await usuarioService.updatePassword(editingUsuario.id, passwordData);
            showNotification('Senha alterada com sucesso!', 'success');
            setPasswordDialogOpen(false);
        } catch (error: any) {
            showNotification(error.response?.data?.error || 'Erro ao alterar senha', 'error');
        }
    };

    // Função para abrir URL da imagem no navegador
    const handleOpenImageUrl = () => {
        if (formData.imagemUrl) {
            const fullImageUrl = formData.imagemUrl.startsWith('http')
                ? formData.imagemUrl
                : `${SERVER_BASE_URL}${formData.imagemUrl}`;
            window.open(fullImageUrl, '_blank');
        }
    };

    // Estado para preview da imagem sem base64
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Função para selecionar arquivo de imagem
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Verificar se é uma imagem
            if (!file.type.startsWith('image/')) {
                showNotification('Por favor, selecione apenas arquivos de imagem', 'error');
                return;
            }

            // Verificar tamanho do arquivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('O arquivo deve ter no máximo 5MB', 'error');
                return;
            }

            // Limpar preview anterior se existir
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            // Salvar o arquivo selecionado
            setSelectedFile(file);

            // Criar URL temporária para preview (sem base64)
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Não limpar a imagemUrl do formData para preservar a URL original
        }
    };

    // Verificação de acesso de admin
    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);

        // Só carregar usuários se for admin
        if (user && user.idPerfil === 1) {
            loadUsuarios();
        }
    }, []);

    // Se o usuário ainda não foi carregado, mostra loading
    if (!currentUser) {
        return <Box>Carregando...</Box>;
    }

    // Se não é admin, mostrar mensagem de acesso negado
    if (currentUser.idPerfil !== 1) {
        return (
            <Box
                sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    margin: -3,
                    padding: { xs: 2, sm: 3, md: 4 }
                }}
            >
                <Alert severity="error">
                    Acesso negado. Apenas administradores podem acessar esta página.
                    <br />
                    Seu perfil: {currentUser.idPerfil} - Tipo: {typeof currentUser.idPerfil}
                </Alert>
            </Box>
        );
    }

    const handleToggleAtivo = async (id: number, currentValue: boolean) => {
        // Impedir que o usuário logado se desative
        if (currentUser && currentUser.id === id && currentValue) {
            showNotification('Você não pode desativar sua própria conta', 'error');
            return;
        }

        // Se está desativando um usuário, pedir confirmação
        if (currentValue && !window.confirm('Tem certeza que deseja desativar este usuário?')) {
            return;
        }

        try {
            // Buscar os dados atuais do usuário
            const usuario = usuarios.find(u => u.id === id);
            if (!usuario) return;

            const updateData: UpdateUsuarioData = {
                nomeCompleto: usuario.nomeCompleto,
                nickname: usuario.nickname,
                email: usuario.email,
                telefone: usuario.telefone,
                idPerfil: usuario.idPerfil,
                imagemUrl: usuario.imagemUrl || '', // Sempre incluir a URL atual
                ativo: !currentValue // Alternar o valor
            };

            await usuarioService.update(id, updateData);
            showNotification(`Usuário ${!currentValue ? 'ativado' : 'desativado'} com sucesso!`, 'success');
            loadUsuarios();
        } catch (error: any) {
            showNotification(error.response?.data?.error || 'Erro ao alterar status do usuário', 'error');
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'avatar',
            headerName: '',
            width: 80,
            flex: 0,
            renderCell: (params) => (
                <Avatar
                    src={params.row.imagemUrl ? `${SERVER_BASE_URL}${params.row.imagemUrl}` : ''}
                    sx={{ width: 32, height: 32 }}
                >
                    {params.row.nomeCompleto.charAt(0).toUpperCase()}
                </Avatar>
            ),
            sortable: false,
            filterable: false
        },
        { field: 'id', headerName: 'ID', width: 70, flex: 0 },
        { field: 'nomeCompleto', headerName: 'Nome Completo', flex: 1, minWidth: 200 },
        { field: 'nickname', headerName: 'Nickname', flex: 0.8, minWidth: 150 },
        { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
        { field: 'telefone', headerName: 'Telefone', flex: 0.8, minWidth: 150 },
        {
            field: 'idPerfil',
            headerName: 'Perfil',
            flex: 0.6,
            minWidth: 120,
            renderCell: (params) => (
                perfis.find(p => p.id === params.value)?.nomePerfil || 'Desconhecido'
            )
        },
        {
            field: 'ativo',
            headerName: 'Ativo',
            width: 100,
            flex: 0,
            renderCell: (params) => (
                <Switch
                    checked={params.value}
                    onChange={() => handleToggleAtivo(params.row.id, params.value)}
                    color="primary"
                    disabled={currentUser && currentUser.id === params.row.id}
                />
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            flex: 0.8,
            minWidth: 150,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<EditIcon />}
                    label="Editar"
                    onClick={() => handleOpenDialog(params.row)}
                />,
                <GridActionsCellItem
                    icon={<LockIcon />}
                    label="Alterar Senha"
                    onClick={() => handleOpenPasswordDialog(params.row)}
                />,
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Deletar"
                    onClick={() => handleDelete(params.row.id)}
                    disabled={params.row.id === currentUser?.id}
                />
            ]
        }
    ];

    return (
        <Box sx={{
            width: '100%',
            overflow: 'hidden',
            m: -1.5,
            p: { xs: 1, sm: 2 },
            maxWidth: '100vw',
            boxSizing: 'border-box'
        }}>
            <Typography variant="h4" gutterBottom>
                Usuários
            </Typography>

            {/* Barra de pesquisa e botão de novo usuário */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <UppercaseTextField
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(value) => setSearchTerm(value)}
                        sx={{ flex: 1 }}
                    />
                    <Button
                        variant="outlined"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        Buscar
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={loadUsuarios}
                        disabled={loading}
                    >
                        Limpar
                    </Button>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                    sx={{ minWidth: '120px' }}
                    size="medium"
                >
                    Novo Usuário
                </Button>
            </Box>
            <Paper sx={dataGridStyles.paperContainer}>
                <DataGrid
                    rows={usuarios}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 25 },
                        },
                    }}
                    disableRowSelectionOnClick
                    localeText={dataGridPtBR}
                    sx={{
                        ...dataGridStyles.dataGridSx,
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        }
                    }}
                />
            </Paper>


            {/* Dialog para Criar/Editar Usuário */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Nome Completo"
                            value={formData.nomeCompleto}
                            onChange={handleChange('nomeCompleto')}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Nickname"
                            value={formData.nickname}
                            onChange={handleChange('nickname')}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateField('email', e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Telefone"
                            value={formData.telefone}
                            onChange={(e) => updateField('telefone', e.target.value)}
                            margin="normal"
                        />

                        {/* Campo de URL da Imagem com botões de funcionalidade */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'end', mt: 2 }}>
                            <TextField
                                fullWidth
                                label="URL da Imagem"
                                value={formData.imagemUrl}
                                onChange={(e) => updateField('imagemUrl', e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleOpenImageUrl}
                                                disabled={!formData.imagemUrl}
                                                title="Abrir imagem no navegador"
                                            >
                                                <OpenInNewIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="image-upload"
                                type="file"
                                onChange={handleFileSelect}
                            />
                            <label htmlFor="image-upload">
                                <IconButton
                                    component="span"
                                    title="Selecionar arquivo de imagem"
                                    sx={{ mb: 1 }}
                                >
                                    <UploadIcon />
                                </IconButton>
                            </label>
                        </Box>

                        {/* Preview da imagem */}
                        {(formData.imagemUrl || previewUrl) && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <Avatar
                                    src={previewUrl || (formData.imagemUrl?.startsWith('data:') ? formData.imagemUrl : `${SERVER_BASE_URL}${formData.imagemUrl}`)}
                                    sx={{ width: 80, height: 80 }}
                                >
                                    {formData.nomeCompleto.charAt(0).toUpperCase()}
                                </Avatar>
                            </Box>
                        )}
                        {!editingUsuario && (
                            <TextField
                                fullWidth
                                label="Senha"
                                type="password"
                                value={formData.senha}
                                onChange={(e) => updateField('senha', e.target.value)}
                                margin="normal"
                                required
                            />
                        )}
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Perfil</InputLabel>
                            <Select
                                value={formData.idPerfil}
                                label="Perfil"
                                onChange={(e) => updateField('idPerfil', e.target.value as number)}
                            >
                                {perfis.map(perfil => (
                                    <MenuItem key={perfil.id} value={perfil.id}>
                                        {perfil.nomePerfil}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingUsuario ? 'Atualizar' : 'Criar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para Alterar Senha */}
            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Alterar Senha</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Como administrador, você pode alterar a senha sem informar a senha atual.
                        </Alert>
                        <TextField
                            fullWidth
                            label="Nova Senha"
                            type="password"
                            value={passwordData.novaSenha}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, novaSenha: e.target.value }))}
                            margin="normal"
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordDialogOpen(false)}>Cancelar</Button>
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

export default UsuariosPage;
