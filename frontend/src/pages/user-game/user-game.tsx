import React, {FC} from 'react';
import classes from './user-game.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import Header from "../../components/header/header";

const UserGame: FC = () => {
    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false} />
        </PageWrapper>
    );
}

export default UserGame;