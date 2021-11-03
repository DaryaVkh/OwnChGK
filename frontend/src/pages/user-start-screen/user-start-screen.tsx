import React, {FC} from 'react';
import classes from './user-start-screen.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import NavBar from "../../components/nav-bar/nav-bar";
import Header from "../../components/header/header";

const UserStartScreen: FC = () => {
    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <NavBar isAdmin={false} />
            </Header>

            <div className={classes.contentWrapper}>

            </div>
        </PageWrapper>
    );
}

export default UserStartScreen;