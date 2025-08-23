
import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Grid,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';


import { useEffect } from 'react';
import { fornecedorService } from '@/services/fornecedorService';
import { exportacaoService } from '@/services/exportacaoService';
import { IFornecedor } from '@/types';

const ExportacaoPage: React.FC = () => {
    const [tipoExportacao, setTipoExportacao] = useState<'geral' | 'fornecedor'>('geral');
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState<number | ''>('');
    const [exportando, setExportando] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('info');


    const [fornecedores, setFornecedores] = useState<IFornecedor[]>([]);

    useEffect(() => {
        loadFornecedores();
    }, []);

    const loadFornecedores = async () => {
        try {
            const data = await fornecedorService.getAll();
            setFornecedores(data);
        } catch (error: any) {
            showNotification('Erro ao carregar fornecedores', 'error');
        }
    };

    // Notificação
    const showNotification = (message: string, severity: 'success' | 'error' | 'info' = 'info') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    // Handlers de exportação
    const downloadExcel = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleExportarGeral = async () => {
        setExportando(true);
        try {
            const blob = await exportacaoService.exportarInventario();
            downloadExcel(blob, 'inventario_geral.xlsx');
            showNotification('Exportação de Inventário Geral iniciada!', 'success');
        } catch (e) {
            showNotification('Erro ao exportar inventário geral', 'error');
        }
        setExportando(false);
    };

    const handleExportarFornecedor = async () => {
        if (!fornecedorSelecionado) {
            showNotification('Selecione um fornecedor!', 'error');
            return;
        }
        setExportando(true);
        try {
            const blob = await exportacaoService.exportarInventario(Number(fornecedorSelecionado));
            downloadExcel(blob, 'inventario_fornecedor.xlsx');
            showNotification('Exportação do Inventário do Fornecedor iniciada!', 'success');
        } catch (e) {
            showNotification('Erro ao exportar inventário do fornecedor', 'error');
        }
        setExportando(false);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            {/* Card de Exportação */}
            <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Exportação de Dados
                </Typography>
                <Divider sx={{ my: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="tipo-exportacao-label">Tipo de Exportação</InputLabel>
                            <Select
                                labelId="tipo-exportacao-label"
                                value={tipoExportacao}
                                label="Tipo de Exportação"
                                onChange={e => {
                                    setTipoExportacao(e.target.value as 'geral' | 'fornecedor');
                                    setFornecedorSelecionado('');
                                }}
                            >
                                <MenuItem value="geral">Inventário Geral</MenuItem>
                                <MenuItem value="fornecedor">Inventário por Fornecedor</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {tipoExportacao === 'fornecedor' && (
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="fornecedor-label">Fornecedor</InputLabel>
                                <Select
                                    labelId="fornecedor-label"
                                    value={fornecedorSelecionado}
                                    label="Fornecedor"
                                    onChange={e => setFornecedorSelecionado(Number(e.target.value))}
                                >
                                    <MenuItem value="">Selecione um Fornecedor</MenuItem>
                                    {fornecedores.map(f => (
                                        <MenuItem key={f.id} value={f.id}>{f.razaoSocial}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        {tipoExportacao === 'geral' ? (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleExportarGeral}
                                disabled={exportando}
                                fullWidth
                                sx={{ mt: 1 }}
                                startIcon={exportando ? <CircularProgress size={20} /> : undefined}
                            >
                                Exportar Inventário Geral
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleExportarFornecedor}
                                disabled={exportando}
                                fullWidth
                                sx={{ mt: 1 }}
                                startIcon={exportando ? <CircularProgress size={20} /> : undefined}
                            >
                                Exportar Inventário do Fornecedor
                            </Button>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* Card de Templates para Importação */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Templates para Importação
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Baixe os arquivos modelo para importar dados no sistema.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                    <Button
                        variant="outlined"
                        component="a"
                        href="/template_fornecedores.xlsx"
                        download
                    >
                        Template Fornecedores
                    </Button>
                    <Button
                        variant="outlined"
                        component="a"
                        href="/template_produtos.xlsx"
                        download
                    >
                        Template Produtos
                    </Button>
                    <Button
                        variant="outlined"
                        component="a"
                        href="/template_separacao.csv"
                        download
                    >
                        Template Separação
                    </Button>
                </Box>
            </Paper>

            {/* Snackbar para notificações */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3500}
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

export default ExportacaoPage;
