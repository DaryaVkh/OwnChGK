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
import {connect} from 'react-redux';
import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';
import {Dispatch} from 'redux';
import {authorizeUserWithRole, checkToken as testToken} from '../../redux/actions/app-actions/app-actions';
import {AppState} from '../../entities/app/app.interfaces';
import PageBackdrop from '../../components/backdrop/backdrop';
import {login, uploadFile} from '../../server-api/server-api';
import {Image} from "@mui/icons-material";

const Authorization: FC<AuthorizationProps> = props => {
    const [wrongEmailOrPassword, setWrongEmailOrPassword] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [file, setFile] = useState<any>();
    const [imageURL, setImageURL] = useState<any>();

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        setIsLoading(true);
        login(email, password, !!props.isAdmin).then(response => {
            if (response.status === 200) {
                response.json().then(({role, team, email, name}) => {
                    props.onAuthorizeUserWithRole(role, team, email, name);
                });
            } else {
                setIsLoading(false);
                setWrongEmailOrPassword(true);
            }
        });
    };

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    };

    const handleErrorFixes = () => {
        if (wrongEmailOrPassword) {
            setPassword('');
            setWrongEmailOrPassword(false);
        }
    };

    const fileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFile(event.target.files?.[0]);
    }

    const clickFileHandler = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        const formData = new FormData()

        formData.append("file", file);
        await uploadFile(formData)
            .then(res => {
                res.json().then(data => {
                    console.log(data);
                    console.log(new Uint8Array(data.data))
                    // @ts-ignore
                    console.log(String.fromCharCode(...new Uint8Array(data.data)))
                    // @ts-ignore
                    const base64String = btoa(String.fromCharCode(...new Uint8Array(data.data)));
                    console.log(`data:image/png;base64,${base64String}`);
                    setImageURL(`data:image/png;base64,${base64String}`);
                })
            });
    }
    
    if (imageURL) {
        return (
            <img src={imageURL} alt={"фото в цвете"}/>
        );
    }

    return props.isLoggedIn ? (
        <Redirect to={props.user.role === 'admin' || props.user.role === 'superadmin' ? '/admin/start-screen' : '/start-screen'}/>
    ) : (
        <PageWrapper>
            <form onSubmit={clickFileHandler}>
                <input type="file" accept="image/jpeg,image/png" onChange={fileHandler}/>
                <input type="submit"/>
            </form>
            <Header isAuthorized={false}/>

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                <form onSubmit={handleSubmit}>
                    <CustomInput type="email" id="email" name="email" placeholder="Почта" value={email}
                                 onChange={handleEmailChange} isInvalid={wrongEmailOrPassword}
                                 onFocus={handleErrorFixes}/>
                    <CustomInput type="password" id="password" name="password" placeholder="Пароль" value={password}
                                 onChange={handlePasswordChange} isInvalid={wrongEmailOrPassword}
                                 onFocus={handleErrorFixes} errorHelperText='Неверный логин или пароль'/>

                    <FormButton type="signInButton" text="Войти"/>
                </form>

                <div className={classes.restoreLinkWrapper}>
                    <Link className={classes.restorePasswordLink}
                          to={props.isAdmin ? '/admin/restore-password' : '/restore-password'}
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
            <PageBackdrop isOpen={isLoading} />
        </PageWrapper>
    );
};

function mapStateToProps(state: AppState): AuthorizationStateProps {
    return {
        isLoggedIn: state.appReducer.isLoggedIn,
        user: state.appReducer.user,
        isTokenChecked: state.appReducer.isTokenChecked
    };
}

function mapDispatchToProps(dispatch: Dispatch<AppAction>): AuthorizationDispatchProps {
    return {
        onCheckToken: () => dispatch(testToken()),
        onAuthorizeUserWithRole: (role: string, team: string, email: string, name: string) => dispatch(authorizeUserWithRole(role, team, email, name))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Authorization);