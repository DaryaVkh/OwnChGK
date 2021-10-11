import React, {Component} from 'react';
import classes from './Authorization.module.css';
import Header from '../UI/Header/Header';
import {Input} from '../UI/Input/Input';

class Authorization extends Component<{ isAdmin: boolean }> {
    render() {
        return (
            <div className={classes.Authorization}>
                <Header />

                <div className={classes.contentWrapper}>
                    <img className={classes.logo} src={require('../../images/Logo.svg').default} alt='logo' />

                    <Input type='email' id='email' name='email' placeholder='E-mail' />
                    <Input type='password' id='password' name='password' placeholder='Пароль' />

                    <div className={classes.buttonWrapper}>
                        <button className={classes.Button}>Войти</button>
                    </div>

                    <div className={classes.restoreLinkWrapper}>
                        <a className={classes.restorePasswordLink} href='#' id='restore'>Восстановить пароль</a>
                    </div>

                    {
                        this.props.isAdmin
                            ? null
                            :
                            (
                                <div className={classes.registerLinkWrapper}>
                                    <p className={classes.registerParagraph}>Ещё нет аккаунта?</p>
                                    <a className={classes.registerLink} href='#' id='register'> Зарегистрироваться</a>
                                </div>
                            )
                    }
                </div>
            </div>
        );
    }
}

export default Authorization;