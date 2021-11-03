import React from 'react';

export interface CustomCheckboxProps {
    name: string;
    checked?: true;
    onChange?: (event: React.SyntheticEvent) => void;
}