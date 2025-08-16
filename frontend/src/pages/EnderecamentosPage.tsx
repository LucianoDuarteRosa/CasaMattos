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
    Checkbox,
    FormControlLabel,
    Autocomplete,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { enderecamentoService, EnderecamentoWithRelations } from '@/services/enderecamentoService';
import { produtoService } from '@/services/produtoService';
import { predioService, PredioWithRua } from '@/services/predioService';
import { IProduto } from '@/types';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';

interface FormData {
    codigoBarras: string;
    codigoInterno: string;
    tonalidade: string;
    bitola: string;
    lote: string;
    observacao: string;
    quantCaixas: string;
    quantidadeAdicoes: string;
    disponivel: boolean;
    idProduto: string;
    idPredio: string;
}

const EnderecamentosPage: React.FC = () => {
    const [enderecamentos, setEnderecamentos] = useState<EnderecamentoWithRelations[]>([]);
    const [produtos, setProdutos] = useState<IProduto[]>([]);
    const [predios, setPredios] = useState<PredioWithRua[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [editingEnderecamento, setEditingEnderecamento] = useState<EnderecamentoWithRelations | null>(null);
    const [viewingEnderecamento, setViewingEnderecamento] = useState<EnderecamentoWithRelations | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
    const [formData, setFormData] = useState<FormData>({
        codigoBarras: '',
        codigoInterno: '',
        tonalidade: '',
        bitola: '',
        lote: '',
        observacao: '',
        quantCaixas: '',
        quantidadeAdicoes: '1',
        disponivel: true,
        idProduto: '',
        idPredio: '',
    });

    // Função para obter informações do produto
    const getProdutoInfo = (produto?: IProduto): string => {
        if (!produto) return 'Produto não encontrado';
        const codBarras = produto.codBarras ? ` | ${produto.codBarras}` : '';
        const codFabricante = produto.codFabricante ? ` | ${produto.codFabricante}` : '';
        return `${produto.codInterno} - ${produto.descricao}${codBarras}${codFabricante}`;
    };

    // Função para obter informações do prédio com rua
    const getPredioInfo = (predio?: PredioWithRua): string => {
        if (!predio) return 'Prédio não encontrado';
        const rua = predio.rua?.nomeRua || 'Rua não informada';
        return `${rua} - ${predio.nomePredio}`;
    };

    const columns: GridColDef[] = [
        {
            field: 'produto',
            headerName: 'Código',
            width: 90,
            minWidth: 80,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto ? produto.codInterno : 'N/A';
            }
        },
        {
            field: 'produtoDesc',
            headerName: 'Produto',
            flex: 1,
            minWidth: 150,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto ? produto.descricao : 'N/A';
            }
        },
        {
            field: 'tonalidade',
            headerName: 'Tonalidade',
            width: 90,
            minWidth: 80
        },
        {
            field: 'bitola',
            headerName: 'Bitola',
            width: 90,
            minWidth: 80
        },
        {
            field: 'predio',
            headerName: 'Localização',
            width: 150,
            minWidth: 120,
            valueGetter: (params) => {
                const predio = params.row.predio;
                if (!predio) return 'N/A';
                const rua = predio.rua?.nomeRua || 'Rua N/I';
                return `${rua} - ${predio.nomePredio}`;
            }
        },
        {
            field: 'idLista',
            headerName: 'Lista',
            minWidth: 70,
            valueFormatter: (params) => params.value || 'Livre'
        },
        {
            field: 'quantCaixas',
            headerName: 'Qtd Caixas',
            width: 100,
            minWidth: 80,
            type: 'number',
            valueFormatter: (params) => params.value || 'N/I'
        },
        {
            field: 'disponivel',
            headerName: 'Qtd Min Venda',
            width: 120,
            minWidth: 90,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.quantMinVenda || 'N/A';
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 110,
            minWidth: 70,
            getActions: (params) => {
                const actions = [
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
                ];

                // Só adiciona o botão de excluir se não estiver em uma lista
                if (!params.row.idLista) {
                    actions.push(
                        <GridActionsCellItem
                            key="delete"
                            icon={<Delete />}
                            label="Excluir"
                            onClick={() => handleDelete(params.row.id)}
                        />
                    );
                }

                return actions;
            },
        },
    ];

    useEffect(() => {
        loadEnderecamentos();
        loadProdutos();
        loadPredios();
    }, [showOnlyAvailable]);

    const loadProdutos = async () => {
        try {
            const data = await produtoService.getAll();
            setProdutos(data.data);
        } catch (error: any) {
            console.error('Erro ao carregar produtos:', error);
        }
    };

    const loadPredios = async () => {
        try {
            const data = await predioService.getAll();
            setPredios(data);
        } catch (error: any) {
            console.error('Erro ao carregar prédios:', error);
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

    const loadEnderecamentos = async () => {
        try {
            setLoading(true);
            setError('');
            const data = showOnlyAvailable
                ? await enderecamentoService.getDisponiveis()
                : await enderecamentoService.getAll();
            setEnderecamentos(data);
        } catch (error: any) {
            console.error('Erro ao carregar endereçamentos:', error);
            showNotification('Erro ao carregar endereçamentos. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadEnderecamentos();
            return;
        }

        try {
            setLoading(true);
            setError('');
            const data = await enderecamentoService.searchByCodigoOuDescricao(searchTerm);
            setEnderecamentos(data);
        } catch (error: any) {
            console.error('Erro ao buscar endereçamentos:', error);
            showNotification('Erro ao buscar endereçamentos. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (enderecamento: EnderecamentoWithRelations) => {
        setEditingEnderecamento(enderecamento);

        // Pré-carregar quantidade de caixas do produto se não houver valor específico
        const produto = produtos.find(p => p.id === enderecamento.idProduto);
        const quantCaixasDefault = produto?.quantCaixas?.toString() || '';

        setFormData({
            codigoBarras: enderecamento.produto?.codBarras || '',
            codigoInterno: enderecamento.produto?.codInterno?.toString() || '',
            tonalidade: enderecamento.tonalidade,
            bitola: enderecamento.bitola,
            lote: enderecamento.lote || '',
            observacao: enderecamento.observacao || '',
            quantCaixas: enderecamento.quantCaixas?.toString() || quantCaixasDefault,
            quantidadeAdicoes: '1',
            disponivel: enderecamento.disponivel,
            idProduto: enderecamento.idProduto.toString(),
            idPredio: enderecamento.idPredio.toString(),
        });
        setOpen(true);
    };

    const handleDetails = (enderecamento: EnderecamentoWithRelations) => {
        setViewingEnderecamento(enderecamento);
        setDetailsOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este endereçamento?')) {
            try {
                // Buscar o endereçamento que será excluído para obter os dados do produto
                const enderecamentoParaExcluir = enderecamentos.find(e => e.id === id);
                if (!enderecamentoParaExcluir) {
                    throw new Error('Endereçamento não encontrado');
                }

                // Buscar os dados do produto para calcular a movimentação de estoque
                const produto = await produtoService.getById(enderecamentoParaExcluir.idProduto);
                if (!produto) {
                    throw new Error('Produto não encontrado');
                }

                // Calcular quantidade a ser retirada do estoque (quantMinVenda * quantCaixas)
                const quantCaixas = enderecamentoParaExcluir.quantCaixas || produto.quantCaixas || 1;
                const quantidadeParaRetirar = produto.quantMinVenda * quantCaixas;

                // Excluir o endereçamento
                await enderecamentoService.delete(id);

                // Retirar a quantidade do campo deposito do produto (saída do estoque)
                await produtoService.updateEstoque(
                    enderecamentoParaExcluir.idProduto,
                    quantidadeParaRetirar,
                    'saida'
                );

                showNotification('Endereçamento excluído com sucesso e estoque reduzido!', 'success');
                await loadEnderecamentos();
            } catch (error: any) {
                console.error('Erro ao excluir endereçamento:', error);
                showNotification(error.response?.data?.error || error.message || 'Erro ao excluir endereçamento', 'error');
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingEnderecamento(null);
        setError('');
        setSuccess('');
        setFormData({
            codigoBarras: '',
            codigoInterno: '',
            tonalidade: '',
            bitola: '',
            lote: '',
            observacao: '',
            quantCaixas: '',
            quantidadeAdicoes: '1',
            disponivel: true,
            idProduto: '',
            idPredio: '',
        });
    };

    const handleDetailsClose = () => {
        setDetailsOpen(false);
        setViewingEnderecamento(null);
    };

    const handleAdd = () => {
        setEditingEnderecamento(null);
        setError('');
        setSuccess('');
        setFormData({
            codigoBarras: '',
            codigoInterno: '',
            tonalidade: '',
            bitola: '',
            lote: '',
            observacao: '',
            quantCaixas: '',
            quantidadeAdicoes: '1',
            disponivel: true,
            idProduto: '',
            idPredio: '',
        });
        setOpen(true);
    };

    const handleInputChange = (field: keyof FormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => {
            let value = event.target.value;
            // Força maiúsculas nos campos específicos
            if (["tonalidade", "bitola", "lote", "observacao"].includes(field)) {
                value = value.toUpperCase();
            }
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleProdutoChange = (produto: IProduto | null) => {
        updateProdutoData(produto || undefined);
    };

    const handlePredioChange = (predio: PredioWithRua | null) => {
        setFormData(prev => ({
            ...prev,
            idPredio: predio ? predio.id.toString() : '',
        }));
    };

    const updateProdutoData = (produto?: IProduto) => {
        if (produto) {
            setFormData(prev => ({
                ...prev,
                idProduto: produto.id.toString(),
                codigoBarras: produto.codBarras || '',
                codigoInterno: produto.codInterno?.toString() || '',
                quantCaixas: produto.quantCaixas?.toString() || prev.quantCaixas
            }));
        }
    };

    const handleCodigoBarrasBlur = async () => {
        if (!formData.codigoBarras.trim()) return;

        try {
            const produto = await produtoService.findByCodigoBarra(formData.codigoBarras);
            if (produto) {
                updateProdutoData(produto);
                showNotification('Produto encontrado!', 'success');
            } else {
                showNotification('Produto não encontrado com este código de barras', 'warning');
            }
        } catch (error) {
            console.error('Erro ao buscar produto por código de barras:', error);
            showNotification('Erro ao buscar produto', 'error');
        }
    };

    const handleCodigoInternoBlur = async () => {
        if (!formData.codigoInterno.trim()) return;

        try {
            const codigoInternoNum = parseInt(formData.codigoInterno);
            if (isNaN(codigoInternoNum)) {
                showNotification('Código interno deve ser um número', 'warning');
                return;
            }

            const produto = await produtoService.findByCodigoInterno(codigoInternoNum);
            if (produto) {
                updateProdutoData(produto);
                showNotification('Produto encontrado!', 'success');
            } else {
                showNotification('Produto não encontrado com este código interno', 'warning');
            }
        } catch (error) {
            console.error('Erro ao buscar produto por código interno:', error);
            showNotification('Erro ao buscar produto', 'error');
        }
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');

            // Validação básica
            if (!formData.tonalidade || !formData.bitola || !formData.idPredio ||
                formData.idPredio.trim() === '') {
                setError('Preencha todos os campos obrigatórios');
                return;
            }

            if (!formData.idProduto || formData.idProduto.trim() === '') {
                setError('Selecione um produto ou use os códigos para buscar');
                return;
            }

            // Validação da quantidade de adições
            const quantidadeAdicoes = parseInt(formData.quantidadeAdicoes);
            if (isNaN(quantidadeAdicoes) || quantidadeAdicoes < 1) {
                setError('Quantidade de adições deve ser um número maior que 0');
                return;
            }

            if (quantidadeAdicoes > 100) {
                setError('Quantidade de adições não pode ser maior que 100');
                return;
            }

            const enderecamentoData = {
                tonalidade: formData.tonalidade,
                bitola: formData.bitola,
                lote: formData.lote || undefined,
                observacao: formData.observacao || undefined,
                quantCaixas: formData.quantCaixas ? parseInt(formData.quantCaixas) : undefined,
                disponivel: formData.disponivel,
                idProduto: parseInt(formData.idProduto),
                idPredio: parseInt(formData.idPredio),
            };

            if (editingEnderecamento) {
                // Modo edição - não usar quantidade de adições
                await enderecamentoService.update(editingEnderecamento.id, enderecamentoData);
                showNotification('Endereçamento atualizado com sucesso!', 'success');
            } else {
                // Modo criação - usar a nova API de criação em lote
                let enderecamentosCriados: any[] = [];

                if (quantidadeAdicoes === 1) {
                    const enderecamento = await enderecamentoService.create(enderecamentoData);
                    enderecamentosCriados = [enderecamento];
                    showNotification('Endereçamento criado com sucesso!', 'success');
                } else {
                    // Usar nova API de criação em lote
                    const response = await enderecamentoService.createBulk({
                        quantidade: quantidadeAdicoes,
                        enderecamentoData
                    });
                    enderecamentosCriados = response.data;
                    showNotification(response.message, 'success');
                }

                // Movimentar estoque: adicionar ao depósito (entrada)
                // Buscar dados do produto para calcular a movimentação
                const produto = await produtoService.getById(enderecamentoData.idProduto);
                if (produto) {
                    const quantCaixas = enderecamentoData.quantCaixas || produto.quantCaixas || 1;
                    const quantidadePorEnderecamento = produto.quantMinVenda * quantCaixas;
                    const quantidadeTotalParaMovimentar = quantidadePorEnderecamento * enderecamentosCriados.length;

                    await produtoService.updateEstoque(
                        enderecamentoData.idProduto,
                        quantidadeTotalParaMovimentar,
                        'entrada'
                    );
                }
            }

            await loadEnderecamentos();
            handleClose();

        } catch (error: any) {
            console.error('Erro ao salvar endereçamento:', error);
            showNotification(error.response?.data?.message || 'Erro ao salvar endereçamento. Tente novamente.', 'error');
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
                Endereçamentos
            </Typography>

            {/* Barra de pesquisa e controles */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <TextField
                        placeholder="Buscar por código ou descrição..."
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
                        onClick={loadEnderecamentos}
                        disabled={loading}
                    >
                        Limpar
                    </Button>
                </Box>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={showOnlyAvailable}
                            onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                        />
                    }
                    label="Apenas disponíveis"
                />

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAdd}
                    sx={{ minWidth: '120px' }}
                    size="medium"
                >
                    Novo Endereçamento
                </Button>
            </Box>

            <Paper sx={dataGridStyles.paperContainer}>
                <DataGrid
                    rows={enderecamentos}
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
                    sx={dataGridStyles.dataGridSx}
                />
            </Paper>

            {/* Modal de Criação/Edição */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingEnderecamento ? 'Editar Endereçamento' : 'Novo Endereçamento'}
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
                                    fullWidth
                                    label="Código de Barras"
                                    value={formData.codigoBarras}
                                    onChange={handleInputChange('codigoBarras')}
                                    onBlur={handleCodigoBarrasBlur}
                                    placeholder="Digite ou escaneie o código de barras"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Código Interno"
                                    type="number"
                                    value={formData.codigoInterno}
                                    onChange={handleInputChange('codigoInterno')}
                                    onBlur={handleCodigoInternoBlur}
                                    placeholder="Digite o código interno do produto"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={produtos}
                                    value={produtos.find(p => p.id.toString() === formData.idProduto) || null}
                                    onChange={(_, value) => handleProdutoChange(value)}
                                    getOptionLabel={(option) => getProdutoInfo(option)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Produto *"
                                            margin="normal"
                                            fullWidth
                                            placeholder="Digite para pesquisar produtos..."
                                        />
                                    )}
                                    filterOptions={(options, { inputValue }) => {
                                        const filtered = options.filter((option) => {
                                            const produtoInfo = getProdutoInfo(option).toLowerCase();
                                            return produtoInfo.includes(inputValue.toLowerCase());
                                        });
                                        return filtered;
                                    }}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.id}>
                                            <Box component="div">
                                                <Typography variant="body1">{option.descricao}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {option.codInterno}
                                                    {option.codBarras && ` | ${option.codBarras}`}
                                                    {option.codFabricante && ` | ${option.codFabricante}`}
                                                </Typography>
                                            </Box>
                                        </li>
                                    )}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    noOptionsText="Nenhum produto encontrado"
                                    loadingText="Carregando..."
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    options={predios}
                                    value={predios.find(p => p.id.toString() === formData.idPredio) || null}
                                    onChange={(_, value) => handlePredioChange(value)}
                                    getOptionLabel={(option) => getPredioInfo(option)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Rua-Prédio *"
                                            margin="normal"
                                            fullWidth
                                            placeholder="Digite para pesquisar prédios..."
                                        />
                                    )}
                                    filterOptions={(options, { inputValue }) => {
                                        const filtered = options.filter((option) => {
                                            const predioInfo = getPredioInfo(option).toLowerCase();
                                            return predioInfo.includes(inputValue.toLowerCase());
                                        });
                                        return filtered;
                                    }}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.id}>
                                            <Box component="div">
                                                <Typography variant="body1">{option.nomePredio}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {option.rua?.nomeRua || 'Rua não informada'}
                                                </Typography>
                                            </Box>
                                        </li>
                                    )}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    noOptionsText="Nenhum prédio encontrado"
                                    loadingText="Carregando..."
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Tonalidade"
                                    value={formData.tonalidade}
                                    onChange={handleInputChange('tonalidade')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Bitola"
                                    value={formData.bitola}
                                    onChange={handleInputChange('bitola')}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Lote"
                                    value={formData.lote}
                                    onChange={handleInputChange('lote')}
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
                            {!editingEnderecamento && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Quantidade de Adições"
                                        type="number"
                                        value={formData.quantidadeAdicoes}
                                        onChange={handleInputChange('quantidadeAdicoes')}
                                        inputProps={{ min: 1, max: 100 }}
                                        helperText="Número de endereçamentos idênticos a criar (máx. 100)"
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Observação"
                                    multiline
                                    rows={2}
                                    value={formData.observacao}
                                    onChange={handleInputChange('observacao')}
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
                    Detalhes do Endereçamento
                </DialogTitle>
                <DialogContent>
                    {viewingEnderecamento && (
                        <Box component="div" sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="ID"
                                        value={viewingEnderecamento.id}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Status"
                                        value={viewingEnderecamento.disponivel ? 'Disponível' : 'Indisponível'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Tonalidade"
                                        value={viewingEnderecamento.tonalidade}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Bitola"
                                        value={viewingEnderecamento.bitola}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Código Interno"
                                        value={viewingEnderecamento.produto?.codInterno || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Descrição do Produto"
                                        value={viewingEnderecamento.produto?.descricao || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Código de Barras"
                                        value={viewingEnderecamento.produto?.codBarras || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Código do Fabricante"
                                        value={viewingEnderecamento.produto?.codFabricante || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Nome da Rua"
                                        value={viewingEnderecamento.predio?.rua?.nomeRua || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Nome do Prédio"
                                        value={viewingEnderecamento.predio?.nomePredio || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Lote"
                                        value={viewingEnderecamento.lote || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Quantidade de Caixas"
                                        value={viewingEnderecamento.quantCaixas || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Lista"
                                        value={viewingEnderecamento.idLista || 'Livre'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Observação"
                                        multiline
                                        rows={2}
                                        value={viewingEnderecamento.observacao || 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Criado em"
                                        value={viewingEnderecamento.createdAt ? new Date(viewingEnderecamento.createdAt).toLocaleString('pt-BR') : 'Não informado'}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                {viewingEnderecamento.updatedAt && (
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            margin="normal"
                                            fullWidth
                                            label="Atualizado em"
                                            value={new Date(viewingEnderecamento.updatedAt).toLocaleString('pt-BR')}
                                            InputProps={{ readOnly: true }}
                                            variant="filled"
                                        />
                                    </Grid>
                                )}
                            </Grid>
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

export default EnderecamentosPage;
