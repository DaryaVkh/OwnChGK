import React, {FC, useState} from 'react';
import classes from './registration.module.scss';
import Header from '../../components/header/header';
import {FormInput} from "../../components/form-input/form-input";
import {FormButton} from "../../components/form-button/form-button";
import {Link} from "react-router-dom";
import PageWrapper from "../../components/page-wrapper/page-wrapper";

const Registration: FC = () => {
    const [isRepeatedPasswordInvalid, setIsRepeatedPasswordInvalid] = useState(false);

    const checkRepeatedPassword = () => {
        const password = document.querySelector('#password') as HTMLInputElement;
        const repeatedPassword = document.querySelector('#repeatPassword') as HTMLInputElement;
        if (password.value !== repeatedPassword.value) {
            setIsRepeatedPasswordInvalid(true);
        } else {
            setIsRepeatedPasswordInvalid(false);
        }
    }

    const validateForm = (e: React.SyntheticEvent) => {
        if (isRepeatedPasswordInvalid) {
            e.preventDefault();
            return false;
        }
    }

    return (
        <PageWrapper>
            <Header isAdmin={false}/>

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt='logo'/>

                <form action="users/insert" method='post' onSubmit={validateForm}>
                    <FormInput type='email' id='email' name='email' placeholder='E-mail' />
                    <FormInput type='password' id='password' name='password' placeholder='Пароль'
                               isInvalid={isRepeatedPasswordInvalid}/>
                    <FormInput type='password' id='repeatPassword' name='repeatPassword' placeholder='Повторите пароль'
                               onBlur={checkRepeatedPassword}
                               isInvalid={isRepeatedPasswordInvalid}/>

                    <FormButton type="signUpButton" text="Зарегистрироваться" />
                </form>

                <div className={classes.toAuthorizationWrapper}>
                    <p className={classes.toAuthorizationParagraph}>Уже есть аккаунт?</p>
                    <Link className={classes.toAuthorizationLink} to='/authorization' id='toAuthorization'> Войти</Link>
                </div>
            </div>
        </PageWrapper>
    );
}

export default Registration;