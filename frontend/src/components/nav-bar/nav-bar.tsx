import React, {FC, useEffect} from 'react';
import classes from './nav-bar.module.scss';
import {Link} from 'react-router-dom';

function handleIndicator(e: React.SyntheticEvent) {
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

function handleWindowResize() {
    const indicator = document.querySelector('#indicator') as HTMLSpanElement;
    const el = document.querySelector(`.${classes['is-active']}`) as HTMLElement;
    if (el) {
        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.left = `${el.offsetLeft}px`;
        indicator.style.backgroundColor = "white";
    }
}

const NavBar: FC = () => {
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }
    }, []);

    return (
        <nav className={classes.nav}>
            <Link to='/start-screen' className={`${classes['nav-item']}`} onClick={handleIndicator}>Игры</Link>
            <Link to='/start-screen' className={`${classes['nav-item']}`} onClick={handleIndicator}>Команды</Link>
            <Link to='/start-screen' className={`${classes['nav-item']}`} onClick={handleIndicator}>Админы</Link>
            <span className={`${classes['nav-indicator']}`} id='indicator'/>
        </nav>
    );
}

export default NavBar;
