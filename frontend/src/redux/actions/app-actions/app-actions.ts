import {AUTHORIZE_USER_WITH_ROLE, LOG_OUT} from "./app-action-types";
import {AppAction} from "../../reducers/app-reducer/app-reducer.interfaces";

export function authorizeUserWithRole(role: string): AppAction {
    return {
        type: AUTHORIZE_USER_WITH_ROLE,
        payload: role
    };
}

export function logOut(): AppAction {
    return {
        type: LOG_OUT
    }
}