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
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Add, Edit, Visibility, Delete } from '@mui/icons-material';
import { enderecamentoService, EnderecamentoWithRelations } from '@/services/enderecamentoService';
import { produtoService } from '@/services/produtoService';
import { predioService, PredioWithRua } from '@/services/predioService';
import { IProduto } from '@/types'; import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';

interface FormData {
    tonalidade: string;
    bitola: string;
    lote: string;
    observacao: string;
    quantCaixas: string;
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
        tonalidade: '',
        bitola: '',
        lote: '',
        observacao: '',
        quantCaixas: '',
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
            headerName: 'Status',
            width: 100,
            minWidth: 80,
            renderCell: (params) => (
                <span style={{
                    color: params.value ? '#4caf50' : '#f44336',
                    fontWeight: 'bold'
                }}>
                    {params.value ? 'Disponível' : 'Indisponível'}
                </span>
            )
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
            tonalidade: enderecamento.tonalidade,
            bitola: enderecamento.bitola,
            lote: enderecamento.lote || '',
            observacao: enderecamento.observacao || '',
            quantCaixas: enderecamento.quantCaixas?.toString() || quantCaixasDefault,
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
                await enderecamentoService.delete(id);
                showNotification('Endereçamento excluído com sucesso!', 'success');
                await loadEnderecamentos();
            } catch (error: any) {
                console.error('Erro ao excluir endereçamento:', error);
                showNotification(error.response?.data?.error || 'Erro ao excluir endereçamento', 'error');
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingEnderecamento(null);
        setError('');
        setSuccess('');
        setFormData({
            tonalidade: '',
            bitola: '',
            lote: '',
            observacao: '',
            quantCaixas: '',
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
            tonalidade: '',
            bitola: '',
            lote: '',
            observacao: '',
            quantCaixas: '',
            disponivel: true,
            idProduto: '',
            idPredio: '',
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

    const handleProdutoChange = (produtoId: string) => {
        const produto = produtos.find(p => p.id === parseInt(produtoId));
        setFormData(prev => ({
            ...prev,
            idProduto: produtoId,
            // Pré-preencher quantidade de caixas com o valor padrão do produto
            quantCaixas: produto?.quantCaixas?.toString() || prev.quantCaixas
        }));
    };

    const handleSubmit = async () => {
        try {
            setError('');
            setSuccess('');

            // Validação básica
            if (!formData.tonalidade || !formData.bitola || !formData.idProduto || !formData.idPredio) {
                setError('Preencha todos os campos obrigatórios');
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
                await enderecamentoService.update(editingEnderecamento.id, enderecamentoData);
                showNotification('Endereçamento atualizado com sucesso!', 'success');
            } else {
                await enderecamentoService.create(enderecamentoData);
                showNotification('Endereçamento criado com sucesso!', 'success');
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
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel>Produto</InputLabel>
                                    <Select
                                        value={formData.idProduto}
                                        label="Produto"
                                        onChange={(e) => handleProdutoChange(e.target.value)}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <em>Selecione um produto</em>;
                                            }
                                            const produto = produtos.find(p => p.id === parseInt(selected));
                                            return getProdutoInfo(produto);
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Selecione um produto</em>
                                        </MenuItem>
                                        {produtos.map((produto) => (
                                            <MenuItem key={produto.id} value={produto.id.toString()}>
                                                {getProdutoInfo(produto)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel>Prédio</InputLabel>
                                    <Select
                                        value={formData.idPredio}
                                        label="Prédio"
                                        onChange={(e) => setFormData({ ...formData, idPredio: e.target.value })}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <em>Selecione um prédio</em>;
                                            }
                                            const predio = predios.find(p => p.id === parseInt(selected));
                                            return getPredioInfo(predio);
                                        }}
                                    >
                                        <MenuItem value="">
                                            <em>Selecione um prédio</em>
                                        </MenuItem>
                                        {predios.map((predio) => (
                                            <MenuItem key={predio.id} value={predio.id.toString()}>
                                                {getPredioInfo(predio)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
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
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.disponivel}
                                            onChange={(e) => setFormData({ ...formData, disponivel: e.target.checked })}
                                        />
                                    }
                                    label="Disponível"
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
                                <Grid item xs={12}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Produto"
                                        value={getProdutoInfo(viewingEnderecamento.produto)}
                                        InputProps={{ readOnly: true }}
                                        variant="filled"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        label="Localização"
                                        value={getPredioInfo(viewingEnderecamento.predio)}
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
