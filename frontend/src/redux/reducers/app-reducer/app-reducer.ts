import {Reducer} from "redux";
import {AppAction, AppReducerState} from "./app-reducer.interfaces";
import {AUTHORIZE_USER_WITH_ROLE, LOG_OUT} from "../../actions/app-actions/app-action-types";

const initialState: AppReducerState = {
    user: {
        role: ''
    },
    isLoggedIn: false
}

export const appReducer: Reducer<AppReducerState, AppAction> = (state: AppReducerState = initialState, action: AppAction): AppReducerState => {
    switch (action.type) {
        case AUTHORIZE_USER_WITH_ROLE:
            return {
                ...state,
                user: {
                    ...state.user,
                    role: action.payload,
                },
                isLoggedIn: true
            }
        case LOG_OUT:
            return {
                ...state,
                user: {
                    ...state.user,
                    role: ''
                },
                isLoggedIn: false
            }
        default:
            return state;
    }
}