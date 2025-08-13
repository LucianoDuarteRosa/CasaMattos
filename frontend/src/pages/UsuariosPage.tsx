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
    Paper
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Lock as LockIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { usuarioService } from '../services/usuarioService';
import { authService } from '../services/authService';
import { IUsuario, CreateUsuarioData, UpdateUsuarioData, UpdateUsuarioSenhaData, IPerfil } from '../types';
import { dataGridPtBR } from '../utils/dataGridLocale';

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
    const [formData, setFormData] = useState<CreateUsuarioData>({
        nomeCompleto: '',
        nickname: '',
        email: '',
        telefone: '',
        senha: '',
        idPerfil: 2,
        imagemUrl: ''
    });
    const [passwordData, setPasswordData] = useState<UpdateUsuarioSenhaData>({
        senhaAtual: '',
        novaSenha: ''
    });
    const [currentUser, setCurrentUser] = useState<any>(null);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);

        // Verificar se é admin
        if (user?.idPerfil !== 1) {
            enqueueSnackbar('Acesso negado. Apenas administradores podem acessar esta página.', { variant: 'error' });
            return;
        }

        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuarioService.list();
            setUsuarios(data);
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || 'Erro ao carregar usuários', { variant: 'error' });
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
            enqueueSnackbar(error.response?.data?.error || 'Erro ao buscar usuários', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (usuario?: IUsuario) => {
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
    };

    const handleSubmit = async () => {
        try {
            if (editingUsuario) {
                const updateData: UpdateUsuarioData = {
                    nomeCompleto: formData.nomeCompleto,
                    nickname: formData.nickname,
                    email: formData.email,
                    telefone: formData.telefone,
                    idPerfil: formData.idPerfil,
                    imagemUrl: formData.imagemUrl
                };
                await usuarioService.update(editingUsuario.id, updateData);
                enqueueSnackbar('Usuário atualizado com sucesso!', { variant: 'success' });
            } else {
                await usuarioService.create(formData);
                enqueueSnackbar('Usuário criado com sucesso!', { variant: 'success' });
            }
            handleCloseDialog();
            loadUsuarios();
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || 'Erro ao salvar usuário', { variant: 'error' });
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
            try {
                await usuarioService.delete(id);
                enqueueSnackbar('Usuário deletado com sucesso!', { variant: 'success' });
                loadUsuarios();
            } catch (error: any) {
                enqueueSnackbar(error.response?.data?.error || 'Erro ao deletar usuário', { variant: 'error' });
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
            enqueueSnackbar('Senha alterada com sucesso!', { variant: 'success' });
            setPasswordDialogOpen(false);
        } catch (error: any) {
            enqueueSnackbar(error.response?.data?.error || 'Erro ao alterar senha', { variant: 'error' });
        }
    };

    // Verificação de acesso de admin - adicionar debug
    useEffect(() => {
        const user = authService.getCurrentUser();
        console.log('Debug - Current user:', user);
        console.log('Debug - idPerfil:', user?.idPerfil, typeof user?.idPerfil);
        setCurrentUser(user);
    }, []);

    // Se não é admin, mostrar mensagem de acesso negado
    if (currentUser && currentUser.idPerfil !== 1) {
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
                </Alert>
            </Box>
        );
    }

    const columns: GridColDef[] = [
        {
            field: 'avatar',
            headerName: '',
            width: 60,
            renderCell: (params) => (
                <Avatar
                    src={params.row.imagemUrl}
                    sx={{ width: 32, height: 32 }}
                >
                    {params.row.nomeCompleto.charAt(0).toUpperCase()}
                </Avatar>
            ),
            sortable: false,
            filterable: false
        },
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'nomeCompleto', headerName: 'Nome Completo', width: 200 },
        { field: 'nickname', headerName: 'Nickname', width: 150 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'telefone', headerName: 'Telefone', width: 150 },
        {
            field: 'idPerfil',
            headerName: 'Perfil',
            width: 120,
            renderCell: (params) => (
                perfis.find(p => p.id === params.value)?.nomePerfil || 'Desconhecido'
            )
        },
        {
            field: 'ativo',
            headerName: 'Ativo',
            width: 100,
            renderCell: (params) => (
                <Switch checked={params.value} disabled />
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 150,
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
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            overflow: 'hidden',
            // Compensar o padding do Layout
            m: -3,
            p: { xs: 1, sm: 2 },
            maxWidth: '100vw',
            boxSizing: 'border-box'
        }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Usuários
                </Typography>

                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    mb: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    '& > *': {
                        minWidth: 'auto'
                    }
                }}>
                    <TextField
                        placeholder="Buscar usuários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        sx={{
                            flexGrow: 1,
                            minWidth: { xs: '100%', sm: '200px' },
                            maxWidth: { xs: '100%', sm: '300px' }
                        }}
                        size="small"
                    />
                    <Button
                        variant="outlined"
                        onClick={handleSearch}
                        size="small"
                    >
                        Buscar
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={loadUsuarios}
                        size="small"
                    >
                        Limpar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                        size="small"
                    >
                        Novo Usuário
                    </Button>
                </Box>
            </Box>
            <Paper sx={{
                maxHeight: 700,
                width: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <DataGrid
                    rows={usuarios}
                    columns={columns}
                    loading={loading}
                    autoHeight
                    disableRowSelectionOnClick
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } }
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    localeText={dataGridPtBR}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid rgba(224, 224, 224, 1)'
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
                            onChange={(e) => setFormData(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Nickname"
                            value={formData.nickname}
                            onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Telefone"
                            value={formData.telefone}
                            onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="URL da Imagem"
                            value={formData.imagemUrl}
                            onChange={(e) => setFormData(prev => ({ ...prev, imagemUrl: e.target.value }))}
                            margin="normal"
                        />
                        {!editingUsuario && (
                            <TextField
                                fullWidth
                                label="Senha"
                                type="password"
                                value={formData.senha}
                                onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                                margin="normal"
                                required
                            />
                        )}
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Perfil</InputLabel>
                            <Select
                                value={formData.idPerfil}
                                label="Perfil"
                                onChange={(e) => setFormData(prev => ({ ...prev, idPerfil: e.target.value as number }))}
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
        </Box>
    );
};

export default UsuariosPage;
