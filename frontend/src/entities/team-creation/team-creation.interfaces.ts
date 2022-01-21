import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';

export interface TeamCreatorOwnProps {
    mode: 'creation' | 'edit';
    isAdmin: boolean;
}

export interface TeamCreatorStateProps {
    userEmail: string;
}

export interface TeamCreatorDispatchProps {
    onAddUserTeam: (team: string) => AppAction;
}

export type TeamCreatorProps = TeamCreatorOwnProps & TeamCreatorStateProps & TeamCreatorDispatchProps;