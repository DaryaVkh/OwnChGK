import React from 'react';

export interface InputProps {
    type: string;
    id: string;
    name: string;
    placeholder: string;
    isInvalid?: boolean,
    onBlur?: () => void;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    style?: object;
    defaultValue?: string;
    required?: boolean;
    onFocus?: () => void;
}