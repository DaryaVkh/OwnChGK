import React, {FC, useState} from 'react';
import classes from './authorization.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {Link, Redirect} from 'react-router-dom';
import {
    AuthorizationDispatchProps,
    AuthorizationProps,
    AuthorizationStateProps
} from '../../entities/authorization/authorization.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Alert} from "@mui/material";
import {connect} from "react-redux";
import {AppAction} from "../../redux/reducers/app-reducer/app-reducer.interfaces";
import {Dispatch} from "redux";
import {authorizeUserWithRole} from "../../redux/actions/app-actions/app-actions";
import {AppState} from "../../entities/app/app.interfaces";

const Authorization: FC<AuthorizationProps> = props => {
    const [wrongEmailOrPassword, setWrongEmailOrPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
                response.json().then(({role}) => {
                    props.onAuthorizeUserWithRole(role);
                });
                // setTimeout(() => setLoggedIn(true), 1000);
                // setLoggedIn(true);
            } else {
                setWrongEmailOrPassword(true);
            }
        });
    }

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }

    const handleErrorFixes = () => {
        if (wrongEmailOrPassword) {
            setWrongEmailOrPassword(false);
        }
    }

    return props.isLoggedIn ? (
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
                    <CustomInput type="email" id="email" name="email" placeholder="E-mail" value={email}
                                 onChange={handleEmailChange} isInvalid={wrongEmailOrPassword} onFocus={handleErrorFixes}/>
                    <CustomInput type="password" id="password" name="password" placeholder="Пароль" value={password}
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

function mapStateToProps(state: AppState): AuthorizationStateProps {
    return {
        isLoggedIn: state.appReducer.isLoggedIn
    }
}

function mapDispatchToProps(dispatch: Dispatch<AppAction>): AuthorizationDispatchProps {
    return {
        onAuthorizeUserWithRole: (role: string) => dispatch(authorizeUserWithRole(role))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Authorization);