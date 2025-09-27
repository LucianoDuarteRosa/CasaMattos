import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    CircularProgress,
    Alert,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';
import { Inventory, Business, LocationOn, Assignment, QueryStats } from '@mui/icons-material';

import Recycling from '@mui/icons-material/Recycling';
import {
    dashboardService,
    DashboardStats,
    ProdutoPontaEstoque,
    ProdutoEstoqueBaixo
} from '../services/dashboardService';

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [produtosPontaEstoque, setProdutosPontaEstoque] = useState<ProdutoPontaEstoque[]>([]);
    const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState<ProdutoEstoqueBaixo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [statsData, pontaEstoque, estoqueBaixo] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getProdutosPontaEstoque(),
                dashboardService.getProdutosEstoqueBaixoSeparacao()
            ]);

            setStats(statsData);
            setProdutosPontaEstoque(pontaEstoque);
            setProdutosEstoqueBaixo(estoqueBaixo);
        } catch (error: any) {
            setError(error?.response?.data?.message || 'Erro ao carregar dados do dashboard');
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px'
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ m: 2 }}>
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Box>
        );
    }

    const statsConfig = [
        {
            title: 'Produtos em Estoque',
            value: stats?.produtosComEstoque.toString() || '0',
            icon: <Inventory fontSize="large" />,
            color: '#1976d2',
        },
        ...(produtosPontaEstoque.length > 0 ? [{
            title: 'Itens em Ponta de Estoque',
            value: produtosPontaEstoque.length.toString(),
            icon: <Recycling fontSize="large" />,
            color: '#009688',
        }] : []),
        {
            title: 'Listas Ativas',
            value: stats?.listasAtivas.toString() || '0',
            icon: <Assignment fontSize="large" />,
            color: '#d32f2f',
        },
        {
            title: 'Metragem Total',
            value: stats?.metragemTotal || '0,00',
            icon: <Business fontSize="large" />,
            color: '#388e3c',
        },
        {
            title: 'Endereçamentos',
            value: stats?.enderecamentosDisponiveis.toString() || '0',
            icon: <LocationOn fontSize="large" />,
            color: '#f57c00',
        },
        ...(stats?.vagasRestantes !== null && stats?.vagasRestantes !== undefined && stats?.vagasRestantes >= 0 ? [{
            title: 'Vagas Restantes',
            value: stats.vagasRestantes.toString(),
            icon: <QueryStats fontSize="large" />,
            color: '#7b1fa2',
        }] : []),
    ];

    return (
        <Box sx={{
            width: '100%',
            overflow: 'hidden',
            m: -1.5,
            p: { xs: 1, sm: 2 },
            maxWidth: '100vw',
            boxSizing: 'border-box',
            position: 'relative',
        }}>



            <Typography variant="h4" gutterBottom sx={{ position: 'relative', zIndex: 1 }}>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                {statsConfig.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card>
                            <CardContent>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box>
                                        <Typography color="textSecondary" variant="subtitle2">
                                            {stat.title}
                                        </Typography>
                                        <Typography variant="h4">
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ color: stat.color }}>
                                        {stat.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 3, pb: 0 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 460 }}>
                        <Typography variant="h6" gutterBottom>
                            Ponta de Estoque
                        </Typography>
                        {produtosPontaEstoque.length > 0 ? (
                            <Box sx={{ height: 390, width: '100%', overflowX: 'auto' }}>
                                <DataGrid
                                    rows={produtosPontaEstoque.map((produto, idx) => ({
                                        id: `${produto.id || idx}-${produto.lote}-${produto.ton}-${produto.bit}`,
                                        descricao: produto.descricao,
                                        fornecedor: produto.fornecedor,
                                        lote: produto.lote,
                                        ton: produto.ton,
                                        bit: produto.bit,
                                        totalDisponivel: produto.totalDisponivel,
                                        quantMinVenda: produto.quantMinVenda
                                    }))}
                                    columns={[
                                        {
                                            field: 'descricao',
                                            headerName: 'Descrição',
                                            flex: 1.2,
                                            minWidth: 300,
                                            renderCell: (params) => (
                                                <Box>
                                                    <Typography variant="body2" noWrap>{params.value}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{params.row.fornecedor}</Typography>
                                                </Box>
                                            )
                                        },
                                        { field: 'lote', headerName: 'Lote', flex: 0.7, minWidth: 120 },
                                        { field: 'ton', headerName: 'Tonalidade', flex: 0.7, minWidth: 120 },
                                        { field: 'bit', headerName: 'Bitola', flex: 0.7, minWidth: 120 },
                                        {
                                            field: 'totalDisponivel',
                                            headerName: 'Total',
                                            flex: 0.9,
                                            minWidth: 140,
                                            valueFormatter: ({ value }) => `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`
                                        },
                                        {
                                            field: 'quantMinVenda',
                                            headerName: 'Mín Venda',
                                            flex: 0.9,
                                            minWidth: 150,
                                            align: 'right',
                                            headerAlign: 'right',
                                            valueFormatter: ({ value }) => Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                        }
                                    ]}
                                    pageSizeOptions={[5]}
                                    initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                                    localeText={dataGridPtBR}
                                    sx={{
                                        ...dataGridStyles.dataGridSx,
                                        '& .MuiDataGrid-main': {
                                            overflowX: 'auto',
                                            overflowY: 'hidden'
                                        },
                                        '& .MuiDataGrid-virtualScroller': {
                                            overflowX: 'auto',
                                            overflowY: 'auto'
                                        }
                                    }}
                                />
                            </Box>
                        ) : (
                            <Typography color="textSecondary" sx={{ mt: 2 }}>
                                Nenhum produto em ponta de estoque encontrado.
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 460 }}>
                        <Typography variant="h6" gutterBottom>
                            Estoque Baixo na Separação
                        </Typography>
                        {produtosEstoqueBaixo.length > 0 ? (
                            <Box sx={{ height: 390, width: '100%', overflowX: 'auto' }}>
                                <DataGrid
                                    rows={produtosEstoqueBaixo.map((produto, idx) => ({
                                        id: produto.id || idx,
                                        descricao: produto.descricao,
                                        fornecedor: produto.fornecedor,
                                        estoque: produto.estoque ?? 0
                                    }))}
                                    columns={[
                                        {
                                            field: 'descricao',
                                            headerName: 'Descrição',
                                            flex: 1.2,
                                            minWidth: 300,
                                            renderCell: (params) => (
                                                <Box>
                                                    <Typography variant="body2" noWrap>{params.value}</Typography>
                                                    <Typography variant="caption" color="textSecondary">{params.row.fornecedor}</Typography>
                                                </Box>
                                            )
                                        },
                                        {
                                            field: 'estoque',
                                            headerName: 'Estoque Atual',
                                            flex: 0.9,
                                            minWidth: 160,
                                            align: 'right',
                                            headerAlign: 'right',
                                            valueFormatter: ({ value }) => `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`
                                        },
                                        {
                                            field: 'status',
                                            headerName: 'Status',
                                            flex: 0.7,
                                            minWidth: 120,
                                            align: 'right',
                                            headerAlign: 'right',
                                            renderCell: () => (
                                                <Typography sx={{ color: 'error.main' }}>Baixo</Typography>
                                            )
                                        }
                                    ]}
                                    pageSizeOptions={[5]}
                                    initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
                                    localeText={dataGridPtBR}
                                    sx={{
                                        ...dataGridStyles.dataGridSx,
                                        '& .MuiDataGrid-main': {
                                            overflowX: 'auto',
                                            overflowY: 'hidden'
                                        },
                                        '& .MuiDataGrid-virtualScroller': {
                                            overflowX: 'auto',
                                            overflowY: 'auto'
                                        }
                                    }}
                                />
                            </Box>
                        ) : (
                            <Typography color="textSecondary" sx={{ mt: 2 }}>
                                Nenhum produto com estoque baixo encontrado.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
