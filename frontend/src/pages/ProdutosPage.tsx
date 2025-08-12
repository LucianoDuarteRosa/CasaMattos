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
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add } from '@mui/icons-material';
import { produtoService } from '@/services/produtoService';
import { IProduto } from '@/types';

const ProdutosPage: React.FC = () => {
    const [produtos, setProdutos] = useState<IProduto[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingProduto, setEditingProduto] = useState<IProduto | null>(null);

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'codInterno', headerName: 'Cód. Interno', width: 120 },
        { field: 'descricao', headerName: 'Descrição', width: 200, flex: 1 },
        { field: 'estoque', headerName: 'Estoque', width: 100, type: 'number' },
        { field: 'quantCaixas', headerName: 'Qtd Caixas', width: 100, type: 'number' },
        {
            field: 'actions',
            headerName: 'Ações',
            width: 150,
            renderCell: (params) => (
                <Button
                    size="small"
                    onClick={() => handleEdit(params.row)}
                >
                    Editar
                </Button>
            ),
        },
    ];

    useEffect(() => {
        loadProdutos();
    }, []);

    const loadProdutos = async () => {
        try {
            setLoading(true);
            const response = await produtoService.getAll();
            setProdutos(response.data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (produto: IProduto) => {
        setEditingProduto(produto);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingProduto(null);
    };

    const handleAdd = () => {
        setEditingProduto(null);
        setOpen(true);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">
                    Produtos
                </Typography>
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
                />
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingProduto ? 'Editar Produto' : 'Novo Produto'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Código Interno"
                            type="number"
                            defaultValue={editingProduto?.codInterno || ''}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Descrição"
                            defaultValue={editingProduto?.descricao || ''}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Quantidade Mínima de Venda"
                            type="number"
                            defaultValue={editingProduto?.quantMinVenda || ''}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Código de Barras"
                            defaultValue={editingProduto?.codBarras || ''}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Depósito"
                            type="number"
                            defaultValue={editingProduto?.deposito || ''}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Estoque"
                            type="number"
                            defaultValue={editingProduto?.estoque || ''}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Custo"
                            type="number"
                            defaultValue={editingProduto?.custo || ''}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Código Fabricante"
                            defaultValue={editingProduto?.codFabricante || ''}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Quantidade de Caixas"
                            type="number"
                            defaultValue={editingProduto?.quantCaixas || ''}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProdutosPage;
