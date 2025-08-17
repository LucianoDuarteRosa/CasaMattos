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
    Grid,
    Snackbar,
    Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { fornecedorService } from '@/services/fornecedorService';
import { IFornecedor } from '@/types';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';
import { useUppercaseForm } from '@/hooks';
import { UppercaseTextField } from '@/components/UppercaseTextField';

interface FormData {
    razaoSocial: string;
    cnpj: string;
}

const FornecedoresPage: React.FC = () => {
    const [fornecedores, setFornecedores] = useState<IFornecedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState<IFornecedor | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Usar o hook personalizado para formulário com campos em maiúscula
    const { data: formData, handleChange, setData: setFormData } = useUppercaseForm(
        { razaoSocial: '', cnpj: '' } as FormData,
        ['razaoSocial'] // Apenas razaoSocial deve ser maiúscula, CNPJ mantém formatação original
    );

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

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 60,
            minWidth: 50
        },
        {
            field: 'razaoSocial',
            headerName: 'Razão Social',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'cnpj',
            headerName: 'CNPJ',
            width: 170,
            minWidth: 150,
            valueFormatter: (params) => {
                const formatted = formatCNPJ(params.value || '');
                // Truncar CNPJ em telas muito pequenas
                return formatted.length > 18 ? `${formatted.substring(0, 15)}...` : formatted;
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 80,
            minWidth: 70,
            getActions: (params) => [
                <GridActionsCellItem
                    key="edit"
                    icon={<Edit />}
                    label="Editar"
                    onClick={() => handleEdit(params.row)}
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={<Delete />}
                    label="Deletar"
                    onClick={() => handleDelete(params.row)}
                />,
            ],
        },
    ];

    useEffect(() => {
        loadFornecedores();
    }, []);

    const loadFornecedores = async () => {
        try {
            setLoading(true);
            const data = await fornecedorService.getAll();
            setFornecedores(data);
        } catch (error: any) {
            console.error('Erro ao carregar fornecedores:', error);
            showNotification('Erro ao carregar fornecedores. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadFornecedores();
            return;
        }

        try {
            setLoading(true);
            const data = await fornecedorService.search(searchTerm);
            setFornecedores(data);
        } catch (error: any) {
            console.error('Erro ao buscar fornecedores:', error);
            showNotification('Erro ao buscar fornecedores. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (fornecedor: IFornecedor) => {
        setEditingFornecedor(fornecedor);
        setFormData({
            razaoSocial: fornecedor.razaoSocial,
            cnpj: fornecedor.cnpj,
        });
        setOpen(true);
    };

    const handleDelete = async (fornecedor: IFornecedor) => {
        if (window.confirm(`Tem certeza que deseja deletar o fornecedor "${fornecedor.razaoSocial}"?`)) {
            try {
                await fornecedorService.delete(fornecedor.id);
                showNotification('Fornecedor deletado com sucesso!', 'success');
                loadFornecedores();
            } catch (error: any) {
                console.error('Erro ao deletar fornecedor:', error);
                showNotification('Erro ao deletar fornecedor. Tente novamente.', 'error');
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingFornecedor(null);
        setFormData({
            razaoSocial: '',
            cnpj: '',
        });
    };

    const handleAdd = () => {
        setEditingFornecedor(null);
        setFormData({
            razaoSocial: '',
            cnpj: '',
        });
        setOpen(true);
    };

    const handleInputChange = (field: keyof FormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (field === 'cnpj') {
            const value = event.target.value;
            const formattedValue = formatCNPJ(value);
            setFormData({ cnpj: formattedValue });
        } else {
            // Para outros campos, usar o handler que aplica maiúscula automaticamente
            handleChange(field)(event);
        }
    };

    const handleSubmit = async () => {
        try {
            // Validações
            if (!formData.razaoSocial.trim()) {
                showNotification('Razão Social é obrigatória', 'error');
                return;
            }

            if (!formData.cnpj.trim()) {
                showNotification('CNPJ é obrigatório', 'error');
                return;
            }

            // Validação básica de CNPJ (apenas formato)
            const cnpjNumeros = formData.cnpj.replace(/\D/g, '');

            if (cnpjNumeros.length !== 14) {
                showNotification('CNPJ deve ter 14 dígitos', 'error');
                return;
            }

            const dadosParaEnvio = {
                razaoSocial: formData.razaoSocial.trim(),
                cnpj: formData.cnpj.trim(),
            };

            if (editingFornecedor) {
                await fornecedorService.update(editingFornecedor.id, dadosParaEnvio);
                showNotification('Fornecedor atualizado com sucesso!', 'success');
            } else {
                await fornecedorService.create(dadosParaEnvio);
                showNotification('Fornecedor criado com sucesso!', 'success');
            }

            handleClose();
            loadFornecedores();
        } catch (error: any) {
            console.error('Erro ao salvar fornecedor:', error);
            showNotification(error.response?.data?.message || 'Erro ao salvar fornecedor. Tente novamente.', 'error');
        }
    };

    const formatCNPJ = (cnpj: string) => {
        // Remove tudo que não é dígito
        const nums = cnpj.replace(/\D/g, '');

        // Aplica a máscara do CNPJ
        return nums.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

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
                Fornecedores
            </Typography>

            {/* Barra de pesquisa e botão de novo fornecedor */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <UppercaseTextField
                        placeholder="Buscar fornecedores..."
                        value={searchTerm}
                        onChange={(value) => setSearchTerm(value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
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
                        onClick={loadFornecedores}
                        disabled={loading}
                    >
                        Limpar
                    </Button>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAdd}
                    sx={{ minWidth: '120px' }}
                    size="medium"
                >
                    Novo Fornecedor
                </Button>
            </Box>

            <Paper sx={dataGridStyles.paperContainer}>
                <DataGrid
                    rows={fornecedores}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                    disableRowSelectionOnClick
                    localeText={dataGridPtBR}
                    sx={dataGridStyles.dataGridSx}
                />
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Razão Social *"
                                value={formData.razaoSocial}
                                onChange={handleInputChange('razaoSocial')}
                                placeholder="Digite a razão social"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="CNPJ *"
                                value={formData.cnpj}
                                onChange={handleInputChange('cnpj')}
                                placeholder="00.000.000/0000-00"
                                inputProps={{ maxLength: 18 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.razaoSocial.trim() || !formData.cnpj.trim()}
                    >
                        {editingFornecedor ? 'Salvar' : 'Criar'}
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

export default FornecedoresPage; 'react';

