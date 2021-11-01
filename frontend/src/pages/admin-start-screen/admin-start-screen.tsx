import React, {FC} from 'react';
import classes from './admin-start-screen.module.scss';
import Header from "../../components/header/header";
import NavBar from "../../components/nav-bar/nav-bar";
import {NavLink} from 'react-router-dom';
import PageWrapper from "../../components/page-wrapper/page-wrapper";

const AdminStartScreen: FC = () => {
    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <NavBar />
            </Header>

            <div className={classes.contentWrapper}>

                <button>Перейти к текущей игре</button>

                <NavLink to='/game-creation' exact={true}>
                    <button>Создать новую игру</button>
                </NavLink>

                <NavLink to='/team-creation'>
                    <button>Создать новую команду</button>
                </NavLink>
            </div>
        </PageWrapper>
    );
}

export default AdminStartScreen;