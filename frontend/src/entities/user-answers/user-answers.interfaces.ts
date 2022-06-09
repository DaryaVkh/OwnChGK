export interface UserAnswersPageStateProps {
    userTeam: string;
}

export type UserAnswersPageProps = UserAnswersPageStateProps;

export interface Answer {
    answer: string;
    status: 'success' | 'error' | 'opposition' | 'no-answer';
    number: number;
}
