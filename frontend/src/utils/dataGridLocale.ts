import { ptBR } from '@mui/x-data-grid';

export const dataGridPtBR = {
    ...ptBR.components.MuiDataGrid.defaultProps.localeText,
    // Customizações adicionais se necessário
    noRowsLabel: 'Nenhum registro encontrado',
    noResultsOverlayLabel: 'Nenhum resultado encontrado',
    errorOverlayDefaultLabel: 'Ocorreu um erro',
    // Toolbar
    toolbarDensity: 'Densidade',
    toolbarDensityLabel: 'Densidade',
    toolbarDensityCompact: 'Compacta',
    toolbarDensityStandard: 'Padrão',
    toolbarDensityComfortable: 'Confortável',
    // Columns panel
    columnsPanelTextFieldLabel: 'Localizar coluna',
    columnsPanelTextFieldPlaceholder: 'Título da coluna',
    columnsPanelDragIconLabel: 'Reordenar coluna',
    columnsPanelShowAllButton: 'Mostrar todas',
    columnsPanelHideAllButton: 'Ocultar todas',
    // Filter panel
    filterPanelAddFilter: 'Adicionar filtro',
    filterPanelDeleteIconLabel: 'Excluir',
    filterPanelOperators: 'Operadores',
    filterPanelOperatorAnd: 'E',
    filterPanelOperatorOr: 'Ou',
    filterPanelColumns: 'Colunas',
    filterPanelInputLabel: 'Valor',
    filterPanelInputPlaceholder: 'Valor do filtro',
    // Filter operators text
    filterOperatorContains: 'contém',
    filterOperatorEquals: 'é igual a',
    filterOperatorStartsWith: 'começa com',
    filterOperatorEndsWith: 'termina com',
    filterOperatorIs: 'é',
    filterOperatorNot: 'não é',
    filterOperatorAfter: 'depois de',
    filterOperatorOnOrAfter: 'em ou depois de',
    filterOperatorBefore: 'antes de',
    filterOperatorOnOrBefore: 'em ou antes de',
    filterOperatorIsEmpty: 'está vazio',
    filterOperatorIsNotEmpty: 'não está vazio',
    // Pagination
    MuiTablePagination: {
        labelRowsPerPage: 'Linhas por página:',
        labelDisplayedRows: ({ from, to, count }: any) =>
            `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`,
    }
};
