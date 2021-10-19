import React, {Component} from 'react';
import classes from './authorization.module.scss';
import {FormInput} from '../form-input/form-input';
import {FormButton} from '../form-button/form-button'

class Authorization extends Component<{ isAdmin: boolean }> {
    render() {
        return (
            <React.Fragment>
                <form action='' method=''>
                    <FormInput type='email' id='email' name='email' placeholder='E-mail' />
                    <FormInput type='password' id='password' name='password' placeholder='Пароль' />

                    <FormButton type='signInButton' text='Войти' />
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