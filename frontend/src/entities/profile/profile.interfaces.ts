import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';

export interface ProfileOwnProps {
    isAdmin: boolean;
}

export interface ProfileStateProps {
    userName: string;
    userEmail: string;
    userTeam: string;
}

export interface ProfileDispatchProps {
    onAddUserName: (name: string) => AppAction;
}

export type ProfileProps = ProfileOwnProps & ProfileStateProps & ProfileDispatchProps;