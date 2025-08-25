

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
    // Estado para exibir o total de metros (endereçamento) nos detalhes
    const [enderecamentoEstoque, setEnderecamentoEstoque] = useState<number>(0);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
    // Estado para edição/criação de item de estoque
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editItem, setEditItem] = useState<IEstoqueItem | null>(null);
    const [isNewItem, setIsNewItem] = useState(false);


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
            // Buscar o total de metros (endereçamento) apenas para exibição
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

    // Ações de edição/criação de item de estoque
    const handleEditItem = (item: IEstoqueItem) => {
        setEditItem(item);
        setIsNewItem(false);
        setEditDialogOpen(true);
    };

    const handleNewItem = () => {
        if (!selectedProduto) return;
        setEditItem({
            id: 0,
            produtoId: selectedProduto.id,
            lote: '',
            ton: '',
            bit: '',
            quantidade: 0
        });
        setIsNewItem(true);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditItem(null);
        setIsNewItem(false);
    };

    const handleEditDialogSave = async () => {
        if (!editItem || !selectedProduto) return;
        setLoading(true);
        try {
            if (isNewItem) {
                await estoqueItemService.create({ ...editItem, produtoId: selectedProduto.id });
                setSnackbar({ open: true, message: 'Item criado com sucesso!', severity: 'success' });
            } else {
                await estoqueItemService.update(editItem.id, editItem);
                setSnackbar({ open: true, message: 'Item atualizado com sucesso!', severity: 'success' });
            }
            // Atualizar lista de itens
            const lotes = await estoqueItemService.getByProdutoId(selectedProduto.id);
            setEstoqueItens(lotes);
            // Não atualizar endereçamento nos detalhes
            handleEditDialogClose();
        } catch {
            setSnackbar({ open: true, message: 'Erro ao salvar item', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

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
                            headerName: 'Depósito',
                            width: 150,
                            type: 'number',
                            valueFormatter: (params) => {
                                // Corrigir acesso à linha completa
                                const row = params.id ? params.api.getRow(params.id) : null;
                                const minVenda = row && row.quantMinVenda ? Number(row.quantMinVenda) : 0;
                                const val = params.value !== undefined && params.value !== null ? Number(params.value) : 0;
                                return (val * minVenda).toFixed(2).replace('.', ',');
                            }
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 0, mt: 1 }}>
                            {/* Linha 1: Descrição (full width) */}
                            <TextField
                                label="Descrição"
                                value={selectedProduto.descricao || ''}
                                fullWidth
                                variant="filled"
                                InputProps={{ readOnly: true }}
                            />
                            {/* Linha 2: Código Interno, Código de Barras, Fabricante */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Código Interno"
                                    value={selectedProduto.codInterno || ''}
                                    fullWidth
                                    variant="filled"
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label="Código de Barras"
                                    value={selectedProduto.codBarras || 'N/I'}
                                    fullWidth
                                    variant="filled"
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label="Fabricante"
                                    value={selectedProduto.codFabricante || 'N/I'}
                                    fullWidth
                                    variant="filled"
                                    InputProps={{ readOnly: true }}
                                />
                            </Box>
                            {/* Linha 3: Estoque, Depósito, Quantidade Mínima de Venda */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    label="Estoque"
                                    value={selectedProduto.estoque !== undefined && selectedProduto.estoque !== null ? Number(selectedProduto.estoque).toFixed(2).replace('.', ',') : '0,00'}
                                    fullWidth
                                    variant="filled"
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label="Depósito"
                                    value={selectedProduto && selectedProduto.quantMinVenda && enderecamentoEstoque
                                        ? (Number(enderecamentoEstoque) * Number(selectedProduto.quantMinVenda)).toFixed(2).replace('.', ',')
                                        : '0,00'}
                                    fullWidth
                                    variant="filled"
                                    InputProps={{ readOnly: true }}
                                />
                                <TextField
                                    label="Quant. Mín. Venda"
                                    value={selectedProduto.quantMinVenda !== undefined && selectedProduto.quantMinVenda !== null
                                        ? Number(selectedProduto.quantMinVenda).toFixed(2).replace('.', ',')
                                        : '0,00'}
                                    fullWidth
                                    variant="filled"
                                    InputProps={{ readOnly: true }}
                                />
                            </Box>
                            {/* Itens de Estoque */}
                            <Box sx={{ mt: 0, mb: 0, pb: 0 }}>
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
                                                    <th style={{ padding: 8, borderBottom: '1px solid #ccc' }}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ textAlign: 'center' }}>
                                                {estoqueItens.map(item => (
                                                    <tr key={item.id}>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.lote}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.ton}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{item.bit}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>{Number(item.quantidade).toFixed(2).replace('.', ',')}</td>
                                                        <td style={{ padding: 8, borderBottom: '1px solid #eee', textAlign: 'center' }}>
                                                            <Button size="small" variant="outlined" onClick={() => handleEditItem(item)}>Editar</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </Paper>
                                )}
                                <Box sx={{ mt: 2, mb: 0, pb: 0, textAlign: 'right' }}>
                                    <Button variant="contained" onClick={handleNewItem}>Novo Item</Button>
                                </Box>
                                {/* Modal de edição/criação de item de estoque */}
                                <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="xs" fullWidth>
                                    <DialogTitle>{isNewItem ? 'Novo Item de Estoque' : 'Editar Item de Estoque'}</DialogTitle>
                                    <DialogContent>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, mb: 0 }}>
                                            <TextField
                                                label="Lote"
                                                value={editItem?.lote || ''}
                                                onChange={e => setEditItem(editItem ? { ...editItem, lote: e.target.value.toUpperCase() } : null)}
                                                fullWidth
                                            />
                                            <TextField
                                                label="Tonalidade"
                                                value={editItem?.ton || ''}
                                                onChange={e => setEditItem(editItem ? { ...editItem, ton: e.target.value.toUpperCase() } : null)}
                                                fullWidth
                                            />
                                            <TextField
                                                label="Bitola"
                                                value={editItem?.bit || ''}
                                                onChange={e => setEditItem(editItem ? { ...editItem, bit: e.target.value.toUpperCase() } : null)}
                                                fullWidth
                                            />
                                            <TextField
                                                label="Quantidade"
                                                type="number"
                                                value={editItem?.quantidade ?? ''}
                                                onChange={e => {
                                                    const valor = e.target.value;
                                                    setEditItem(editItem ? { ...editItem, quantidade: valor === '' ? 0 : Number(valor) } : null);
                                                }}
                                                inputProps={{ step: '0.01', inputMode: 'decimal' }}
                                                fullWidth
                                            />
                                        </Box>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleEditDialogClose}>Cancelar</Button>
                                        <Button onClick={handleEditDialogSave} variant="contained" disabled={loading}>
                                            Salvar
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ pt: 0 }}>
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
