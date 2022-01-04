import {Reducer} from 'redux';
import {AppAction, AppReducerState} from './app-reducer.interfaces';
import {AUTHORIZE_USER_WITH_ROLE, LOG_OUT, CHECK_TOKEN} from '../../actions/app-actions/app-action-types';

const initialState: AppReducerState = {
    user: {
        role: '',
        team: ''
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
                    team: action.payload.team
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
                    team: ''
                },
                isLoggedIn: false
            };
        case CHECK_TOKEN:
            return {
                ...state,
                isTokenChecked: true
            };
        default:
            return state;
    }
};