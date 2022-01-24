export type AnswerType = 'accepted' | 'unchecked' | 'rejected';
export type Page = 'answers' | 'oppositions';

export interface Opposition {
    teamName: string;
    answer: string;
    text: string;
}