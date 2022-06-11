export interface RatingProps {
    isAdmin: boolean;
}

export type Tour = number[];

export interface TeamResult {
    teamName: string;
    matrixSum: number;
    toursWithResults: Tour[];
}

export interface GameParams {
    toursCount: number;
    questionsCount: number;
}