
import React, { useState } from 'react';
import { useSnackbar } from '@/components/SnackbarProvider';
import { importacaoService } from '@/services/importacaoService';
import {
    Box,
    Typography,
    Paper,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { dataGridPtBR } from '@/utils/dataGridLocale';
import { dataGridStyles } from '@/utils/dataGridStyles';

const importTypes = [
    { value: 'produtos', label: 'Importar Produtos' },
    { value: 'fornecedores', label: 'Importar Fornecedores' },
    { value: 'separacao', label: 'Importar Separação' },
];

const ImportacaoPage: React.FC = () => {
    const [importType, setImportType] = useState('produtos');
    const [file, setFile] = useState<File | null>(null);
    const [fileRead, setFileRead] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const [loading, setLoading] = useState(false);
    const { showSnackbar } = useSnackbar();

    // Exemplo de colunas para produtos (ajustar depois para leitura real do arquivo)
    React.useEffect(() => {
        if (importType === 'produtos') {
            setColumns([
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'codInterno', headerName: 'Código', width: 100 },
                { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 180 },
                {
                    field: 'quantidadeMinimaVenda',
                    headerName: 'Qtd. Mín. Venda',
                    width: 120,
                    type: 'number',
                    valueFormatter: (params: any) => {
                        const value = params.value && params.value !== '' ? Number(params.value) : 0;
                        return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                },
                {
                    field: 'custo',
                    headerName: 'Custo',
                    width: 100,
                    type: 'number',
                    valueFormatter: (params: any) => {
                        const value = params.value && params.value !== '' ? Number(params.value) : 0;
                        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
                    }
                },
                { field: 'fornecedor', headerName: 'Fornecedor', width: 180 },
                { field: 'status', headerName: 'Status', width: 120 },
                { field: 'observacao', headerName: 'Observação', flex: 1, minWidth: 180 },
            ]);
        } else if (importType === 'fornecedores') {
            setColumns([
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'razaoSocial', headerName: 'Razão Social', flex: 1, minWidth: 200 },
                { field: 'cnpj', headerName: 'CNPJ', width: 180 },
                { field: 'status', headerName: 'Status', width: 120 },
                { field: 'observacao', headerName: 'Observação', flex: 2, minWidth: 300 },
            ]);
        } else if (importType === 'separacao') {
            setColumns([
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'descricao', headerName: 'Descrição', flex: 1, minWidth: 180 },
                { field: 'quantidade', headerName: 'Quantidade', width: 120 },
            ]);
        }
        setRows([]);
        setFile(null);
        setFileRead(false);
    }, [importType]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setFileRead(false);
            setRows([]);
            // Limpa o valor do input para permitir selecionar o mesmo arquivo novamente
            e.target.value = '';
        }
    };

    // Envia arquivo e tipo para a API
    const handleReadFile = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const resp = await importacaoService.importar(importType, file);
            if ((importType === 'fornecedores' || importType === 'produtos') && resp.resultados) {
                // Adiciona id incremental para o DataGrid
                console.log(resp.resultados)
                const rowsWithId = resp.resultados.map((row: any, idx: number) => ({
                    id: idx + 1,
                    ...row
                }));
                setRows(rowsWithId);
            } else {
                setRows([{ id: 1, descricao: resp.message }]);
            }
            setFileRead(true);
        } catch (e: any) {
            setRows([{ id: 1, descricao: 'Erro ao importar arquivo' }]);
            setFileRead(false);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (importType === 'fornecedores') {
            const fornecedoresParaEnviar = rows.filter((row: any) => row.status === 'Sucesso')
                .map((row: any) => ({ cnpj: row.cnpj, razaoSocial: row.razaoSocial }));
            if (fornecedoresParaEnviar.length === 0) {
                showSnackbar('Nenhum fornecedor válido para importar.', 'info');
                return;
            }
            setLoading(true);
            try {
                const resp = await importacaoService.confirmarImportacao(fornecedoresParaEnviar);
                showSnackbar(resp.message || 'Importação realizada!', 'success');
            } catch (e: any) {
                showSnackbar('Erro ao importar fornecedores', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            alert('Importação realizada!');
        }
    };

    return (
        <Box sx={{ width: '100%', overflow: 'hidden', m: -1.5, p: { xs: 1, sm: 2 }, maxWidth: '100vw', boxSizing: 'border-box' }}>
            <Typography variant="h4" gutterBottom>
                Importação
            </Typography>
            {/* Controles de importação, alinhados à esquerda/topo */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1, flex: 1, minWidth: '200px' }}>
                    <FormControl sx={{ minWidth: 220 }}>
                        <InputLabel id="import-type-label">Tipo de Importação</InputLabel>
                        <Select
                            labelId="import-type-label"
                            value={importType}
                            label="Tipo de Importação"
                            onChange={e => setImportType(e.target.value)}
                        >
                            {importTypes.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        component="label"
                    >
                        Selecionar Arquivo
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    <TextField
                        label="Arquivo Selecionado"
                        value={file ? file.name : ''}
                        disabled
                        sx={{ flex: 1, minWidth: 180 }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!file}
                        onClick={handleReadFile}
                    >
                        Ler Arquivo
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        disabled={!fileRead || rows.length === 0}
                        onClick={handleImport}
                    >
                        Importar
                    </Button>
                </Box>

            </Box>
            <Box sx={{ maxWidth: '100%', mt: 1 }}>
                <Paper sx={dataGridStyles.paperContainer}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
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
                        autoHeight
                    />
                </Paper>
            </Box>
        </Box>
    );
};

export default ImportacaoPage;
