

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Search, Visibility } from '@mui/icons-material';
import { produtoService } from '@/services/produtoService';
import { estoqueItemService } from '@/services/estoqueItemService';
import { enderecamentoService } from '@/services/enderecamentoService';
import { IProduto, IEstoqueItem } from '@/types';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';

const AjustarPage: React.FC = () => {
    const [produtosComEnderecamento, setProdutosComEnderecamento] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedProduto, setSelectedProduto] = useState<IProduto | null>(null);
    const [estoqueItens, setEstoqueItens] = useState<IEstoqueItem[]>([]);
    const [enderecamentoEstoque, setEnderecamentoEstoque] = useState<number>(0);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });


    useEffect(() => {
        loadProdutosComEnderecamento();
    }, []);

    const loadProdutosComEnderecamento = async (term = '') => {
        setLoading(true);
        try {
            let produtos: IProduto[] = [];
            if (term) {
                produtos = await produtoService.searchByCodigoOrNome(term);
            } else {
                const resp = await produtoService.getAll(1, 50);
                produtos = resp.data;
            }
            // Para cada produto, buscar o estoque endereçado pelo novo endpoint
            const produtosComEnderecamento = await Promise.all(produtos.map(async (produto) => {
                const estoqueEnderecamento = await enderecamentoService.getEstoqueEnderecado(produto.id);
                return { ...produto, estoqueEnderecamento };
            }));
            setProdutosComEnderecamento(produtosComEnderecamento);
        } catch (e) {
            setSnackbar({ open: true, message: 'Erro ao carregar produtos', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadProdutosComEnderecamento(searchTerm);
    };

    const handleProdutoDetails = async (produto: IProduto) => {
        setSelectedProduto(produto);
        setDetailsOpen(true);
        setLoading(true);
        try {
            const lotes = await estoqueItemService.getByProdutoId(produto.id);
            setEstoqueItens(lotes);
            // Buscar estoque endereçado atualizado pelo novo endpoint
            const estoqueEnderecamento = await enderecamentoService.getEstoqueEnderecado(produto.id);
            setEnderecamentoEstoque(estoqueEnderecamento);
        } catch {
            setEstoqueItens([]);
            setEnderecamentoEstoque(0);
            setSnackbar({ open: true, message: 'Erro ao carregar lotes', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedProduto(null);
        setEstoqueItens([]);
    };

    // Diálogos de transferência e criação de lote serão implementados depois

    return (
        <Box sx={{ width: '100%', overflow: 'hidden', m: -1.5, p: { xs: 1, sm: 2 }, maxWidth: '100vw', boxSizing: 'border-box' }}>
            <Typography variant="h4" gutterBottom>
                Ajustar Estoque
            </Typography>
            {/* Barra de pesquisa */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <TextField
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
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
                        onClick={() => loadProdutosComEnderecamento()}
                        disabled={loading}
                    >
                        Limpar
                    </Button>
                </Box>
            </Box>
            <Paper sx={dataGridStyles.paperContainer}>
                <DataGrid
                    rows={produtosComEnderecamento}
                    columns={[
                        { field: 'id', headerName: 'ID', width: 70 },
                        { field: 'codInterno', headerName: 'Código', width: 100 },
                        { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 180 },
                        {
                            field: 'estoque',
                            headerName: 'Estoque',
                            width: 100,
                            type: 'number',
                            valueFormatter: (params) =>
                                params.value !== undefined && params.value !== null
                                    ? Number(params.value).toFixed(2).replace('.', ',')
                                    : '0,00'
                        },
                        {
                            field: 'estoqueEnderecamento',
                            headerName: 'Endereçamento',
                            width: 150,
                            type: 'number',
                            valueFormatter: (params) =>
                                params.value !== undefined && params.value !== null
                                    ? Number(params.value).toFixed(2).replace('.', ',')
                                    : '0,00'
                        },
                        {
                            field: 'actions',
                            type: 'actions',
                            headerName: 'Ações',
                            width: 110,
                            getActions: (params) => [
                                <GridActionsCellItem
                                    key="details"
                                    icon={<Visibility />}
                                    label="Detalhes"
                                    onClick={() => handleProdutoDetails(params.row)}
                                />
                            ]
                        }
                    ] as GridColDef[]}
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

            {/* Detalhes do Produto e Lotes */}
            <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
                <DialogTitle>Detalhes do Produto</DialogTitle>
                <DialogContent>
                    {selectedProduto && (
                        <Box>
                            <Typography variant="h6">{selectedProduto.descricao}</Typography>
                            <Typography variant="body2">Código Interno: {selectedProduto.codInterno}</Typography>
                            <Typography variant="body2">Código de Barras: {selectedProduto.codBarras || 'N/I'}</Typography>
                            <Typography variant="body2">Estoque: {selectedProduto.estoque !== undefined && selectedProduto.estoque !== null ? Number(selectedProduto.estoque).toFixed(2).replace('.', ',') : '0,00'}</Typography>
                            <Typography variant="body2">Endereçamento: {Number(enderecamentoEstoque).toFixed(2).replace('.', ',')}</Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom>Itens de Estoque</Typography>
                                {estoqueItens.length === 0 ? (
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
                                                {estoqueItens.map(item => (
                                                    <tr key={item.id}>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.lote}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.ton}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.bit}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.quantidade}</td>
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
                    <Button onClick={handleCloseDetails}>Fechar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AjustarPage;
