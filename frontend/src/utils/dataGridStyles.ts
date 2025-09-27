// Estilos padronizados para DataGrid
export const dataGridStyles = {
    // Estilos para o container Paper
    paperContainer: {
        elevation: 8, // Sombra mais pronunciada
        borderRadius: 2, // Bordas mais arredondadas
        border: '1px solid',
        borderColor: 'divider',
        overflowX: 'auto',
        overflowY: 'hidden',
        display: 'flex',
        flexDirection: 'column' as const,
    },

    // Estilos para o DataGrid
    dataGridSx: {
        border: 'none',
        '& .MuiDataGrid-root': {
            border: 'none',
        },
        '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: 'divider',
        },
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'action.hover',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            fontWeight: 'bold',
            '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 'bold',
                fontSize: '0.9rem',
            },
        },
        '& .MuiDataGrid-row:hover': {
            backgroundColor: 'action.hover',
            cursor: 'pointer',
        },
        '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: 'action.selected',
        },
        '& .MuiDataGrid-row.Mui-selected': {
            backgroundColor: 'primary.light',
            '&:hover': {
                backgroundColor: 'primary.light',
            },
        },
        '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid',
            borderColor: 'divider',
            backgroundColor: 'background.default',
        },
        '& .MuiDataGrid-main': {
            overflowX: 'auto',
            overflowY: 'hidden'
        },
        '& .MuiDataGrid-virtualScroller': {
            overflowX: 'auto',
            overflowY: 'auto'
        },
        // Melhor aparência para células de ação
        '& .MuiDataGrid-actionsCell': {
            gap: 1,
        },
        // Destaque para linhas com problemas (se houver)
        '& .row-warning': {
            backgroundColor: 'warning.light',
            '&:hover': {
                backgroundColor: 'warning.main',
            },
        },
        '& .row-error': {
            backgroundColor: 'error.light',
            '&:hover': {
                backgroundColor: 'error.main',
            },
        },
    }
};

// Configuração padrão para o DataGrid
export const defaultDataGridProps = {
    disableRowSelectionOnClick: true,
    pageSizeOptions: [10, 25, 50, 100],
    initialState: {
        pagination: {
            paginationModel: { pageSize: 25 },
        },
    },
};
