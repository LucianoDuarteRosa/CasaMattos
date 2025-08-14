import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar inputs que devem ser automaticamente convertidos para maiúscula
 * @param initialValue - Valor inicial do input
 * @param shouldUppercase - Se deve converter para maiúscula (padrão: true)
 * @returns Objeto com value, onChange e setValue
 */
export const useUppercaseInput = (
    initialValue: string = '',
    shouldUppercase: boolean = true
) => {
    const [value, setValue] = useState(
        shouldUppercase ? initialValue.toUpperCase() : initialValue
    );

    const onChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const inputValue = event.target.value;
        setValue(shouldUppercase ? inputValue.toUpperCase() : inputValue);
    }, [shouldUppercase]);

    const setValueDirectly = useCallback((newValue: string) => {
        setValue(shouldUppercase ? newValue.toUpperCase() : newValue);
    }, [shouldUppercase]);

    return {
        value,
        onChange,
        setValue: setValueDirectly
    };
};

/**
 * Hook para gerenciar múltiplos campos que devem ser convertidos para maiúscula
 * @param initialData - Dados iniciais do formulário
 * @param uppercaseFields - Array com os nomes dos campos que devem ser maiúscula
 * @returns Objeto com data, handleChange, setData e funções auxiliares
 */
export const useUppercaseForm = <T extends Record<string, any>>(
    initialData: T,
    uppercaseFields: (keyof T)[] = []
) => {
    // Inicializar dados com campos em maiúscula onde necessário
    const initializeData = (data: T): T => {
        const result = { ...data };
        uppercaseFields.forEach(field => {
            if (typeof result[field] === 'string') {
                (result as any)[field] = (result[field] as string).toUpperCase();
            }
        });
        return result;
    };

    const [data, setDataState] = useState(initializeData(initialData));

    const handleChange = useCallback((field: keyof T) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;
        const processedValue = uppercaseFields.includes(field) && typeof value === 'string'
            ? value.toUpperCase()
            : value;

        setDataState(prev => ({
            ...prev,
            [field]: processedValue as T[keyof T]
        }));
    }, [uppercaseFields]);

    const setData = useCallback((newData: Partial<T>) => {
        setDataState(prev => {
            const updated = { ...prev, ...newData };
            return initializeData(updated);
        });
    }, [uppercaseFields]);

    const resetForm = useCallback(() => {
        setDataState(initializeData(initialData));
    }, [initialData, uppercaseFields]);

    return {
        data,
        handleChange,
        setData,
        resetForm
    };
};
