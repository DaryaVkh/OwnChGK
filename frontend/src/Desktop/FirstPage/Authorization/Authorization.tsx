import React, {Component} from 'react';
import classes from './Authorization.module.scss';
import {Input} from '../../UI/Input/Input';
import {Button} from '../../UI/FirstPageButton/FirstPageButton'

class Authorization extends Component<{ isAdmin: boolean }> {
    render() {
        return (
            <React.Fragment>
                <form action='users/login' method='post'>
                    <Input type='email' id='email' name='email' placeholder='E-mail' />
                    <Input type='password' id='password' name='password' placeholder='Пароль' />

                    <Button type='signInButton' text='Войти' />
                </form>

                <div className={classes.restoreLinkWrapper}>
                    <a className={classes.restorePasswordLink} href='#' id='restore'>Восстановить пароль</a>
                </div>

                {
                    this.props.isAdmin
                        ? null
                        : (
                            <div className={classes.registerLinkWrapper}>
                                <p className={classes.registerParagraph}>Ещё нет аккаунта?</p>
                                <a className={classes.registerLink} href='#' id='register'> Зарегистрироваться</a>
                            </div>
                        )
                }
            </React.Fragment>
        );
    }
}

export default Authorization;