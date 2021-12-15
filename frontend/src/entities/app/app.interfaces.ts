export interface User {
    role: string;
}

export interface AppStateProps {
    user: User;
    isLoggedIn: boolean;
}

export type AppProps = AppStateProps;

export interface AppState {
    appReducer: AppStateProps
}

