import React, {FC, useState} from 'react';
import classes from './restoring-password.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Link} from 'react-router-dom';
import {RestoringPasswordProps} from '../../entities/restoring-password/restoring-password.interfaces';
import {Alert} from '@mui/material';

const RestoringPassword: FC<RestoringPasswordProps> = props => {
    const [isEmailInvalid, setIsEmailInvalid] = useState(false);

    //TODO проверять в базе наличие email, написать обработчик отправки

    return (
        <PageWrapper>
            <Header isAuthorized={false} isAdmin={false}>
                <div className={classes.pageTitle}>Восстановление пароля</div>
            </Header>

            <div className={classes.contentWrapper}>
                <p className={classes.instructionsParagraph} style={{marginTop: '17vh', marginBottom: '2vh'}}>
                    Для восстановления пароля введите E-mail, указанный при регистрации
                </p>
                <p className={classes.instructionsParagraph} style={{marginBottom: '8vh'}}>
                    На него будет отправлен новый пароль
                </p>

                <div className={classes.form}>
                    <CustomInput type="email" placeholder="E-mail" name="email" id="email" style={{width: '65%'}}
                                 isInvalid={isEmailInvalid}/>
                    <Link className={classes.linkForButton} to={props.isAdmin ? '/admin' : '/auth'}>
                        <button className={classes.sendButton} type="submit">Отправить</button>
                    </Link>
                </div>

                <div className={classes.linkToSignInWrapper}
                     style={{justifyContent: isEmailInvalid ? 'space-between' : 'flex-end'}}>
                    {isEmailInvalid
                        ?
                        <div className={classes.alertWrapper}>
                            <Alert severity="error" sx={{
                                color: 'white',
                                fontSize: '1vw',
                                backgroundColor: '#F44336',
                                '& .MuiAlert-icon': {
                                    color: 'white'
                                },
                                '& .MuiAlert-message': {
                                    display: 'flex',
                                    justifyContent: 'center'
                                }
                            }}>Этот E-mail не зарегистрирован</Alert>
                        </div>
                        : null}
                    <Link className={classes.linkToSignIn} to={props.isAdmin ? '/admin' : '/auth'}>Вспомнил
                        пароль</Link>
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
};

export default RestoringPassword;
