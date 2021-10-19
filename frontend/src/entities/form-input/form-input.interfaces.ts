export interface InputProps {
    type: string;
    id: string;
    name: string;
    placeholder: string;
    onBlur?: () => void;
}