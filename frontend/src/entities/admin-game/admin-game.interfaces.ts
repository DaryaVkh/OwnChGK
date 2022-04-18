export interface AdminGameProps {
    //gameName?: string;
}

export interface TourProps {
    tourNumber: number;
    tourIndex: number;
    gamePart: 'matrix' | 'chgk';
    tourName?: string;
}