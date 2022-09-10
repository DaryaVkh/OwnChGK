export interface UserAnswerProps {
    answer?: string;
    status: 'success' | 'error' | 'opposition' | 'no-answer';
    order: number;
    gamePart: 'chgk' | 'matrix';
    isAdmin: boolean;
    teamId?: string;
    onChangeStatus?: (gamePart: string, order: number, status: 'success' | 'error' | 'opposition' | 'no-answer') => void;
}
