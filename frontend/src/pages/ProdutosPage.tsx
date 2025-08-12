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
import { Add, Edit } from '@mui/icons-material';
import { produtoService } from '@/services/produtoService';
import { IProduto } from '@/types';
import { dataGridPtBR } from '@/utils/dataGridLocale';

interface FormData {
    codInterno: string;
    descricao: string;
    quantMinVenda: string;
    codBarras: string;
    deposito: string;
    estoque: string;
    custo: string;
    codFabricante: string;
    quantCaixas: string;
    idFornecedor: string;
}

const ProdutosPage: React.FC = () => {
    const [produtos, setProdutos] = useState<IProduto[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingProduto, setEditingProduto] = useState<IProduto | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [formData, setFormData] = useState<FormData>({
        codInterno: '',
        descricao: '',
        quantMinVenda: '',
        codBarras: '',
        deposito: '',
        estoque: '',
        custo: '',
        codFabricante: '',
        quantCaixas: '',
        idFornecedor: '1', // Default fornecedor
    });

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'codInterno', headerName: 'Cód. Interno', width: 120 },
        { field: 'descricao', headerName: 'Descrição', width: 200, flex: 1 },
        { field: 'estoque', headerName: 'Estoque', width: 100, type: 'number' },
        { field: 'quantCaixas', headerName: 'Qtd Caixas', width: 100, type: 'number' },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 120,
            getActions: (params) => [
                <GridActionsCellItem
                    key="edit"
                    icon={<Edit />}
                    label="Editar"
                    onClick={() => handleEdit(params.row)}
                />,
            ],
        },
    ];

    useEffect(() => {
        loadProdutos();
    }, []);

    const loadProdutos = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await produtoService.getAll();
            setProdutos(response.data);
        } catch (error: any) {
            console.error('Erro ao carregar produtos:', error);
            setError('Erro ao carregar produtos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadProdutos();
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await produtoService.searchByCodigoOrNome(searchTerm);
            setProdutos(data);
        } catch (error: any) {
            console.error('Erro ao buscar produtos:', error);
            setError('Erro ao buscar produtos. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (produto: IProduto) => {
        setEditingProduto(produto);
        setFormData({
            codInterno: produto.codInterno.toString(),
            descricao: produto.descricao,
            quantMinVenda: produto.quantMinVenda.toString(),
            codBarras: produto.codBarras || '',
            deposito: produto.deposito.toString(),
            estoque: produto.estoque.toString(),
            custo: produto.custo?.toString() || '',
            codFabricante: produto.codFabricante || '',
            quantCaixas: produto.quantCaixas?.toString() || '',
            idFornecedor: produto.idFornecedor.toString(),
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingProduto(null);
        setError('');
        setSuccess('');
        setFormData({
            codInterno: '',
            descricao: '',
            quantMinVenda: '',
            codBarras: '',
            deposito: '',
            estoque: '',
            custo: '',
            codFabricante: '',
            quantCaixas: '',
            idFornecedor: '1',
        });
    };

    const handleAdd = () => {
        setEditingProduto(null);
        setError('');
        setSuccess('');
        setFormData({
            codInterno: '',
            descricao: '',
            quantMinVenda: '',
            codBarras: '',
            deposito: '',
            estoque: '',
            custo: '',
            codFabricante: '',
            quantCaixas: '',
            idFornecedor: '1',
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

            // Validação básica
            if (!formData.codInterno || !formData.descricao || !formData.quantMinVenda ||
                !formData.deposito || !formData.estoque || !formData.idFornecedor) {
                setError('Preencha todos os campos obrigatórios');
                return;
            }

            const produtoData = {
                codInterno: parseInt(formData.codInterno),
                descricao: formData.descricao,
                quantMinVenda: parseInt(formData.quantMinVenda),
                codBarras: formData.codBarras || undefined,
                deposito: parseInt(formData.deposito),
                estoque: parseInt(formData.estoque),
                custo: formData.custo ? parseFloat(formData.custo) : undefined,
                codFabricante: formData.codFabricante || undefined,
                quantCaixas: formData.quantCaixas ? parseInt(formData.quantCaixas) : undefined,
                idFornecedor: parseInt(formData.idFornecedor),
            };

            if (editingProduto) {
                await produtoService.update(editingProduto.id, produtoData);
                setSuccess('Produto atualizado com sucesso!');
            } else {
                await produtoService.create(produtoData);
                setSuccess('Produto criado com sucesso!');
            }

            await loadProdutos();

            // Fecha o diálogo após um pequeno delay para mostrar a mensagem de sucesso
            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error: any) {
            console.error('Erro ao salvar produto:', error);
            setError(error.response?.data?.message || 'Erro ao salvar produto. Tente novamente.');
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="flex-start" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Produtos
                </Typography>
            </Box>

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

            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch();
                        }
                    }}
                    sx={{ minWidth: 300 }}
                />
                <Button
                    variant="outlined"
                    onClick={handleSearch}
                >
                    Buscar
                </Button>
                <Button
                    variant="outlined"
                    onClick={loadProdutos}
                >
                    Limpar
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAdd}
                >
                    Novo Produto
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={produtos}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 25 },
                        },
                    }}
                    disableRowSelectionOnClick
                    localeText={dataGridPtBR}
                    sx={{ minWidth: 600 }}
                />
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
                <DialogContent>
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

                    <Box component="form" sx={{ mt: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Código Interno"
                                    type="number"
                                    value={formData.codInterno}
                                    onChange={handleInputChange('codInterno')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Fornecedor ID"
                                    type="number"
                                    value={formData.idFornecedor}
                                    onChange={handleInputChange('idFornecedor')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Descrição"
                                    value={formData.descricao}
                                    onChange={handleInputChange('descricao')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Quantidade Mínima de Venda"
                                    type="number"
                                    value={formData.quantMinVenda}
                                    onChange={handleInputChange('quantMinVenda')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Código de Barras"
                                    value={formData.codBarras}
                                    onChange={handleInputChange('codBarras')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Depósito"
                                    type="number"
                                    value={formData.deposito}
                                    onChange={handleInputChange('deposito')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Estoque"
                                    type="number"
                                    value={formData.estoque}
                                    onChange={handleInputChange('estoque')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Custo"
                                    type="number"
                                    inputProps={{ step: "0.01" }}
                                    value={formData.custo}
                                    onChange={handleInputChange('custo')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Código Fabricante"
                                    value={formData.codFabricante}
                                    onChange={handleInputChange('codFabricante')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Quantidade de Caixas"
                                    type="number"
                                    value={formData.quantCaixas}
                                    onChange={handleInputChange('quantCaixas')}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProdutosPage;
