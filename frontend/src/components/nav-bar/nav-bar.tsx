import React, {FC, Fragment, useEffect} from 'react';
import classes from './nav-bar.module.scss';
import {Link} from 'react-router-dom';
import {NavBarProps} from "../../entities/nav-bar/nav-bar.interfaces";

function activateIndicator(): void {
    const indicator = document.querySelector('#indicator') as HTMLSpanElement;
    const activeItem = document.querySelector(`.${classes['is-active']}`) as HTMLElement;

    indicator.style.width = `${activeItem.offsetWidth}px`;
    indicator.style.left = `${activeItem.offsetLeft}px`;
    indicator.style.backgroundColor = "white";
}

function handleIndicator(e: React.SyntheticEvent): void {
    const indicator = document.querySelector('#indicator') as HTMLSpanElement;
    const items = document.querySelectorAll(`.${classes['nav-item']}`);
    const el = e.target as HTMLElement;

    items.forEach(function (item) {
        item.classList.remove(classes['is-active']);
        item.removeAttribute('style');
    });

    indicator.style.width = `${el.offsetWidth}px`;
    indicator.style.left = `${el.offsetLeft}px`;
    indicator.style.backgroundColor = "white";

    el.classList.add(classes['is-active']);
}

function handleWindowResize(): void {
    const indicator = document.querySelector('#indicator') as HTMLSpanElement;
    const el = document.querySelector(`.${classes['is-active']}`) as HTMLElement;
    if (el) {
        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.left = `${el.offsetLeft}px`;
        indicator.style.backgroundColor = "white";
    }
}

const NavBar: FC<NavBarProps> = props => {
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }
    }, []);

    useEffect(() => {
        if (!props.isAdmin) {
            activateIndicator();
        }
    }, [props.isAdmin]);

    return (
        <nav className={classes.nav}>
            {
                props.isAdmin
                    ?
                    <Fragment>
                        <Link to='/admin/start-screen' className={`${classes['nav-item']} ${classes['nav-item-admin']}`} onClick={handleIndicator}>Игры</Link>
                        <Link to='/admin/start-screen' className={`${classes['nav-item']} ${classes['nav-item-admin']}`} onClick={handleIndicator}>Команды</Link>
                        <Link to='/admin/start-screen' className={`${classes['nav-item']} ${classes['nav-item-admin']}`} onClick={handleIndicator}>Админы</Link>
                    </Fragment>
                    :
                    <Fragment>
                        <Link to='/start-screen' className={`${classes['nav-item']} ${classes['nav-item-user']} ${classes['is-active']}`} onClick={handleIndicator}>Игры</Link>
                        <Link to='/start-screen' className={`${classes['nav-item']} ${classes['nav-item-user']}`} onClick={handleIndicator}>Команды</Link>
                    </Fragment>
            }
            <span className={`${classes['nav-indicator']}`} id='indicator'/>
        </nav>
    );
}

export default NavBar;
