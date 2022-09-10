export interface UserAnswerProps {
    answer?: string;
    status: 'success' | 'error' | 'opposition' | 'no-answer';
    order: number;
    gamePart: 'chgk' | 'matrix';
    isAdmin: boolean;
    teamId?: string;
}
