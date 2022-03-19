import React, {FC, useEffect, useState} from 'react';
import classes from './mobile-menu.module.scss';
import {Link, useLocation} from 'react-router-dom';
import {logout} from '../../server-api/server-api';
import {connect} from 'react-redux';
import {AppState} from '../../entities/app/app.interfaces';
import {HeaderDispatchProps, HeaderStateProps} from '../../entities/header/header.interfaces';
import {Dispatch} from 'redux';
import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';
import {logOut} from '../../redux/actions/app-actions/app-actions';

interface MobileMenuOwnProps {
}

type MobileMenuProps = MobileMenuOwnProps & HeaderStateProps & HeaderDispatchProps;

const MobileMenu: FC<MobileMenuProps> = props => {
    const location = useLocation<{prevPath: string}>();
    const [gameId, setGameId] = useState<string>();

    useEffect(() => {
        const pathParts = location.state.prevPath.split('/');
        if (pathParts.length === 3 && (pathParts[1] === 'game' || pathParts[1] === 'game-answers')) {
            setGameId(pathParts[2]);
        }
    }, []);

    const handleLogout = async () => {
        logout().then(() => {});
        props.onLogOut();
    };

    return (
        <div className={classes.menuWrapper}>
            <Link className={classes.backArrow} to={location.state.prevPath || '/auth'}>
                <img className={classes.backArrow} src={require('../../images/ArrowBack.svg').default} alt='Back'/>
            </Link>

            <div className={classes.linksWrapper}>
                <div className={classes.linkWrapper}>
                    <Link to='/profile' className={classes.link}>Профиль</Link>
                </div>
                {
                    gameId !== undefined
                        ?
                        <div className={classes.linkWrapper}>
                            <Link className={classes.link} to={`/rating/${gameId}`}>Рейтинг</Link>
                        </div>
                        : null
                }
                <div className={classes.linkWrapper}>
                    <Link className={classes.link} to={props.isLoggedIn ? '#' : '/auth'} onClick={handleLogout}>Выйти</Link>
                </div>
            </div>
        </div>
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


export default connect(mapStateToProps, mapDispatchToProps)(MobileMenu);