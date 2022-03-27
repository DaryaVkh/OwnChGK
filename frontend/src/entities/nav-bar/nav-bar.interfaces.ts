import {Dispatch, SetStateAction} from 'react';

export interface NavBarProps {
    isAdmin: boolean;
    page: string;
    onLinkChange?: Dispatch<SetStateAction<string>>;
}

export interface MobileNavBarProps extends NavBarProps {
    isGame: boolean;
    toGame?: true;
    toAnswers?: true;
    gameId?: string;
}