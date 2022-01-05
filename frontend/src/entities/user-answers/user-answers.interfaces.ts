export interface UserAnswersPageProps {
}

export interface Answer {
    answer: string;
    status: 'success' | 'error' | 'opposition';
}