import React, {Component} from 'react';
import classes from './Registration.module.scss';
import {Input} from '../../UI/Input/Input';
import {Button} from '../../UI/FirstPageButton/FirstPageButton';

class Registration extends Component {
    render() {
        return (
            <React.Fragment>
                <form action='' method=''>
                    <Input type='email' id='email' name='email' placeholder='E-mail'/>
                    <Input type='password' id='password' name='password' placeholder='Пароль'/>
                    <Input type='password' id='repeatPassword' name='repeatPassword' placeholder='Повторите пароль'/>

                    <Button type='signUpButton' text='Зарегистрироваться'/>
                </form>

                <div className={classes.signInLinkWrapper}>
                    <p className={classes.signInParagraph}>Уже есть аккаунт?</p>
                    <a className={classes.signInLink} href='#' id='register'> Войти</a>
                </div>
            </React.Fragment>
        );
    }
}

export default Registration;