import React, {FC, useState} from 'react';
import classes from './authorization.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {Link, Redirect} from 'react-router-dom';
import {AuthorizationProps} from '../../entities/authorization/authorization.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {CustomInput} from '../../components/custom-input/custom-input';

const Authorization: FC<AuthorizationProps> = props => {
    const [loggedIn, setLoggedIn] = useState(false);

    let userName;
    try {
        const conn = new WebSocket("ws://localhost:80/");
        conn.onopen =  () => {
            conn.send("hello from me client!")
        };

        conn.onmessage = (data) => {
            console.log(data);
        };
    }
    catch (e) {
        console.log(e);
    }


    let email = '';
    let password = '';
    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        const request = await fetch(props.isAdmin ? 'admins/login' : 'users/login', {
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
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        email = event.target.value;
    }

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        password = event.target.value;
    }

    return loggedIn ? (
        <Redirect to={props.isAdmin ? '/start-screen' : '/team-creation'}/>
    ) : (
        <PageWrapper>
            <Header isAuthorized={false}/>

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                <form onSubmit={handleSubmit}>
                    <CustomInput type="email" id="email" name="email" placeholder="E-mail"
                                 onChange={handleEmailChange}/>
                    <CustomInput type="password" id="password" name="password" placeholder="Пароль"
                                 onChange={handlePasswordChange}/>

                    <FormButton type="signInButton" text="Войти"/>
                </form>

                <div className={classes.restoreLinkWrapper}>
                    <Link className={classes.restorePasswordLink} to="" id="restore">Восстановить пароль</Link>
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