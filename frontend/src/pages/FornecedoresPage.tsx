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
    Grid,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { fornecedorService } from '@/services/fornecedorService';
import { IFornecedor } from '@/types';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';

interface FormData {
    razaoSocial: string;
    cnpj: string;
}

const FornecedoresPage: React.FC = () => {
    const [fornecedores, setFornecedores] = useState<IFornecedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState<IFornecedor | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [formData, setFormData] = useState<FormData>({
        razaoSocial: '',
        cnpj: '',
    });

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
            width: 140,
            minWidth: 120,
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
            setError('');
            const data = await fornecedorService.getAll();
            setFornecedores(data);
        } catch (error: any) {
            console.error('Erro ao carregar fornecedores:', error);
            setError('Erro ao carregar fornecedores. Tente novamente.');
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
            setError('');
            const data = await fornecedorService.search(searchTerm);
            setFornecedores(data);
        } catch (error: any) {
            console.error('Erro ao buscar fornecedores:', error);
            setError('Erro ao buscar fornecedores. Tente novamente.');
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
                setSuccess('Fornecedor deletado com sucesso!');
                loadFornecedores();
            } catch (error: any) {
                console.error('Erro ao deletar fornecedor:', error);
                setError('Erro ao deletar fornecedor. Tente novamente.');
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingFornecedor(null);
        setError('');
        setSuccess('');
        setFormData({
            razaoSocial: '',
            cnpj: '',
        });
    };

    const handleAdd = () => {
        setEditingFornecedor(null);
        setError('');
        setSuccess('');
        setFormData({
            razaoSocial: '',
            cnpj: '',
        });
        setOpen(true);
    };

    const handleInputChange = (field: keyof FormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');

            // Validações
            if (!formData.razaoSocial.trim()) {
                setError('Razão Social é obrigatória');
                return;
            }

            if (!formData.cnpj.trim()) {
                setError('CNPJ é obrigatório');
                return;
            }

            // Validação básica de CNPJ (apenas formato)
            const cnpjNumeros = formData.cnpj.replace(/\D/g, '');

            if (cnpjNumeros.length !== 14) {
                setError('CNPJ deve ter 14 dígitos');
                return;
            }

            const dadosParaEnvio = {
                razaoSocial: formData.razaoSocial.trim(),
                cnpj: formData.cnpj.trim(),
            };

            if (editingFornecedor) {
                await fornecedorService.update(editingFornecedor.id, dadosParaEnvio);
                setSuccess('Fornecedor atualizado com sucesso!');
            } else {
                await fornecedorService.create(dadosParaEnvio);
                setSuccess('Fornecedor criado com sucesso!');
            }

            handleClose();
            loadFornecedores();
        } catch (error: any) {
            console.error('Erro ao salvar fornecedor:', error);
            setError(error.response?.data?.message || 'Erro ao salvar fornecedor. Tente novamente.');
        }
    };

    const formatCNPJ = (cnpj: string) => {
        // Remove tudo que não é dígito
        const nums = cnpj.replace(/\D/g, '');

        // Aplica a máscara do CNPJ
        return nums.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    };

    const handleCNPJChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const formattedValue = formatCNPJ(value);
        setFormData(prev => ({
            ...prev,
            cnpj: formattedValue
        }));
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

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {/* Barra de pesquisa e botão de novo fornecedor */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <TextField
                        placeholder="Buscar fornecedores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </DialogTitle>
                <DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

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
                                onChange={handleCNPJChange}
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
        </Box>
    );
};

export default FornecedoresPage; 'react';

