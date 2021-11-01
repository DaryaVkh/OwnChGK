import React, {FC} from 'react';
import classes from './authorization.module.scss';
import Header from '../../components/header/header';
import {FormButton} from "../../components/form-button/form-button";
import {Link} from 'react-router-dom';
import {AuthorizationProps} from "../../entities/authorization/authorization.interfaces";
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import {CustomInput} from "../../components/custom-input/custom-input";

const Authorization: FC<AuthorizationProps> = props => {
    return (
        <PageWrapper>
            <Header isAuthorized={false} />

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt='logo'/>

                <form action={props.isAdmin ? "admins/login" : "users/login"} method='post'>
                    <CustomInput type='email' id='email' name='email' placeholder='E-mail' />
                    <CustomInput type='password' id='password' name='password' placeholder='Пароль' />

                    <FormButton type="signInButton" text="Войти" />
                </form>

                <div className={classes.restoreLinkWrapper}>
                    <Link className={classes.restorePasswordLink} to='' id='restore'>Восстановить пароль</Link>
                </div>

                {
                    props.isAdmin
                        ? null
                        :
                        <div className={classes.toRegistrationWrapper}>
                            <p className={classes.toRegistrationParagraph}>Ещё нет аккаунта?</p>
                            <Link className={classes.toRegistrationLink} to='/registration'
                                  id='toRegistration'> Зарегистрироваться</Link>
                        </div>
                }
            </div>
        </PageWrapper>
    );
}

export default Authorization;