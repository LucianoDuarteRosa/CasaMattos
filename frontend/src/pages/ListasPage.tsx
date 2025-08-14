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
    Chip,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Search,
    CheckCircle,
    RadioButtonUnchecked,
    PlaylistAdd,
    PlaylistRemove,
    Done,
    Undo,
    Visibility,
    GetApp,
    PictureAsPdf,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem, GridRowSelectionModel } from '@mui/x-data-grid';
import { listaService } from '@/services/listaService';
import { ILista, IEnderecamento, IPaginatedResponse } from '@/types';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';
import { exportarListaToPDF, exportarListaToExcel } from '@/utils/exportUtils';
import { UppercaseTextField } from '@/components/UppercaseTextField';

interface FormData {
    nome: string;
    disponivel: boolean;
}

interface FiltrosPesquisa {
    codigoFabricante: string;
    codigoInterno: string;
    codigoBarras: string;
    descricao: string;
}

const ListasPage: React.FC = () => {
    // Estados principais
    const [listas, setListas] = useState<ILista[]>([]);
    const [listaAtual, setListaAtual] = useState<ILista | null>(null);
    const [enderecamentosLista, setEnderecamentosLista] = useState<IEnderecamento[]>([]);
    const [enderecamentosDisponiveis, setEnderecamentosDisponiveis] = useState<IEnderecamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingEnderecamentos, setLoadingEnderecamentos] = useState(false);

    // Estados dos diálogos
    const [dialogNovaLista, setDialogNovaLista] = useState(false);
    const [dialogEditarLista, setDialogEditarLista] = useState(false);
    const [dialogAdicionarEnderecamentos, setDialogAdicionarEnderecamentos] = useState(false);
    const [dialogDetalhesLista, setDialogDetalhesLista] = useState(false);

    // Estados de formulários
    const [formData, setFormData] = useState<FormData>({
        nome: '',
        disponivel: true
    });

    const [filtrosPesquisa, setFiltrosPesquisa] = useState<FiltrosPesquisa>({
        codigoFabricante: '',
        codigoInterno: '',
        codigoBarras: '',
        descricao: ''
    });

    // Estados de seleção
    const [enderecamentosSelecionados, setEnderecamentosSelecionados] = useState<GridRowSelectionModel>([]);

    // Estados de notificação
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    // Paginação
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalListas, setTotalListas] = useState(0);

    // Carregar listas
    const carregarListas = async () => {
        try {
            setLoading(true);
            const response: IPaginatedResponse<ILista> = await listaService.getAll(page + 1, pageSize);
            setListas(response.data);
            setTotalListas(response.total);
        } catch (error) {
            mostrarSnackbar('Erro ao carregar listas', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Carregar endereçamentos da lista
    const carregarEnderecamentosLista = async (idLista: number) => {
        try {
            setLoadingEnderecamentos(true);
            const enderecamentos = await listaService.getEnderecamentos(idLista);
            setEnderecamentosLista(enderecamentos);
        } catch (error) {
            mostrarSnackbar('Erro ao carregar endereçamentos da lista', 'error');
        } finally {
            setLoadingEnderecamentos(false);
        }
    };

    // Pesquisar endereçamentos disponíveis
    const pesquisarEnderecamentos = async () => {
        try {
            setLoadingEnderecamentos(true);
            const enderecamentos = await listaService.searchEnderecamentosDisponiveis(filtrosPesquisa);
            setEnderecamentosDisponiveis(enderecamentos);
        } catch (error) {
            mostrarSnackbar('Erro ao pesquisar endereçamentos', 'error');
        } finally {
            setLoadingEnderecamentos(false);
        }
    };

    // Mostrar snackbar
    const mostrarSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // Limpar formulário
    const limparFormulario = () => {
        setFormData({ nome: '', disponivel: true });
    };

    // Limpar filtros de pesquisa
    const limparFiltros = () => {
        setFiltrosPesquisa({
            codigoFabricante: '',
            codigoInterno: '',
            codigoBarras: '',
            descricao: ''
        });
    };

    // Criar nova lista
    const criarLista = async () => {
        try {
            if (!formData.nome.trim()) {
                mostrarSnackbar('Nome da lista é obrigatório', 'error');
                return;
            }

            await listaService.create({
                nome: formData.nome.trim(),
                disponivel: true
            });

            await carregarListas();
            setDialogNovaLista(false);
            limparFormulario();
            mostrarSnackbar('Lista criada com sucesso!', 'success');
        } catch (error) {
            mostrarSnackbar('Erro ao criar lista', 'error');
        }
    };

    // Editar lista
    const editarLista = async () => {
        try {
            if (!listaAtual || !formData.nome.trim()) {
                mostrarSnackbar('Dados inválidos', 'error');
                return;
            }

            await listaService.update(listaAtual.id, {
                nome: formData.nome.trim()
            });

            await carregarListas();
            setDialogEditarLista(false);
            setListaAtual(null);
            limparFormulario();
            mostrarSnackbar('Lista atualizada com sucesso!', 'success');
        } catch (error) {
            mostrarSnackbar('Erro ao atualizar lista', 'error');
        }
    };

    // Excluir lista
    const excluirLista = async (lista: ILista) => {
        if (!confirm(`Tem certeza que deseja excluir a lista "${lista.nome}"?`)) {
            return;
        }

        try {
            await listaService.delete(lista.id);
            await carregarListas();
            mostrarSnackbar('Lista excluída com sucesso!', 'success');
        } catch (error) {
            mostrarSnackbar('Erro ao excluir lista', 'error');
        }
    };

    // Finalizar lista
    const finalizarLista = async (lista: ILista) => {
        if (!confirm(`Tem certeza que deseja finalizar a lista "${lista.nome}"? Esta ação marcará todos os endereçamentos como indisponíveis e moverá o estoque.`)) {
            return;
        }

        try {
            await listaService.finalizarLista(lista.id);
            await carregarListas();
            if (listaAtual?.id === lista.id) {
                await carregarEnderecamentosLista(lista.id);
            }
            mostrarSnackbar('Lista finalizada com sucesso!', 'success');
        } catch (error) {
            mostrarSnackbar('Erro ao finalizar lista', 'error');
        }
    };

    // Desfazer finalização
    const desfazerFinalizacao = async (lista: ILista) => {
        if (!confirm(`Tem certeza que deseja desfazer a finalização da lista "${lista.nome}"? Esta ação retornará todos os endereçamentos como disponíveis.`)) {
            return;
        }

        try {
            await listaService.desfazerFinalizacao(lista.id);
            await carregarListas();
            if (listaAtual?.id === lista.id) {
                await carregarEnderecamentosLista(lista.id);
            }
            mostrarSnackbar('Finalização desfeita com sucesso!', 'success');
        } catch (error) {
            mostrarSnackbar('Erro ao desfazer finalização', 'error');
        }
    };

    // Adicionar endereçamentos à lista
    const adicionarEnderecamentos = async () => {
        try {
            if (!listaAtual || enderecamentosSelecionados.length === 0) {
                mostrarSnackbar('Selecione ao menos um endereçamento', 'error');
                return;
            }

            for (const idEnderecamento of enderecamentosSelecionados) {
                await listaService.adicionarEnderecamento(listaAtual.id, Number(idEnderecamento));
            }

            await carregarEnderecamentosLista(listaAtual.id);
            setDialogAdicionarEnderecamentos(false);
            setEnderecamentosSelecionados([]);
            mostrarSnackbar(`${enderecamentosSelecionados.length} endereçamento(s) adicionado(s) à lista!`, 'success');
        } catch (error) {
            mostrarSnackbar('Erro ao adicionar endereçamentos', 'error');
        }
    };

    // Remover endereçamento da lista
    const removerEnderecamento = async (idEnderecamento: number) => {
        try {
            if (!listaAtual) return;

            await listaService.removerEnderecamento(listaAtual.id, idEnderecamento);
            await carregarEnderecamentosLista(listaAtual.id);
            mostrarSnackbar('Endereçamento removido da lista!', 'success');
        } catch (error) {
            mostrarSnackbar('Erro ao remover endereçamento', 'error');
        }
    };

    // Abrir diálogo para nova lista
    const abrirDialogNovaLista = () => {
        limparFormulario();
        setDialogNovaLista(true);
    };

    // Abrir diálogo para editar lista
    const abrirDialogEditarLista = (lista: ILista) => {
        setListaAtual(lista);
        setFormData({
            nome: lista.nome,
            disponivel: lista.disponivel
        });
        setDialogEditarLista(true);
    };

    // Abrir detalhes da lista
    const abrirDetalhesLista = async (lista: ILista) => {
        setListaAtual(lista);
        await carregarEnderecamentosLista(lista.id);
        setDialogDetalhesLista(true);
    };

    // Abrir diálogo para adicionar endereçamentos
    const abrirDialogAdicionarEnderecamentos = () => {
        limparFiltros();
        setEnderecamentosDisponiveis([]);
        setEnderecamentosSelecionados([]);
        setDialogAdicionarEnderecamentos(true);
    };

    // Exportar lista para PDF
    const exportarPDF = () => {
        if (!listaAtual || enderecamentosLista.length === 0) {
            mostrarSnackbar('Não há dados para exportar', 'error');
            return;
        }

        try {
            exportarListaToPDF(enderecamentosLista as any, listaAtual.nome);
            mostrarSnackbar('Lista exportada para PDF com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            mostrarSnackbar('Erro ao exportar para PDF', 'error');
        }
    };

    // Exportar lista para Excel
    const exportarExcel = () => {
        if (!listaAtual || enderecamentosLista.length === 0) {
            mostrarSnackbar('Não há dados para exportar', 'error');
            return;
        }

        try {
            exportarListaToExcel(enderecamentosLista as any, listaAtual.nome);
            mostrarSnackbar('Lista exportada para Excel com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar Excel:', error);
            mostrarSnackbar('Erro ao exportar para Excel', 'error');
        }
    };

    // Colunas da grid de listas
    const colunasListas: GridColDef[] = [
        {
            field: 'id',
            headerName: 'ID',
            width: 80,
        },
        {
            field: 'nome',
            headerName: 'Nome',
            width: 250,
            flex: 1,
        },
        {
            field: 'disponivel',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Aberta' : 'Finalizada'}
                    color={params.value ? 'success' : 'default'}
                    size="small"
                    icon={params.value ? <RadioButtonUnchecked /> : <CheckCircle />}
                />
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Criada em',
            width: 150,
            valueFormatter: (params) => {
                return params.value ? new Date(params.value).toLocaleDateString('pt-BR') : '';
            },
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 180,
            getActions: (params) => {
                const actions = [
                    <GridActionsCellItem
                        key="view"
                        icon={<Visibility />}
                        label="Visualizar"
                        onClick={() => abrirDetalhesLista(params.row)}
                    />,
                    <GridActionsCellItem
                        key="edit"
                        icon={<Edit />}
                        label="Editar"
                        onClick={() => abrirDialogEditarLista(params.row)}
                    />,
                ];

                if (params.row.disponivel) {
                    actions.push(
                        <GridActionsCellItem
                            key="finalize"
                            icon={<Done />}
                            label="Finalizar"
                            onClick={() => finalizarLista(params.row)}
                        />
                    );
                } else {
                    actions.push(
                        <GridActionsCellItem
                            key="undo"
                            icon={<Undo />}
                            label="Desfazer Finalização"
                            onClick={() => desfazerFinalizacao(params.row)}
                        />
                    );
                }

                actions.push(
                    <GridActionsCellItem
                        key="delete"
                        icon={<Delete />}
                        label="Excluir"
                        onClick={() => excluirLista(params.row)}
                    />
                );

                return actions;
            },
        },
    ];

    // Colunas da grid de endereçamentos da lista
    const colunasEnderecamentosLista: GridColDef[] = [
        {
            field: 'codInterno',
            headerName: 'Código Interno',
            width: 120,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.codInterno || 'N/A';
            },
        },
        {
            field: 'descricao',
            headerName: 'Descrição',
            width: 200,
            flex: 1,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.descricao || 'N/A';
            },
        },
        {
            field: 'codFabricante',
            headerName: 'Cód Fabricante',
            width: 120,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.codFabricante || 'N/A';
            },
        },
        {
            field: 'tonalidade',
            headerName: 'Tonalidade',
            width: 120,
        },
        {
            field: 'bitola',
            headerName: 'Bitola',
            width: 100,
        },
        {
            field: 'quantCaixas',
            headerName: 'Qtd Caixas',
            width: 120,
        },
        {
            field: 'quantMinVenda',
            headerName: 'Qtd Min Venda',
            width: 120,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.quantMinVenda || 'N/A';
            },
        },
        {
            field: 'localizacao',
            headerName: 'Localização',
            width: 200,
            valueGetter: (params) => {
                const predio = params.row.predio;
                if (!predio) return 'N/A';
                const rua = predio.rua?.nomeRua || 'Rua N/I';
                return `${rua} - ${predio.nomePredio}`;
            },
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Ações',
            width: 80,
            getActions: (params) => [
                <GridActionsCellItem
                    key="remove"
                    icon={<PlaylistRemove />}
                    label="Remover da Lista"
                    onClick={() => removerEnderecamento(params.row.id)}
                    disabled={!listaAtual?.disponivel}
                />,
            ],
        },
    ];

    // Colunas da grid de endereçamentos disponíveis
    const colunasEnderecamentosDisponiveis: GridColDef[] = [
        {
            field: 'codInterno',
            headerName: 'Código Interno',
            width: 120,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.codInterno || 'N/A';
            },
        },
        {
            field: 'descricao',
            headerName: 'Descrição',
            width: 200,
            flex: 1,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.descricao || 'N/A';
            },
        },
        {
            field: 'codFabricante',
            headerName: 'Cód Fabricante',
            width: 120,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.codFabricante || 'N/A';
            },
        },
        {
            field: 'tonalidade',
            headerName: 'Tonalidade',
            width: 120,
        },
        {
            field: 'bitola',
            headerName: 'Bitola',
            width: 100,
        },
        {
            field: 'quantCaixas',
            headerName: 'Qtd Caixas',
            width: 120,
        },
        {
            field: 'quantMinVenda',
            headerName: 'Qtd Min Venda',
            width: 120,
            valueGetter: (params) => {
                const produto = params.row.produto;
                return produto?.quantMinVenda || 'N/A';
            },
        },
        {
            field: 'localizacao',
            headerName: 'Localização',
            width: 200,
            valueGetter: (params) => {
                const predio = params.row.predio;
                if (!predio) return 'N/A';
                const rua = predio.rua?.nomeRua || 'Rua N/I';
                return `${rua} - ${predio.nomePredio}`;
            },
        },
    ];

    // Efeitos
    useEffect(() => {
        carregarListas();
    }, [page, pageSize]);

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
                Listas de Separação
            </Typography>

            {/* Cabeçalho com botão de nova lista */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                    Gerenciar Listas
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={abrirDialogNovaLista}
                >
                    Nova Lista
                </Button>
            </Box>

            {/* Grid de listas */}
            <Paper sx={dataGridStyles.paperContainer}>
                <DataGrid
                    rows={listas}
                    columns={colunasListas}
                    loading={loading}
                    pageSizeOptions={[5, 10, 25, 50]}
                    paginationMode="server"
                    rowCount={totalListas}
                    paginationModel={{ page, pageSize }}
                    onPaginationModelChange={(model) => {
                        setPage(model.page);
                        setPageSize(model.pageSize);
                    }}
                    disableRowSelectionOnClick
                    localeText={dataGridPtBR}
                    sx={dataGridStyles.dataGridSx}
                />
            </Paper>

            {/* Dialog Nova Lista */}
            <Dialog open={dialogNovaLista} onClose={() => setDialogNovaLista(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nova Lista</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nome da Lista"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogNovaLista(false)}>Cancelar</Button>
                    <Button onClick={criarLista} variant="contained">Criar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Editar Lista */}
            <Dialog open={dialogEditarLista} onClose={() => setDialogEditarLista(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Lista</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nome da Lista"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogEditarLista(false)}>Cancelar</Button>
                    <Button onClick={editarLista} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Detalhes da Lista */}
            <Dialog
                open={dialogDetalhesLista}
                onClose={() => setDialogDetalhesLista(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { height: '90vh' } }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">
                            {listaAtual?.nome}
                        </Typography>
                        <Chip
                            label={listaAtual?.disponivel ? 'Aberta' : 'Finalizada'}
                            color={listaAtual?.disponivel ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    {/* Cabeçalho dos endereçamentos */}
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6">
                            Endereçamentos ({enderecamentosLista.length})
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {enderecamentosLista.length > 0 && (
                                <>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PictureAsPdf />}
                                        onClick={exportarPDF}
                                        sx={{
                                            minWidth: 'auto',
                                            backgroundColor: '#ff9800', // Laranja/amarelo
                                            '&:hover': {
                                                backgroundColor: '#f57c00'
                                            }
                                        }}
                                    >
                                        PDF
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<GetApp />}
                                        onClick={exportarExcel}
                                        color="success"
                                        sx={{ minWidth: 'auto' }}
                                    >
                                        Excel
                                    </Button>
                                </>
                            )}
                            {listaAtual?.disponivel && (
                                <Button
                                    variant="contained"
                                    startIcon={<PlaylistAdd />}
                                    onClick={abrirDialogAdicionarEnderecamentos}
                                >
                                    Adicionar Endereçamentos
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Grid de endereçamentos da lista */}
                    <Paper sx={{ ...dataGridStyles.paperContainer, height: 640 }}>
                        <DataGrid
                            rows={enderecamentosLista}
                            columns={colunasEnderecamentosLista}
                            loading={loadingEnderecamentos}
                            pageSizeOptions={[5, 10, 25]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 25 } },
                            }}
                            disableRowSelectionOnClick
                            localeText={dataGridPtBR}
                            sx={dataGridStyles.dataGridSx}
                        />
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogDetalhesLista(false)}>Fechar</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Adicionar Endereçamentos */}
            <Dialog
                open={dialogAdicionarEnderecamentos}
                onClose={() => setDialogAdicionarEnderecamentos(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { height: '90vh' } }}
            >
                <DialogTitle>Adicionar Endereçamentos à Lista</DialogTitle>
                <DialogContent sx={{ p: 2 }}>
                    {/* Filtros de pesquisa */}
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Filtros de Pesquisa
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <UppercaseTextField
                                        fullWidth
                                        label="Código Fabricante"
                                        value={filtrosPesquisa.codigoFabricante}
                                        onChange={(value) => setFiltrosPesquisa({
                                            ...filtrosPesquisa,
                                            codigoFabricante: value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <UppercaseTextField
                                        fullWidth
                                        label="Código Interno"
                                        value={filtrosPesquisa.codigoInterno}
                                        onChange={(value) => setFiltrosPesquisa({
                                            ...filtrosPesquisa,
                                            codigoInterno: value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <UppercaseTextField
                                        fullWidth
                                        label="Código de Barras"
                                        value={filtrosPesquisa.codigoBarras}
                                        onChange={(value) => setFiltrosPesquisa({
                                            ...filtrosPesquisa,
                                            codigoBarras: value
                                        })}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <UppercaseTextField
                                        fullWidth
                                        label="Descrição"
                                        value={filtrosPesquisa.descricao}
                                        onChange={(value) => setFiltrosPesquisa({
                                            ...filtrosPesquisa,
                                            descricao: value
                                        })}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardActions>
                            <Button
                                startIcon={<Search />}
                                onClick={pesquisarEnderecamentos}
                                variant="contained"
                            >
                                Pesquisar
                            </Button>
                            <Button
                                onClick={limparFiltros}
                            >
                                Limpar
                            </Button>
                        </CardActions>
                    </Card>

                    {/* Resultados da pesquisa */}
                    <Typography variant="h6" gutterBottom>
                        Endereçamentos Disponíveis ({enderecamentosDisponiveis.length})
                    </Typography>

                    <Paper sx={{ ...dataGridStyles.paperContainer, height: 460 }}>
                        <DataGrid
                            rows={enderecamentosDisponiveis}
                            columns={colunasEnderecamentosDisponiveis}
                            loading={loadingEnderecamentos}
                            pageSizeOptions={[5, 10, 25]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            checkboxSelection
                            rowSelectionModel={enderecamentosSelecionados}
                            onRowSelectionModelChange={setEnderecamentosSelecionados}
                            localeText={dataGridPtBR}
                            sx={dataGridStyles.dataGridSx}
                        />
                    </Paper>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogAdicionarEnderecamentos(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={adicionarEnderecamentos}
                        variant="contained"
                        disabled={enderecamentosSelecionados.length === 0}
                    >
                        Adicionar Selecionados ({enderecamentosSelecionados.length})
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
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

export default ListasPage;
