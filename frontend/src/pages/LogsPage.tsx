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


const entidades = [
    { value: '', label: 'Todas' },
    { value: 'Usuario', label: 'Usuário' },
    { value: 'Produto', label: 'Produto' },
    { value: 'Fornecedor', label: 'Fornecedor' },
    { value: 'Lista', label: 'Lista' },
    { value: 'Rua', label: 'Rua' },
    { value: 'Predio', label: 'Prédio' },
    { value: 'Enderecamento', label: 'Endereçamento' },
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
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'dataHora', headerName: 'Data/Hora', minWidth: 170, flex: 0.7 },
        { field: 'usuario', headerName: 'Usuário', minWidth: 150, flex: 0.7 },
        { field: 'entidade', headerName: 'Entidade', minWidth: 120, flex: 0.6 },
        { field: 'tipo', headerName: 'Tipo', minWidth: 120, flex: 0.5 },
        { field: 'detalhes', headerName: 'Detalhes', minWidth: 250, flex: 1.2 },
    ];

    return (
        <Box sx={{ width: '100%', overflow: 'hidden', m: -1.5, p: { xs: 1, sm: 2 }, maxWidth: '100vw', boxSizing: 'border-box' }}>
            <Typography variant="h4" gutterBottom>
                Logs do Sistema
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', width: '100%' }}>
                <Box sx={{ display: 'flex', flex: 1, gap: 2, minWidth: 0 }}>
                    <TextField
                        fullWidth
                        label="Buscar por usuário ou detalhes"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        sx={{ minWidth: 220 }}
                    />
                    <FormControl fullWidth sx={{ minWidth: 180 }}>
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
                    <FormControl fullWidth sx={{ minWidth: 180 }}>
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
                    variant="contained"
                    onClick={handleFilter}
                    disabled={loading}
                    sx={{ minWidth: 120, height: '56px', alignSelf: 'flex-end' }}
                >
                    Filtrar
                </Button>
            </Box>
            <Paper sx={dataGridStyles.paperContainer}>
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
                        }
                    }}
                />
            </Paper>
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
