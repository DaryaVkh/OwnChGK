export interface UserAnswerProps {
    answer: string;
    status: 'success' | 'error' | 'opposition';
    order: number;
}