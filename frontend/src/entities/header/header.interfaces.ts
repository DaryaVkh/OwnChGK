import {User} from '../app/app.interfaces';
import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';
import {PropsWithChildren} from 'react';

export interface HeaderOwnProps {
    isAdmin?: boolean;
    isAuthorized: boolean;
}

export interface HeaderStateProps {
    user: User;
    isLoggedIn: boolean;
}

export interface HeaderDispatchProps {
    onLogOut: () => AppAction;
}

export type HeaderProps = PropsWithChildren<HeaderStateProps & HeaderDispatchProps & HeaderOwnProps>;