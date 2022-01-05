import {User} from '../../../entities/app/app.interfaces';

export interface AppAction {
    type: string;
    payload?: any;
}

export interface AppReducerState {
    user: User;
    isLoggedIn: boolean;
    isTokenChecked: boolean;
}