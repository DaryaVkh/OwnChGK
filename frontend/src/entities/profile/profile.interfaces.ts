export interface ProfileOwnProps {
    isAdmin: boolean;
}

export interface ProfileStateProps {
    userName: string;
    userEmail: string;
    userTeam: string;
}

export type ProfileProps = ProfileOwnProps & ProfileStateProps;