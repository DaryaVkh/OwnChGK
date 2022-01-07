import React, {FC, Fragment, useEffect, useCallback} from 'react';
import classes from './nav-bar.module.scss';
import {Link} from 'react-router-dom';
import {NavBarProps} from '../../entities/nav-bar/nav-bar.interfaces';

const NavBar: FC<NavBarProps> = props => {
    const handleIndicator = (e: React.SyntheticEvent) => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const items = document.querySelectorAll(`.${classes['nav-item']}`);
        const el = e.target as HTMLElement;

        items.forEach(function (item) {
            item.classList.remove(classes['is-active']);
            item.removeAttribute('style');
        });

        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.left = `${el.offsetLeft}px`;
        indicator.style.backgroundColor = 'white';

        el.classList.add(classes['is-active']);
        handleLinkChange(e);
    };

    const handleWindowResize = () => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const el = document.querySelector(`.${classes['is-active']}`) as HTMLElement;
        if (el) {
            indicator.style.width = `${el.offsetWidth}px`;
            indicator.style.left = `${el.offsetLeft}px`;
            indicator.style.backgroundColor = 'white';
        }
    };

    const activateIndicator = () => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const activeItem = document.querySelector(`.${classes['is-active']}`) as HTMLElement;

        indicator.style.width = `${activeItem.offsetWidth}px`;
        indicator.style.left = `${activeItem.offsetLeft}px`;
        indicator.style.backgroundColor = 'white';
    };

    const handleLinkChange = useCallback(e => {
        props.onLinkChange?.((e.target as HTMLElement).id);
    }, [props]);


    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    useEffect(() => {
        if (props.page !== '') {
            activateIndicator();
        }
    }, []);

    return (
        <nav className={`${classes.nav} ${props.isAdmin ? classes['nav-admin'] : classes['nav-user']}`}>
            {
                props.isAdmin
                    ?
                    <Fragment>
                        <Link to={{pathname: '/admin/start-screen', state: {page: 'games'}}} id="games" className={`${classes['nav-item']} ${classes['nav-item-admin']} ${props.page === 'games' ? classes['is-active'] : null}`} onClick={handleIndicator}>Игры</Link>
                        <Link to={{pathname: '/admin/start-screen', state: {page: 'teams'}}} id="teams" className={`${classes['nav-item']} ${classes['nav-item-admin']} ${props.page === 'teams' ? classes['is-active'] : null}`} onClick={handleIndicator}>Команды</Link>
                        <Link to={{pathname: '/admin/start-screen', state: {page: 'admins'}}} id="admins" className={`${classes['nav-item']} ${classes['nav-item-admin']}  ${props.page === 'admins' ? classes['is-active'] : null}`} onClick={handleIndicator}>Админы</Link>
                    </Fragment>
                    :
                    <Fragment>
                        <Link to={{pathname: '/start-screen', state: {page: 'teams'}}} id="teams" className={`${classes['nav-item']} ${classes['nav-item-user']} ${props.page === 'teams' ? classes['is-active'] : null}`} onClick={handleIndicator}>Команды</Link>
                        <Link to={{pathname: '/start-screen', state: {page: 'games'}}} id="games" className={`${classes['nav-item']} ${classes['nav-item-user']} ${props.page === 'games' ? classes['is-active'] : null}`} onClick={handleIndicator}>Игры</Link>
                    </Fragment>
            }
            <span className={`${classes['nav-indicator']}`} id="indicator"/>
        </nav>
    );
};

export default NavBar;
