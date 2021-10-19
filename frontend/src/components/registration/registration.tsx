import React, {Component} from 'react';
import classes from './registration.module.scss';
import {FormInput} from '../form-input/form-input';
import {FormButton} from '../form-button/form-button';

class Registration extends Component {
    validateForm(e: React.SyntheticEvent) {
        const password1 = document.getElementById('password');
        const password2 = document.getElementById('repeatPassword');
        // @ts-ignore
        if (password1.value !== password2.value) {
            e.preventDefault();
            return false;
        }
    }

    checkRepeatedPassword() {
        const password1 = document.getElementById('password');
        const password2 = document.getElementById('repeatPassword');
        // @ts-ignore
        if (password1.value !== password2.value) {
            // @ts-ignore
            password2.style.borderColor = 'darkred';
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
                    action='' method=''>
                    <FormInput type='email' id='email' name='email' placeholder='E-mail'/>
                    <FormInput type='password' id='password' name='password' placeholder='Пароль'/>
                    <FormInput type='password' id='repeatPassword' name='repeatPassword' placeholder='Повторите пароль' onBlur={this.checkRepeatedPassword}/>

                    <FormButton type='signUpButton' text='Зарегистрироваться'/>
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