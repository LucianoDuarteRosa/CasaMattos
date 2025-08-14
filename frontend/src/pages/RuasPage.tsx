import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Alert,
    Snackbar,
    Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { ruaService } from '@/services/ruaService';
import { IRua } from '@/types';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';
import { useUppercaseForm } from '@/hooks';

interface FormData {
    nomeRua: string;
}

const RuasPage: React.FC = () => {
    const [ruas, setRuas] = useState<IRua[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingRua, setEditingRua] = useState<IRua | null>(null);

    // Usar o hook personalizado para formulário com campos em maiúscula
    const { data: formData, handleChange, setData: setFormData } = useUppercaseForm(
        { nomeRua: '' } as FormData,
        ['nomeRua'] // Nome da rua deve ser maiúscula
    );

    const [searchTerm, setSearchTerm] = useState('');
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

    useEffect(() => {
        loadRuas();
    }, []);

    const loadRuas = async () => {
        try {
            setLoading(true);
            const data = await ruaService.getAll();
            setRuas(data);
        } catch (error) {
            console.error('Erro ao carregar ruas:', error);
            showNotification('Erro ao carregar ruas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const data = await ruaService.search(searchTerm);
            setRuas(data);
        } catch (error) {
            console.error('Erro ao buscar ruas:', error);
            showNotification('Erro ao buscar ruas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = async () => {
        setSearchTerm('');
        await loadRuas();
    };

    const handleSubmit = async () => {
        try {
            if (editingRua) {
                await ruaService.update(editingRua.id, formData);
                showNotification('Rua atualizada com sucesso!', 'success');
            } else {
                await ruaService.create(formData);
                showNotification('Rua criada com sucesso!', 'success');
            }
            handleClose();
            await loadRuas();
        } catch (error: any) {
            console.error('Erro ao salvar rua:', error);
            showNotification(error.response?.data?.error || 'Erro ao salvar rua', 'error');
        }
    };

    const handleEdit = (rua: IRua) => {
        setEditingRua(rua);
        setFormData({
            nomeRua: rua.nomeRua,
        });
        setOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta rua?')) {
            try {
                await ruaService.delete(id);
                showNotification('Rua excluída com sucesso!', 'success');
                await loadRuas();
            } catch (error: any) {
                console.error('Erro ao excluir rua:', error);
                showNotification(error.response?.data?.error || 'Erro ao excluir rua', 'error');
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingRua(null);
        setFormData({
            nomeRua: '',
        });
    };

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 90,
            sortable: true
        },
        {
            field: 'nomeRua',
            headerName: 'Nome da Rua',
            flex: 1,
            minWidth: 300,
            sortable: true
        },
        {
            field: 'actions',
            headerName: 'Ações',
            type: 'actions',
            width: 120,
            getActions: (params) => [
                <GridActionsCellItem
                    key="edit"
                    icon={
                        <Tooltip title="Editar">
                            <Edit />
                        </Tooltip>
                    }
                    label="Editar"
                    onClick={() => handleEdit(params.row)}
                    color="inherit"
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={
                        <Tooltip title="Excluir">
                            <Delete />
                        </Tooltip>
                    }
                    label="Excluir"
                    onClick={() => handleDelete(params.row.id)}
                    color="inherit"
                />,
            ],
        },
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
                Ruas
            </Typography>

            {/* Barra de pesquisa e botão de nova rua */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <TextField
                        placeholder="Buscar por nome da rua..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
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
                        onClick={handleClearSearch}
                        disabled={loading}
                    >
                        Limpar
                    </Button>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                    sx={{ minWidth: '120px' }}
                    size="medium"
                >
                    Nova Rua
                </Button>
            </Box>

            <Paper sx={dataGridStyles.paperContainer}>
                <DataGrid
                    rows={ruas}
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
                    sx={dataGridStyles.dataGridSx}
                />
            </Paper>

            {/* Dialog para criar/editar rua */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingRua ? 'Editar Rua' : 'Nova Rua'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Nome da Rua"
                            value={formData.nomeRua}
                            onChange={handleChange('nomeRua')}
                            fullWidth
                            required
                            autoFocus
                            inputProps={{ maxLength: 100 }}
                            helperText={`${formData.nomeRua.length}/100 caracteres`}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.nomeRua.trim()}
                    >
                        {editingRua ? 'Atualizar' : 'Criar'}
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

export default RuasPage;
