import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';

export interface User {
    role: string;
    team: string;
    email: string,
    name: string
}

export interface AppStateProps {
    user: User;
    isLoggedIn: boolean;
    isTokenChecked: boolean;
}

export interface AppDispatchProps {
    onCheckToken: () => AppAction;
    onAuthorizeUserWithRole: (role: string, team: string, email: string, name: string) => AppAction;
}

export type AppProps = AppStateProps & AppDispatchProps;

export interface AppState {
    appReducer: AppStateProps;
}

