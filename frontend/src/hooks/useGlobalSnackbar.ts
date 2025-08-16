import { useContext } from 'react';
import { SnackbarContext } from '@/components/SnackbarProvider';

export const useGlobalSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useGlobalSnackbar deve ser usado dentro de um SnackbarProvider');
    }
    return context;
};
