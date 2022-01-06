import React, {FC, useState} from 'react';
import classes from './registration.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {Link, Redirect} from 'react-router-dom';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Alert} from '@mui/material';

const Registration: FC = () => {
    const [isRepeatedPasswordInvalid, setIsRepeatedPasswordInvalid] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const checkRepeatedPassword = () => {
        const pswd = document.querySelector('#password') as HTMLInputElement;
        const repeatedPassword = document.querySelector('#repeatPassword') as HTMLInputElement;
        if (pswd.value !== repeatedPassword.value) {
            setIsRepeatedPasswordInvalid(true);
        } else {
            setPassword(pswd.value);
            setIsRepeatedPasswordInvalid(false);
        }
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const validateForm = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (isRepeatedPasswordInvalid) {
            return false;
        }

        checkRepeatedPassword();

        await fetch('/users/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        }).then(response => {
            if (response.status === 200) {
                setLoggedIn(true);
            }
        });
    };

    return loggedIn ? (
        <Redirect to="/start-screen"/>
    ) : (<PageWrapper>
        <Header isAuthorized={false} isAdmin={false}/>

        <div className={classes.contentWrapper}>
            <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

            <form onSubmit={validateForm}>
                {isRepeatedPasswordInvalid ? <Alert severity="error" sx={{
                    color: 'white',
                    backgroundColor: '#F44336',
                    marginBottom: '2vh',
                    marginTop: '-5vh',
                    '& .MuiAlert-icon': {
                        color: 'white'
                    }
                }}>Пароли не совпадают</Alert> : null}
                <CustomInput type="email" id="email" name="email" placeholder="E-mail" onChange={handleEmailChange}/>
                <CustomInput type="password" id="password" name="password" placeholder="Пароль"
                             isInvalid={isRepeatedPasswordInvalid}/>
                <CustomInput type="password" id="repeatPassword" name="repeatPassword" placeholder="Повторите пароль"
                             onBlur={checkRepeatedPassword}
                             isInvalid={isRepeatedPasswordInvalid}/>

                <FormButton type="signUpButton" text="Зарегистрироваться"/>
            </form>

            <div className={classes.toAuthorizationWrapper}>
                <p className={classes.toAuthorizationParagraph}>Уже есть аккаунт?</p>
                <Link className={classes.toAuthorizationLink} to="/auth" id="toAuthorization"> Войти</Link>
            </div>
        </div>
    </PageWrapper>);
};

export default Registration;