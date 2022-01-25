import {ADD_USER_NAME, ADD_USER_TEAM, AUTHORIZE_USER_WITH_ROLE, CHECK_TOKEN, LOG_OUT} from './app-action-types';
import {AppAction} from '../../reducers/app-reducer/app-reducer.interfaces';

export function authorizeUserWithRole(role: string, team: string, email: string, name: string): AppAction {
    return {
        type: AUTHORIZE_USER_WITH_ROLE,
        payload: {role, team, email, name}
    };
}

export function addUserTeam(team: string): AppAction {
    return {
        type: ADD_USER_TEAM,
        payload: team
    }
}

export function addUserName(name: string): AppAction {
    return {
        type: ADD_USER_NAME,
        payload: name
    }
}

export function checkToken(): AppAction {
    return {
        type: CHECK_TOKEN
    };
}

export function logOut(): AppAction {
    return {
        type: LOG_OUT
    };
}