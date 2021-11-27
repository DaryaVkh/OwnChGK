import React, {FC, useState} from 'react';
import classes from './authorization.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {Link, Redirect} from 'react-router-dom';
import {AuthorizationProps} from '../../entities/authorization/authorization.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Alert} from "@mui/material";

let email = '';
let password = '';

const Authorization: FC<AuthorizationProps> = props => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [wrongEmailOrPassword, setWrongEmailOrPassword] = useState(false);
    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        await fetch(props.isAdmin ? 'admins/login' : 'users/login', {
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
            } else {
                setWrongEmailOrPassword(true);
            }
        });
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        email = event.target.value;
    }

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        password = event.target.value;
    }

    const handleErrorFixes = () => {
        if (wrongEmailOrPassword) {
            setWrongEmailOrPassword(false);
        }
    }

    return loggedIn ? (
        <Redirect to={props.isAdmin ? '/admin/start-screen' : '/start-screen'}/>
    ) : (
        <PageWrapper>
            <Header isAuthorized={false}/>

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                <form onSubmit={handleSubmit}>
                    {wrongEmailOrPassword ? <Alert severity='error' sx={{
                        color: 'white',
                        backgroundColor: '#F44336',
                        marginBottom: '2vh',
                        marginTop: '-3vh',
                        '& .MuiAlert-icon': {
                            color: 'white'
                        }
                    }}>Неверный логин или пароль</Alert> : null}
                    <CustomInput type="email" id="email" name="email" placeholder="E-mail"
                                 onChange={handleEmailChange} isInvalid={wrongEmailOrPassword} onFocus={handleErrorFixes}/>
                    <CustomInput type="password" id="password" name="password" placeholder="Пароль"
                                 onChange={handlePasswordChange} isInvalid={wrongEmailOrPassword} onFocus={handleErrorFixes}/>

                    <FormButton type="signInButton" text="Войти"/>
                </form>

                <div className={classes.restoreLinkWrapper}>
                    <Link className={classes.restorePasswordLink}
                          to={props.isAdmin ? "/admin/restore-password" : '/restore-password'}
                          id="restore">Восстановить пароль</Link>
                </div>

                {
                    props.isAdmin
                        ? null
                        :
                        <div className={classes.toRegistrationWrapper}>
                            <p className={classes.toRegistrationParagraph}>Ещё нет аккаунта?</p>
                            <Link className={classes.toRegistrationLink} to="/registration"
                                  id="toRegistration"> Зарегистрироваться</Link>
                        </div>
                }
            </div>
        </PageWrapper>
    );
}

export default Authorization;