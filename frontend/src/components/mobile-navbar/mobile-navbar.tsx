import React, {FC, useCallback} from 'react';
import classes from './mobile-navbar.module.scss';
import {Link} from 'react-router-dom';
import {MobileNavBarProps} from '../../entities/nav-bar/nav-bar.interfaces';

const MobileNavbar: FC<MobileNavBarProps> = props => {
    const handleClick = (e: React.SyntheticEvent) => {
        const el = e.target as HTMLElement;
        const items = document.querySelectorAll(`.${classes['nav-item']}`);

        items.forEach(function (item) {
            item.classList.remove(classes['is-active']);
            item.removeAttribute('style');
        });

        el.classList.add(classes['is-active']);
        handleLinkChange(e);
    };

    const handleLinkChange = useCallback(e => {
        props.onLinkChange?.((e.target as HTMLElement).id);
    }, [props]);

    return (
        <nav className={classes.MobileNavBar}>
            {
                !props.isGame
                    ?
                    <>
                        <div className={classes.linkWrapper}>
                            <Link to={{pathname: '/start-screen', state: {page: 'teams'}}} id="teams" className={`${classes['nav-item']} ${props.page === 'teams' ? classes['is-active'] : null}`} onClick={handleClick}>Команды</Link>
                        </div>

                        <div className={classes.linkWrapper}>
                            <Link to={{pathname: '/start-screen', state: {page: 'games'}}} id="games" className={`${classes['nav-item']} ${props.page === 'games' ? classes['is-active'] : null}`} onClick={handleClick}>Игры</Link>
                        </div>
                    </>
                    : props.toGame
                        ?
                        <div className={classes.gameLinkWrapper}>
                            <Link to={`/game/${props.gameId}`} className={`${classes['nav-item']}`} onClick={handleClick}>В игру</Link>
                        </div>
                        :
                        <div className={classes.gameLinkWrapper}>
                            <Link to={`/game-answers/${props.gameId}`} className={`${classes['nav-item']}`} onClick={handleClick}>Ответы</Link>
                        </div>
            }
        </nav>
    );
}

export default MobileNavbar;