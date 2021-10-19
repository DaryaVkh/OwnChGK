import React, {Component} from 'react';
import classes from './Registration.module.scss';
import {Input} from '../../UI/Input/Input';
import {Button} from '../../UI/FirstPageButton/FirstPageButton';

class Registration extends Component {
    validateForm(e: React.SyntheticEvent) {
        e.preventDefault();
        const password1 = document.getElementById('password');
        const password2 = document.getElementById('repeatPassword');
        console.log(password1);
        // @ts-ignore
        if (password1.value !== password2.value) {
            // @ts-ignore
            password2.style.borderColor = 'darkred';
            return false;
        } else {
            // @ts-ignore
            password2.style.borderColor = '#3282B8';
        }
    }

    render() {
        return (
            <React.Fragment>
                <form
                    onSubmit={this.validateForm}
                    action='users/insert' method='post'>
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