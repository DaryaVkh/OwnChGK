import React, {FC, useState} from 'react';
import classes from './registration.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {Link, Redirect} from 'react-router-dom';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {CustomInput} from '../../components/custom-input/custom-input';
import {RegistrationDispatchProps, RegistrationProps} from '../../entities/registration/registration.interfaces';
import {Dispatch} from 'redux';
import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';
import {authorizeUserWithRole} from '../../redux/actions/app-actions/app-actions';
import {connect} from 'react-redux';
import PageBackdrop from '../../components/backdrop/backdrop';
import {createUser} from '../../server-api/server-api';

const Registration: FC<RegistrationProps> = props => {
    const [isRepeatedPasswordInvalid, setIsRepeatedPasswordInvalid] = useState<boolean>(false);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [repeatedPassword, setRepeatedPassword] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(false);
    const [isRegisteredAlready, setIsRegisteredAlready] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const checkRepeatedPassword = () => {
        if (password !== repeatedPassword) {
            setIsRepeatedPasswordInvalid(true);
            return false;
        } else {
            setIsRepeatedPasswordInvalid(false);
            return true;
        }
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleRepeatedPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatedPassword(event.target.value);
    }

    const validateForm = async (event: React.SyntheticEvent) => {
        event.preventDefault();

        setIsError(false);
        if (!checkRepeatedPassword()) {
            return false;
        } else {
            setIsLoading(true);
            createUser(email, password).then(response => {
                if (response.status === 200) {
                    props.onAuthorizeUserWithRole('user', '', email, '');
                    setLoggedIn(true);
                } else if (response.status === 409) {
                    setIsRegisteredAlready(true);
                    setIsLoading(false);
                } else {
                    setIsError(true);
                    setIsLoading(false);
                }
            });
        }
    };

    if (loggedIn) {
        return <Redirect to='/start-screen' />
    }

    return (
        <PageWrapper>
            <Header isAuthorized={false} isAdmin={false}/>

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                <form onSubmit={validateForm}>
                    <CustomInput type="email" id="email" name="email" placeholder="Почта"
                                 style={{marginBottom: '9%'}}
                                 value={email} onChange={handleEmailChange}
                                 isInvalid={isError || isRegisteredAlready}
                                 errorHelperText={isRegisteredAlready ? 'Эта почта уже зарегистрирована' : ''}
                                 onFocus={() => {
                                     setIsRegisteredAlready(false);
                                     setIsError(false);
                                 }}/>
                    <CustomInput type="password" id="password" name="password" placeholder="Пароль" value={password}
                                 isInvalid={isRepeatedPasswordInvalid || isError} onChange={handlePasswordChange}/>
                    <CustomInput type="password" id="repeatPassword" name="repeatPassword" placeholder="Повторите пароль" value={repeatedPassword}
                                 isInvalid={isRepeatedPasswordInvalid || isError} onChange={handleRepeatedPasswordChange}
                                 errorHelperText={isRepeatedPasswordInvalid ? 'Пароли не совпадают' : 'Ошибка регистрации, попробуйте снова'}
                    />

                    <FormButton type="signUpButton" text="Зарегистрироваться"/>
                </form>

                <div className={classes.toAuthorizationWrapper}>
                    <p className={classes.toAuthorizationParagraph}>Уже есть аккаунт?</p>
                    <Link className={classes.toAuthorizationLink} to="/auth" id="toAuthorization"> Войти</Link>
                </div>
                <PageBackdrop isOpen={isLoading} />
            </div>
        </PageWrapper>);
};

function mapDispatchToProps(dispatch: Dispatch<AppAction>): RegistrationDispatchProps {
    return {
        onAuthorizeUserWithRole: (role: string, team: string, email: string, name: string) => dispatch(authorizeUserWithRole(role, team, email, name))
    };
}

export default connect(null, mapDispatchToProps)(Registration);