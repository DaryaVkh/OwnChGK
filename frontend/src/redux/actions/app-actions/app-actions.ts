import {AUTHORIZE_USER_WITH_ROLE, CHECK_TOKEN, LOG_OUT} from './app-action-types';
import {AppAction} from "../../reducers/app-reducer/app-reducer.interfaces";

export function authorizeUserWithRole(role: string, team: string): AppAction {
    return {
        type: AUTHORIZE_USER_WITH_ROLE,
        payload: {role, team}
    };
}

export function checkToken(): AppAction {
    return {
        type: CHECK_TOKEN
    }
}

export function logOut(): AppAction {
    return {
        type: LOG_OUT
    }
}