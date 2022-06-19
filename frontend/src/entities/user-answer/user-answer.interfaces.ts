export interface UserAnswerProps {
    answer?: string;
    gamePart: string;
    status: 'success' | 'error' | 'opposition' | 'no-answer';
    order: number;
    gamePart: 'chgk' | 'matrix';
}
