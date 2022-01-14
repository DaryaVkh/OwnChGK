import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';

export interface RegistrationDispatchProps {
    onAuthorizeUserWithRole: (role: string, team: string, email: string, name: string) => AppAction;
}

export type RegistrationProps = RegistrationDispatchProps;