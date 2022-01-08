import React, {FC, useState} from 'react';
import classes from './restoring-password.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Link, Redirect} from 'react-router-dom';
import {RestoringPasswordProps} from '../../entities/restoring-password/restoring-password.interfaces';
import {Alert} from '@mui/material';
import {FormButton} from '../../components/form-button/form-button';
import {changePasswordByCode, checkTemporaryPassword, sendTemporaryPassword} from '../../server-api/server-api';

const RestoringPassword: FC<RestoringPasswordProps> = props => {
    const [isEmailInvalid, setIsEmailInvalid] = useState<boolean>(false);
    const [isCodeInvalid, setIsCodeInvalid] = useState<boolean>(false);
    const [isRepeatedPasswordInvalid, setIsRepeatedPasswordInvalid] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [repeatedPassword, setRepeatedPassword] = useState<string>('');
    const [step, setStep] = useState<'first' | 'second' | 'third'>('first');
    const [isSuccess, setIsSuccess] = useState<boolean>(false);

    //TODO проверять в базе наличие email, написать обработчик отправки

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }

    const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCode(event.target.value);
    }

    const handleSendCode = () => {
        // TODO тут отправляем код на почту email и меняем шаг на 'second' (setStep('second')) или говорим, что такого имейла в базе нет и ставим isEmailInvalid в false
        sendTemporaryPassword(email, props.isAdmin).then(res => {
            if (res.status === 200) {
                setStep('second');
            } else {
                setIsEmailInvalid(false);
            }
        })
    }

    const handleResendCode = () => {
        // TODO тут отправляем новый код на почту email, ибо прошлый юзер продолбал
        sendTemporaryPassword(email, props.isAdmin).then(res => {
            if (res.status === 200) {
                setStep('second');
            } else {
                setIsEmailInvalid(false);
            }
        })
    }

    const handleCheckCode = () => {
        // TODO тут проверяем, что код верный и меняем шаг на 'third' (setStep('third')) или говорим, что код не верный и ставим isCodeInvalid в false
        checkTemporaryPassword(email, code, props.isAdmin).then(res => {
            if (res.status === 200) {
                setStep('third');
            } else {
                setIsCodeInvalid(true);
            }
        })
    }

    const handleChangeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    }

    const handleChangeRepeatedPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatedPassword(event.target.value);
    }

    const handleSubmitNewPassword = (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (newPassword !== repeatedPassword) {
            setIsRepeatedPasswordInvalid(true);
            return false;
        } else {
            setIsRepeatedPasswordInvalid(false);
            // TODO тут записываем новый пароль newPassword в базу
            console.log(props.isAdmin);
            changePasswordByCode(email, newPassword, code, props.isAdmin).then(res => {
                if (res.status === 200) {
                    setIsSuccess(true);
                } else {
                    setIsSuccess(false);
                }
            })
        }
    }

    const renderStep = () => {
        switch (step) {
            case 'first':
                return (
                    <div className={classes.stepWrapper}>
                        <p className={classes.instructionsParagraph} style={{marginTop: '17vh', marginBottom: '2vh'}}>
                            Для восстановления пароля введите E-mail, указанный при регистрации
                        </p>
                        <p className={classes.instructionsParagraph} style={{marginBottom: '8vh'}}>
                            На него будет отправлен код подтверждения
                        </p>

                        <div className={classes.form}>
                            <CustomInput type="email" placeholder="E-mail" name="email" id="email" value={email}
                                         style={{width: '65%'}}
                                         onChange={handleEmailChange} isInvalid={isEmailInvalid}/>
                            <button className={classes.sendButton} type="submit" onClick={handleSendCode}>Отправить
                            </button>
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
                    </div>
                );
            case 'second':
                return (
                    <div className={classes.stepWrapper}>
                        <p className={classes.instructionsParagraph}
                           style={{margin: '17vh 0 8vh', textAlign: 'center'}}>
                            Код отправлен на <b>{email}</b>
                        </p>

                        <div className={classes.secondStepForm}>
                            <CustomInput type="text" placeholder="Введите код" name="code" id="code" value={code}
                                         style={{width: '35%', marginRight: '1vw'}}
                                         onChange={handleCodeChange} isInvalid={isCodeInvalid}/>
                            <button className={classes.sendButton} type="submit" onClick={handleCheckCode}>Отправить
                            </button>
                        </div>

                        <div className={classes.resendCodeWrapper}>
                            <div className={classes.ghostDiv}/>
                            <Link className={classes.resendCode} to="#" onClick={handleResendCode}>Переотправить
                                код</Link>
                        </div>
                    </div>
                );
            case 'third':
                return (
                    <div className={classes.stepWrapper}>
                        <p className={classes.instructionsParagraph}
                           style={{margin: '17vh auto 10vh', textAlign: 'center'}}>
                            Придумайте новый пароль
                        </p>

                        <form className={classes.newPasswordsForm} onSubmit={handleSubmitNewPassword}>
                            {
                                isRepeatedPasswordInvalid
                                    ?
                                    <Alert severity="error" sx={
                                        {
                                            color: 'white',
                                            backgroundColor: '#F44336',
                                            marginBottom: '2vh',
                                            marginTop: '-5vh',
                                            '& .MuiAlert-icon': {
                                                color: 'white'
                                            }
                                        }
                                    }>
                                        Пароли не совпадают
                                    </Alert>
                                    : null
                            }
                            <CustomInput type="password" id="password" name="password" placeholder="Новый пароль"
                                         value={newPassword} onChange={handleChangeNewPassword}
                                         isInvalid={isRepeatedPasswordInvalid}/>
                            <CustomInput type="password" id="repeatPassword" name="repeatPassword"
                                         placeholder="Повторите новый пароль"
                                         value={repeatedPassword} onChange={handleChangeRepeatedPassword}
                                         isInvalid={isRepeatedPasswordInvalid}/>
                            <FormButton text="Сохранить" style={{padding: '0 2vw'}}/>
                        </form>
                    </div>
                );
        }
    }

    return isSuccess
        ? <Redirect to={props.isAdmin ? '/admin' : '/auth'}/>
        : (
            <PageWrapper>
                <Header isAuthorized={false} isAdmin={props.isAdmin}>
                    <div className={classes.pageTitle}>Восстановление пароля</div>
                </Header>

                <div className={classes.contentWrapper}>

                    {renderStep()}

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
