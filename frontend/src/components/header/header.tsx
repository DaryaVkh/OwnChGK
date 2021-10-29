import React, {FC} from 'react';
import classes from './header.module.scss';
import {HeaderProps} from "../../entities/header/header.interfaces";

const Header: FC<HeaderProps> = props => {
        return (
            <header className={classes.Header}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt='logo' />
                { props.children }
                {
                    props.isAdmin
                        ? <img className={classes.Profile} src={require('../../images/Profile.svg').default} alt='Profile' />
                        : null
                }
                {
                    props.isAdmin
                        ? <img className={classes.LogOut} src={require('../../images/LogOut.svg').default} alt='LogOut' />
                        : null
                }
            </header>
        );
}

export default Header;