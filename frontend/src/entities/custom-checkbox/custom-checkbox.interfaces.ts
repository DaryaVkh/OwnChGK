import React from 'react';

export interface CustomCheckboxProps {
    name: string;
    checked?: boolean;
    onChange?: (event: React.SyntheticEvent) => void;
    style?: object;
}