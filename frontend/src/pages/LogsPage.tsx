import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { logService } from '../services/logService';
import { LogEntry } from '../types';
import { dataGridPtBR } from '../utils/dataGridLocale';
import { dataGridStyles } from '../utils/dataGridStyles';
import { Search } from '@mui/icons-material';

const entidades = [
    { value: '', label: 'Todas' },
    { value: 'Usuario', label: 'Usuário' },
    { value: 'Produto', label: 'Produto' },
    { value: 'Fornecedor', label: 'Fornecedor' },
    { value: 'Lista', label: 'Lista' },
    { value: 'Rua', label: 'Rua' },
    { value: 'Predio', label: 'Prédio' },
    { value: 'Enderecamento', label: 'Endereçamento' },
    { value: 'Configuração', label: 'Configuração' },
    { value: 'SMTP', label: 'Envio de E-mail' },
];

const tipos = [
    { value: '', label: 'Todos' },
    { value: 'CREATE', label: 'Criação' },
    { value: 'UPDATE', label: 'Atualização' },
    { value: 'DELETE', label: 'Exclusão' },
];

const LogsPage: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [entidade, setEntidade] = useState('');
    const [tipo, setTipo] = useState('');
    const [search, setSearch] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

    const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity as 'success' | 'error');
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (_?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await logService.list({ entidade, tipo, search });
            setLogs(data);
        } catch (error: any) {
            showNotification(error.response?.data?.error || 'Erro ao carregar logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
        // eslint-disable-next-line
    }, []);

    const handleFilter = () => {
        loadLogs();
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', minWidth: 120, flex: 0.2 },
        {
            field: 'dataHora',
            headerName: 'Data/Hora',
            minWidth: 200,
            flex: 0.5,
            valueFormatter: (params) => {
                const date = new Date(params.value);
                return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            }
        },
        { field: 'usuario', headerName: 'Usuário', minWidth: 160, flex: 0.6 },
        { field: 'entidade', headerName: 'Entidade', minWidth: 160, flex: 0.6 },
        { field: 'tipo', headerName: 'Tipo', minWidth: 140, flex: 0.4 },
        { field: 'detalhes', headerName: 'Detalhes', minWidth: 400, flex: 2.2 },
    ];

    return (
        <Box sx={{ width: '100%', overflow: 'hidden', m: -1.5, p: { xs: 1, sm: 2 }, maxWidth: '100vw', boxSizing: 'border-box' }}>
            <Typography variant="h4" gutterBottom>
                Logs do Sistema
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', width: '100%', alignItems: 'flex-end' }}>
                <Box sx={{ display: 'flex', flex: 1, gap: 2, minWidth: 0, flexWrap: 'wrap' }}>
                    <TextField
                        fullWidth
                        label="Buscar por usuário ou detalhes"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        sx={{ flex: 1, minWidth: 220 }}
                        InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
                    />
                    <FormControl fullWidth sx={{ minWidth: 200, flex: { xs: '1 1 220px', md: '0 0 240px' } }}>
                        <InputLabel>Entidade</InputLabel>
                        <Select
                            value={entidade}
                            label="Entidade"
                            onChange={e => setEntidade(e.target.value)}
                        >
                            {entidades.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ minWidth: 200, flex: { xs: '1 1 220px', md: '0 0 240px' } }}>
                        <InputLabel>Tipo</InputLabel>
                        <Select
                            value={tipo}
                            label="Tipo"
                            onChange={e => setTipo(e.target.value)}
                        >
                            {tipos.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Button
                    variant="outlined"
                    onClick={handleFilter}
                    disabled={loading}
                    sx={{
                        minWidth: 140,
                        height: { xs: 'auto', sm: '56px' },
                        flex: { xs: '1 1 100%', md: '0 0 auto' }
                    }}
                >
                    Filtrar
                </Button>
            </Box>
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Paper sx={{ ...dataGridStyles.paperContainer, minWidth: 900 }}>
                    <DataGrid
                        rows={logs}
                        columns={columns}
                        loading={loading}
                        pageSizeOptions={[10, 25, 50, 100]}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                        }}
                        disableRowSelectionOnClick
                        localeText={dataGridPtBR}
                        sx={{
                            ...dataGridStyles.dataGridSx,
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                            minWidth: 900
                        }}
                    />
                </Paper>
            </Box>
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

export default LogsPage;
