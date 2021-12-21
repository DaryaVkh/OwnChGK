import {AppAction} from "../../redux/reducers/app-reducer/app-reducer.interfaces";
import {User} from '../app/app.interfaces';

export interface AuthorizationOwnProps {
    isAdmin?: boolean;
}

export interface AuthorizationStateProps {
    isLoggedIn: boolean;
    user: User;
}

export interface AuthorizationDispatchProps {
    onAuthorizeUserWithRole: (role: string, team: string) => AppAction;
}

export type AuthorizationProps = AuthorizationStateProps & AuthorizationDispatchProps & AuthorizationOwnProps;
