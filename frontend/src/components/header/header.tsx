import React, {FC, Fragment} from 'react';
import classes from './header.module.scss';
import {HeaderDispatchProps, HeaderProps, HeaderStateProps} from '../../entities/header/header.interfaces';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {AppState} from '../../entities/app/app.interfaces';
import {Dispatch} from 'redux';
import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';
import {logOut} from '../../redux/actions/app-actions/app-actions';

const Header: FC<HeaderProps> = props => {
    const handleLogout = async () => {
        logOut();
        props.onLogOut();
    };

    return (
        <header className={classes.Header}>
            <Link to={props.isAdmin ? '/admin/start-screen' : '/start-screen'} className={classes.logoLink}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>
            </Link>

            <div className={classes.childrenWrapper}>
                {props.children}
            </div>

            {
                props.isAuthorized
                    ?
                    <Fragment>
                        <Link className={classes.Profile} to={props.isAdmin ? '/admin/profile' : '/profile'}>
                            <img className={classes.Profile} src={require('../../images/Profile.svg').default}
                                 alt="Profile"/>
                        </Link>
                        <Link className={classes.LogOut}
                              to={props.isLoggedIn ? '#' : (props.isAdmin ? '/admin' : '/auth')} onClick={handleLogout}>
                            <img className={classes.LogOut} src={require('../../images/LogOut.svg').default}
                                 alt="LogOut"/>
                        </Link>
                    </Fragment>
                    : null
            }
        </header>
    );
};

function mapStateToProps(state: AppState): HeaderStateProps {
    return {
        user: state.appReducer.user,
        isLoggedIn: state.appReducer.isLoggedIn
    };
}

function mapDispatchToProps(dispatch: Dispatch<AppAction>): HeaderDispatchProps {
    return {
        onLogOut: () => dispatch(logOut())
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);