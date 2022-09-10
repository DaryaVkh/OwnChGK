import {Tour} from '../rating/rating.interfaces';
import {Dispatch, SetStateAction} from 'react';

export interface TourHeaderCellProps {
    tourNumber: number;
    questionsCount: number;
    isExpanded: boolean;
    setIsExpanded: Dispatch<SetStateAction<boolean[]>>;
}

export interface TeamTableRowProps {
    place: number | string;
    teamName: string;
    teamId: string;
    matrixSum: number;
    toursWithResults: Tour[];
    isExpanded: boolean[];
    gameId: string;
    isAdmin: boolean;
}