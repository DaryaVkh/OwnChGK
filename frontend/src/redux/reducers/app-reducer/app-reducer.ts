import {Reducer} from 'redux';
import {AppAction, AppReducerState} from './app-reducer.interfaces';
import {
    AUTHORIZE_USER_WITH_ROLE,
    LOG_OUT,
    CHECK_TOKEN,
    ADD_USER_TEAM,
    ADD_USER_NAME
} from '../../actions/app-actions/app-action-types';

const initialState: AppReducerState = {
    user: {
        role: '',
        team: '',
        email: '',
        name: ''
    },
    isLoggedIn: false,
    isTokenChecked: false
};

export const appReducer: Reducer<AppReducerState, AppAction> = (state: AppReducerState = initialState, action: AppAction): AppReducerState => {
    switch (action.type) {
        case AUTHORIZE_USER_WITH_ROLE:
            return {
                ...state,
                user: {
                    ...state.user,
                    role: action.payload.role,
                    team: action.payload.team,
                    email: action.payload.email,
                    name: action.payload.name
                },
                isLoggedIn: true,
                isTokenChecked: true
            };
        case LOG_OUT:
            return {
                ...state,
                user: {
                    ...state.user,
                    role: '',
                    team: '',
                    email: '',
                    name: '',
                },
                isLoggedIn: false
            };
        case CHECK_TOKEN:
            return {
                ...state,
                isTokenChecked: true
            };
        case ADD_USER_TEAM:
            return {
                ...state,
                user: {
                    ...state.user,
                    team: action.payload
                }
            }
        case ADD_USER_NAME:
            return {
                ...state,
                user: {
                    ...state.user,
                    name: action.payload
                }
            }
        default:
            return state;
    }
};