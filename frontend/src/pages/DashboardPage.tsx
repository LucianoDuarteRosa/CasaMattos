import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Inventory,
    Business,
    LocationOn,
    Assignment,
    QueryStats
} from '@mui/icons-material';

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
        {
            title: 'Listas Ativas',
            value: stats?.listasAtivas.toString() || '0',
            icon: <Assignment fontSize="large" />,
            color: '#d32f2f',
        },
        ...(stats?.vagasRestantes !== null && stats?.vagasRestantes !== undefined && stats?.vagasRestantes >= 0 ? [{
            title: 'Vagas Restantes',
            value: stats.vagasRestantes.toString(),
            icon: <QueryStats fontSize="large" />,
            color: '#7b1fa2',
        }] : []),
            ...(produtosPontaEstoque.length > 0 ? [{
                title: 'Itens em Ponta de Estoque',
                value: produtosPontaEstoque.length.toString(),
                icon: <Recycling fontSize="large" />,
                color: '#009688',
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
                    <Grid item xs={12} sm={6} md={3} key={index}>
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

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Ponta de Estoque
                        </Typography>
                        {produtosPontaEstoque.length > 0 ? (
                            <TableContainer sx={{ maxHeight: 350 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Descrição</TableCell>
                                            <TableCell>Lote</TableCell>
                                            <TableCell align="center">Tonalidade</TableCell>
                                            <TableCell align="center">Bitola</TableCell>
                                            <TableCell align="center">Total</TableCell>
                                            <TableCell align="right">Mín Venda</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {produtosPontaEstoque.map((produto) => (
                                            <TableRow key={`${produto.id || produto.id}-${produto.lote}-${produto.ton}-${produto.bit}`}>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap>
                                                        {produto.descricao}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {produto.fornecedor}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{produto.lote}</TableCell>
                                                <TableCell align="center">{produto.ton}</TableCell>
                                                <TableCell align="center">{produto.bit}</TableCell>
                                                <TableCell align="center">
                                                    {Number(produto.totalDisponivel).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²
                                                </TableCell>
                                                <TableCell align="right">
                                                    {Number(produto.quantMinVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography color="textSecondary" sx={{ mt: 2 }}>
                                Nenhum produto em ponta de estoque encontrado.
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Estoque Baixo na Separação
                        </Typography>
                        {produtosEstoqueBaixo.length > 0 ? (
                            <TableContainer sx={{ maxHeight: 350 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Descrição</TableCell>
                                            <TableCell align="right">Estoque Atual</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {produtosEstoqueBaixo.map((produto) => (
                                            <TableRow key={produto.id}>
                                                <TableCell>
                                                    <Typography variant="body2" noWrap>
                                                        {produto.descricao}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {produto.fornecedor}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {Number(produto.estoque ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²
                                                </TableCell>
                                                <TableCell align="right" sx={{
                                                    color: 'error.main'
                                                }}>
                                                    Baixo
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
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
