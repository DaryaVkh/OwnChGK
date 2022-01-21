import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';

export interface UserStartScreenDispatchProps {
    onAddUserTeam: (team: string) => AppAction;
}

export type UserStartScreenProps = UserStartScreenDispatchProps;