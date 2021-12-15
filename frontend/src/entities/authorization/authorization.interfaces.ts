import {AppAction} from "../../redux/reducers/app-reducer/app-reducer.interfaces";

export interface AuthorizationOwnProps {
    isAdmin?: boolean;
}

export interface AuthorizationStateProps {
    isLoggedIn: boolean;
}

export interface AuthorizationDispatchProps {
    onAuthorizeUserWithRole: (role: string) => AppAction;
}

export type AuthorizationProps = AuthorizationStateProps & AuthorizationDispatchProps & AuthorizationOwnProps;
