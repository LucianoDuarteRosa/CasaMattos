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
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Visibility, Search } from '@mui/icons-material';
import { produtoService } from '@/services/produtoService';
import { fornecedorService } from '@/services/fornecedorService';
import { IProduto, IFornecedor } from '@/types';
import { IEstoqueItem } from '@/types';
import { estoqueItemService } from '@/services/estoqueItemService';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';
import { useUppercaseForm } from '@/hooks';
import { UppercaseTextField } from '@/components/UppercaseTextField';

interface FormData {
    codInterno: string;
    descricao: string;
    quantMinVenda: string;
    codBarras: string;
    custo: string;
    codFabricante: string;
    quantCaixas: string;
    idFornecedor: string;
}

const ProdutosPage: React.FC = () => {
    // Função para formatar números no padrão brasileiro
    const formatBrazilianNumber = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '') return '0,00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return '0,00';
        return num.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    // Função para formatar valores de moeda no padrão brasileiro
    const formatBrazilianCurrency = (value: number | string | null | undefined): string => {
        if (value === null || value === undefined || value === '') return 'R$ 0,00';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(num)) return 'R$ 0,00';
        return num.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };

    // Função para obter o nome do fornecedor
    const getFornecedorInfo = (idFornecedor: string | number): string => {
        if (!idFornecedor) return 'Fornecedor não informado';
        const fornecedor = fornecedores.find(f => f.id === Number(idFornecedor));
        if (fornecedor) {
            return `${fornecedor.razaoSocial} - ${formatCnpj(fornecedor.cnpj)}`;
        }
        return `Fornecedor ${idFornecedor}`;
    };

    // Função para formatar CNPJ
    const formatCnpj = (cnpj: string): string => {
        if (!cnpj) return '';
        const numbers = cnpj.replace(/\D/g, '');
        if (numbers.length === 14) {
            return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return cnpj;
    };

    // Função para converter formato brasileiro para decimal (para envio ao backend)
    const brazilianToDecimal = (value: string): string => {
        if (!value) return '';
        return value.replace(/\./g, '').replace(',', '.');
    };

    // Função para converter decimal para formato brasileiro (para exibição)
    const decimalToBrazilian = (value: string | number): string => {
        if (!value) return '';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) return '';
        return numValue.toFixed(2).replace('.', ',');
    };

    const [produtos, setProdutos] = useState<IProduto[]>([]);
    const [fornecedores, setFornecedores] = useState<IFornecedor[]>([]);
    const [estoqueItems, setEstoqueItems] = useState<IEstoqueItem[]>([]);
    const [loadingEstoqueItems, setLoadingEstoqueItems] = useState(false);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editingProduto, setEditingProduto] = useState<IProduto | null>(null);
    const [viewingProduto, setViewingProduto] = useState<IProduto | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Usar o hook personalizado para formulário com campos em maiúscula
    const { data: formData, handleChange, setData: setFormData } = useUppercaseForm(
        {
            codInterno: '',
            descricao: '',
            quantMinVenda: '',
            codBarras: '',
            custo: '',
            codFabricante: '',
            quantCaixas: '',
            idFornecedor: '',
        } as FormData,
        ['descricao'] // Descrição deve ser maiúscula
    );

    // Função helper para atualizar campos individuais
    const updateField = (field: keyof FormData, value: string) => {
        setFormData({ [field]: value });
    };

    const columns: GridColDef[] = [
        {
            field: 'codInterno',
            headerName: 'Cód. Interno',
            width: 100,
            minWidth: 80
        },
        {
            field: 'descricao',
            headerName: 'Descrição',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'codFabricante',
            headerName: 'Cód. Fab.',
            width: 150,
            minWidth: 100
        },
        {
            field: 'idFornecedor',
            headerName: 'Fornecedor',
            width: 200,
            minWidth: 120,
            valueFormatter: (params) => {
                const info = getFornecedorInfo(params.value);
                // Truncar texto longo em telas pequenas
                return info.length > 25 ? `${info.substring(0, 22)}...` : info;
            }
        },
        {
            field: 'estoque',
            headerName: 'Estoque',
            width: 80,
            minWidth: 70,
            type: 'number',
            valueFormatter: (params) => formatBrazilianNumber(params.value)
        },
        {
            field: 'deposito',
            headerName: 'Depósito',
            width: 100,
            minWidth: 80,
            type: 'number',
            valueFormatter: (params) => formatBrazilianNumber(params.value)
        },
        {
            field: 'quantMinVenda',
            headerName: 'Qtd Min',
            width: 80,
            minWidth: 70,
            type: 'number',
            valueFormatter: (params) => formatBrazilianNumber(params.value)
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 80,
            minWidth: 70,
            getActions: (params) => [
                <GridActionsCellItem
                    key="details"
                    icon={<Visibility />}
                    label="Detalhes"
                    onClick={() => handleDetails(params.row)}
                />,
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
        loadFornecedores();
    }, []);

    const loadFornecedores = async () => {
        try {
            const data = await fornecedorService.getAll();
            setFornecedores(data);
        } catch (error: any) {
            console.error('Erro ao carregar fornecedores:', error);
        }
    };

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

    const loadProdutos = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await produtoService.getAll();
            setProdutos(response.data);
        } catch (error: any) {
            console.error('Erro ao carregar produtos:', error);
            showNotification('Erro ao carregar produtos. Tente novamente.', 'error');
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
            showNotification('Erro ao buscar produtos. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (produto: IProduto) => {
        setEditingProduto(produto);
        setFormData({
            codInterno: produto.codInterno.toString(),
            descricao: produto.descricao,
            quantMinVenda: decimalToBrazilian(produto.quantMinVenda),
            codBarras: produto.codBarras || '',
            custo: produto.custo ? decimalToBrazilian(produto.custo) : '',
            codFabricante: produto.codFabricante || '',
            quantCaixas: produto.quantCaixas?.toString() || '',
            idFornecedor: produto.idFornecedor.toString(),
        });
        setOpen(true);
    };

    const handleDetails = (produto: IProduto) => {
        setViewingProduto(produto);
        setDetailsOpen(true);
        setEstoqueItems([]);
        if (produto?.id) {
            setLoadingEstoqueItems(true);
            estoqueItemService.getByProdutoId(produto.id)
                .then(setEstoqueItems)
                .catch(() => setEstoqueItems([]))
                .finally(() => setLoadingEstoqueItems(false));
        }
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
            custo: '',
            codFabricante: '',
            quantCaixas: '',
            idFornecedor: '',
        });
    };

    const handleDetailsClose = () => {
        setDetailsOpen(false);
        setViewingProduto(null);
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
            custo: '',
            codFabricante: '',
            quantCaixas: '',
            idFornecedor: '',
        });
        setOpen(true);
    };

    const handleInputChange = (field: keyof FormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        // Para campos que devem ser maiúscula, usar handleChange
        if (field === 'descricao' || field === 'codBarras') {
            handleChange(field)(event);
        } else {
            updateField(field, event.target.value);
        }
    };

    // Handler para campos numéricos com formatação brasileira
    const handleNumericInputChange = (field: keyof FormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        let value = event.target.value;

        // Permitir apenas números, vírgula e ponto
        value = value.replace(/[^0-9.,]/g, '');

        // Substituir ponto por vírgula para formatação brasileira
        value = value.replace('.', ',');

        // Evitar múltiplas vírgulas
        if ((value.match(/,/g) || []).length > 1) {
            return;
        }

        updateField(field, value);
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');

            // Validação básica
            if (!formData.codInterno || !formData.descricao || !formData.quantMinVenda ||
                !formData.idFornecedor) {
                setError('Preencha todos os campos obrigatórios');
                return;
            }

            const produtoData = {
                codInterno: parseInt(formData.codInterno),
                descricao: formData.descricao,
                quantMinVenda: parseFloat(brazilianToDecimal(formData.quantMinVenda)),
                codBarras: formData.codBarras || undefined,
                custo: formData.custo ? parseFloat(brazilianToDecimal(formData.custo)) : undefined,
                codFabricante: formData.codFabricante || undefined,
                quantCaixas: formData.quantCaixas ? parseInt(formData.quantCaixas) : undefined,
                idFornecedor: parseInt(formData.idFornecedor),
            };

            if (editingProduto) {
                await produtoService.update(editingProduto.id, produtoData);
                showNotification('Produto atualizado com sucesso!', 'success');
            } else {
                await produtoService.create(produtoData);
                showNotification('Produto criado com sucesso!', 'success');
            }

            // Recarrega os produtos para mostrar as mudanças
            await loadProdutos();

            // Fecha o diálogo imediatamente
            handleClose();

        } catch (error: any) {
            console.error('Erro ao salvar produto:', error);
            showNotification(error.response?.data?.message || 'Erro ao salvar produto. Tente novamente.', 'error');
        }
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
                Produtos
            </Typography>

            {/* Barra de pesquisa e botão de novo produto */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <UppercaseTextField
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(value) => setSearchTerm(value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        sx={{ flex: 1 }}
                        InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
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
                        onClick={loadProdutos}
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
                    Novo Produto
                </Button>
            </Box>

            <Paper sx={dataGridStyles.paperContainer}>
                <DataGrid
                    rows={produtos}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                    disableRowSelectionOnClick
                    localeText={dataGridPtBR}
                    sx={dataGridStyles.dataGridSx}
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
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel>Fornecedor</InputLabel>
                                    <Select
                                        value={formData.idFornecedor}
                                        label="Fornecedor"
                                        onChange={(e) => setFormData({ ...formData, idFornecedor: e.target.value })}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <em>Selecione um fornecedor</em>;
                                            }
                                            return getFornecedorInfo(selected);
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Selecione um fornecedor</em>
                                        </MenuItem>
                                        {fornecedores.map((fornecedor) => (
                                            <MenuItem key={fornecedor.id} value={fornecedor.id.toString()}>
                                                {fornecedor.razaoSocial} - {formatCnpj(fornecedor.cnpj)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
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
                                    value={formData.quantMinVenda}
                                    onChange={handleNumericInputChange('quantMinVenda')}
                                    placeholder="0,00"
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
                                    fullWidth
                                    label="Custo"
                                    value={formData.custo}
                                    onChange={handleNumericInputChange('custo')}
                                    placeholder="0,00"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <UppercaseTextField
                                    margin="normal"
                                    fullWidth
                                    label="Código Fabricante"
                                    value={formData.codFabricante}
                                    onChange={(value) => updateField('codFabricante', value)}
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

            {/* Modal de Detalhes */}
            <Dialog open={detailsOpen} onClose={handleDetailsClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    Detalhes do Produto
                </DialogTitle>
                <DialogContent>
                    {viewingProduto && (
                        <Box component="div">
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="ID"
                                        value={viewingProduto.id}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Código Interno"
                                        value={viewingProduto.codInterno}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Descrição"
                                        value={viewingProduto.descricao}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Quantidade Mínima de Venda"
                                        value={formatBrazilianNumber(viewingProduto.quantMinVenda)}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Código de Barras"
                                        value={viewingProduto.codBarras || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Depósito"
                                        value={
                                            viewingProduto && viewingProduto.quantCaixas && viewingProduto.quantMinVenda
                                                ? formatBrazilianNumber(Number(viewingProduto.quantCaixas) * Number(viewingProduto.quantMinVenda))
                                                : '0,00'
                                        }
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Estoque"
                                        value={formatBrazilianNumber(viewingProduto.estoque)}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Custo"
                                        value={viewingProduto.custo ? formatBrazilianCurrency(viewingProduto.custo) : 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Código Fabricante"
                                        value={viewingProduto.codFabricante || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Quantidade de Caixas"
                                        value={viewingProduto.quantCaixas || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                {/* Removido campo extra de estoque exibido, pois agora é exibido em Depósito */}
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Fornecedor"
                                        value={getFornecedorInfo(viewingProduto.idFornecedor)}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                            </Grid>
                            {/* Lista de Itens de Estoque */}
                            <Box sx={{ mt: 1, mb: 0 }}>
                                <Typography variant="h6" gutterBottom>Itens de Estoque</Typography>
                                {loadingEstoqueItems ? (
                                    <Typography>Carregando itens de estoque...</Typography>
                                ) : estoqueItems.length === 0 ? (
                                    <Typography>Nenhum item de estoque encontrado para este produto.</Typography>
                                ) : (
                                    <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Lote</th>
                                                    <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Tonalidade</th>
                                                    <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Bitola</th>
                                                    <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Quantidade</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ textAlign: 'center' }}>
                                                {estoqueItems.map(item => (
                                                    <tr key={item.id}>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.lote}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.ton}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.bit}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{formatBrazilianNumber(item.quantidade)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDetailsClose}>
                        Fechar
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

export default ProdutosPage;
