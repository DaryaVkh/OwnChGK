import React, {FC} from 'react';
import classes from './authorization.module.scss';
import Header from '../../components/header/header';
import {FormInput} from "../../components/form-input/form-input";
import {FormButton} from "../../components/form-button/form-button";
import {Link} from 'react-router-dom';
import {AuthorizationProps} from "../../entities/authorization/authorization.interfaces";
import PageWrapper from "../../components/page-wrapper/page-wrapper";

const Authorization: FC<AuthorizationProps> = props => {
    return (
        <PageWrapper>
            <Header />

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt='logo'/>

                <form action={props.isAdmin ? "admins/login" : "users/login"} method='post'>
                    <FormInput type='email' id='email' name='email' placeholder='E-mail' />
                    <FormInput type='password' id='password' name='password' placeholder='Пароль' />

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