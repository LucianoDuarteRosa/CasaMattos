import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useUppercaseInput } from '../hooks';

interface UppercaseTextFieldProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    uppercase?: boolean;
}

/**
 * Campo de texto que automaticamente converte o texto para maiúscula
 */
export const UppercaseTextField: React.FC<UppercaseTextFieldProps> = ({
    value,
    onChange,
    uppercase = true,
    ...props
}) => {
    const { value: inputValue, onChange: handleChange, setValue } = useUppercaseInput(value, uppercase);

    React.useEffect(() => {
        setValue(value);
    }, [value, setValue]);

    React.useEffect(() => {
        if (inputValue !== value) {
            onChange(inputValue);
        }
    }, [inputValue, onChange, value]);

    return (
        <TextField
            {...props}
            value={inputValue}
            onChange={handleChange}
        />
    );
};
