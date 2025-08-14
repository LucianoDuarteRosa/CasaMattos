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
    MenuItem,
    FormControl,
    InputLabel,
    Select,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { predioService, PredioWithRua } from '@/services/predioService';
import { ruaService } from '@/services/ruaService';
import { IPredio, IRua } from '@/types';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';
import { useUppercaseForm } from '@/hooks';
import { UppercaseTextField } from '@/components/UppercaseTextField';

interface FormData {
    nomePredio: string;
    vagas: string;
    idRua: string;
}

const PrediosPage: React.FC = () => {
    const [predios, setPredios] = useState<PredioWithRua[]>([]);
    const [ruas, setRuas] = useState<IRua[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingPredio, setEditingPredio] = useState<IPredio | null>(null);

    // Usar o hook personalizado para formulário com campos em maiúscula
    const { data: formData, handleChange, setData: setFormData } = useUppercaseForm(
        { nomePredio: '', vagas: '', idRua: '' } as FormData,
        ['nomePredio'] // Nome do prédio deve ser maiúscula
    );

    // Função helper para atualizar campos individuais
    const updateField = (field: keyof FormData, value: string) => {
        setFormData({ [field]: value });
    };

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
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        await Promise.all([loadPredios(), loadRuas()]);
    };

    const loadPredios = async () => {
        try {
            setLoading(true);
            const data = await predioService.getAll();
            setPredios(data);
        } catch (error) {
            console.error('Erro ao carregar prédios:', error);
            showNotification('Erro ao carregar prédios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadRuas = async () => {
        try {
            const data = await ruaService.getAll();
            setRuas(data);
        } catch (error) {
            console.error('Erro ao carregar ruas:', error);
            showNotification('Erro ao carregar ruas', 'error');
        }
    };

    const handleSearch = async () => {
        try {
            setLoading(true);
            const data = await predioService.search(searchTerm);
            setPredios(data);
        } catch (error) {
            console.error('Erro ao buscar prédios:', error);
            showNotification('Erro ao buscar prédios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = async () => {
        setSearchTerm('');
        await loadPredios();
    };

    const handleSubmit = async () => {
        try {
            const submitData = {
                nomePredio: formData.nomePredio,
                vagas: formData.vagas ? parseInt(formData.vagas) : undefined,
                idRua: parseInt(formData.idRua)
            };

            if (editingPredio) {
                await predioService.update(editingPredio.id, submitData);
                showNotification('Prédio atualizado com sucesso!', 'success');
            } else {
                await predioService.create(submitData);
                showNotification('Prédio criado com sucesso!', 'success');
            }
            handleClose();
            await loadPredios();
        } catch (error: any) {
            console.error('Erro ao salvar prédio:', error);
            showNotification(error.response?.data?.error || 'Erro ao salvar prédio', 'error');
        }
    };

    const handleEdit = (predio: IPredio) => {
        setEditingPredio(predio);
        setFormData({
            nomePredio: predio.nomePredio,
            vagas: predio.vagas?.toString() || '',
            idRua: predio.idRua.toString(),
        });
        setOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este prédio?')) {
            try {
                await predioService.delete(id);
                showNotification('Prédio excluído com sucesso!', 'success');
                await loadPredios();
            } catch (error: any) {
                console.error('Erro ao excluir prédio:', error);
                showNotification(error.response?.data?.error || 'Erro ao excluir prédio', 'error');
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingPredio(null);
        setFormData({
            nomePredio: '',
            vagas: '',
            idRua: '',
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
            field: 'nomePredio',
            headerName: 'Nome do Prédio',
            flex: 1,
            minWidth: 250,
            sortable: true
        },
        {
            field: 'vagas',
            headerName: 'Vagas',
            width: 120,
            sortable: true,
            renderCell: (params) => params.value || '-'
        },
        {
            field: 'rua',
            headerName: 'Rua',
            flex: 1,
            minWidth: 200,
            sortable: false,
            valueGetter: (params) => {
                const ruaObj = ruas.find(r => r.id === params.row.idRua);
                return ruaObj?.nomeRua || 'Rua não encontrada';
            }
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
                Prédios
            </Typography>

            {/* Barra de pesquisa e botão de novo prédio */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <UppercaseTextField
                        placeholder="Buscar por nome do prédio..."
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
                    Novo Prédio
                </Button>
            </Box>

            <Paper sx={dataGridStyles.paperContainer}>
                <DataGrid
                    rows={predios}
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

            {/* Dialog para criar/editar prédio */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingPredio ? 'Editar Prédio' : 'Novo Prédio'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Nome do Prédio"
                            value={formData.nomePredio}
                            onChange={handleChange('nomePredio')}
                            fullWidth
                            required
                            autoFocus
                            inputProps={{ maxLength: 100 }}
                            helperText={`${formData.nomePredio.length}/100 caracteres`}
                        />

                        <TextField
                            label="Número de Vagas (opcional)"
                            value={formData.vagas}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === '' || /^\d+$/.test(value)) {
                                    updateField('vagas', value);
                                }
                            }}
                            fullWidth
                            type="number"
                            inputProps={{ min: 0 }}
                            helperText="Deixe em branco se não quiser especificar"
                        />

                        <FormControl fullWidth required>
                            <InputLabel>Rua</InputLabel>
                            <Select
                                value={formData.idRua}
                                onChange={(e) => updateField('idRua', e.target.value as string)}
                                label="Rua"
                            >
                                <MenuItem value="">
                                    <em>Selecione uma rua</em>
                                </MenuItem>
                                {ruas.map((rua) => (
                                    <MenuItem key={rua.id} value={rua.id.toString()}>
                                        {rua.nomeRua}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.nomePredio.trim() || !formData.idRua}
                    >
                        {editingPredio ? 'Atualizar' : 'Criar'}
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

export default PrediosPage;
