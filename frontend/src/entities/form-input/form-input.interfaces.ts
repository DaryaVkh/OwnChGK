export interface InputProps {
    type: string;
    id: string;
    name: string;
    placeholder: string;
    isInvalid?: boolean,
    onBlur?: () => void;
    style?: object;
}