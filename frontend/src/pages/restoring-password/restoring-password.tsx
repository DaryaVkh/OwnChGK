import React, {FC, useState} from 'react';
import classes from './restoring-password.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Link, Redirect} from 'react-router-dom';
import {RestoringPasswordProps} from '../../entities/restoring-password/restoring-password.interfaces';
import {Alert, Snackbar} from '@mui/material';
import {changePasswordByCode, checkTemporaryPassword, sendTemporaryPassword} from '../../server-api/server-api';
import PageBackdrop from '../../components/backdrop/backdrop';

const RestoringPassword: FC<RestoringPasswordProps> = props => {
    const [isEmailInvalid, setIsEmailInvalid] = useState<boolean>(false);
    const [isCodeInvalid, setIsCodeInvalid] = useState<boolean>(false);
    const [isRepeatedPasswordInvalid, setIsRepeatedPasswordInvalid] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [code, setCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [repeatedPassword, setRepeatedPassword] = useState<string>('');
    const [step, setStep] = useState<'first' | 'second' | 'third'>('first');
    const [isResendCodeInvalid, setIsResendCodeInvalid] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const mediaMatch = window.matchMedia('(max-width: 768px)');

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    }

    const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCode(event.target.value);
    }

    const handleSendCode = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setIsLoading(true);
        sendTemporaryPassword(email, props.isAdmin).then(res => {
            if (res.status === 200) {
                setStep('second');
            } else if (res.status === 404 || res.status === 400) {
                setIsEmailInvalid(true);
            } else if (res.status === 500) {
                setIsResendCodeInvalid(true);
            }
            setIsLoading(false);
        })
    }

    const handleResendCode = () => {
        setIsLoading(true);
        sendTemporaryPassword(email, props.isAdmin).then(res => {
            if (res.status === 500) {
                setIsResendCodeInvalid(true);
            }
            setIsLoading(false);
        })
    }

    const handleCheckCode = () => {
        setIsLoading(true);
        checkTemporaryPassword(email, code, props.isAdmin).then(res => {
            if (res.status === 200) {
                setStep('third');
            } else {
                setIsCodeInvalid(true);
            }
            setIsLoading(false);
        });
    }

    const handleChangeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
    }

    const handleChangeRepeatedPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRepeatedPassword(event.target.value);
    }

    const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsResendCodeInvalid(false);
    };

    const handleSubmitNewPassword = (event: React.SyntheticEvent) => {
        event.preventDefault();
        setIsError(false);
        if (newPassword !== repeatedPassword) {
            setIsRepeatedPasswordInvalid(true);
            return false;
        } else {
            setIsRepeatedPasswordInvalid(false);
            setIsLoading(true);
            changePasswordByCode(email, newPassword, code, props.isAdmin).then(res => {
                if (res.status === 200) {
                    setIsSuccess(true);
                } else {
                    setIsLoading(false);
                    setIsSuccess(false);
                    setIsError(true);
                }
            })
        }
    }

    const renderStep = () => {
        switch (step) {
            case 'first':
                return (
                    <form className={classes.stepWrapper} onSubmit={handleSendCode}>
                        <p className={`${classes.instructionsParagraph} ${classes.firstStepUpper}`}>
                            Для восстановления пароля введите e-mail, указанный при регистрации
                        </p>
                        <p className={`${classes.instructionsParagraph} ${classes.firstStepLower}`}>
                            На него будет отправлен код подтверждения
                        </p>

                        <div className={classes.form}>
                            <CustomInput type="email" placeholder="Почта" name="email" id="email" value={email}
                                         style={{width: mediaMatch.matches ? '100%' : '65%'}}
                                         onChange={handleEmailChange} isInvalid={isEmailInvalid}
                                         errorHelperText='Эта почта ещё не зарегистрирована'
                            />
                            <button className={classes.sendButton} type="submit">Отправить
                            </button>
                        </div>

                        <div className={classes.linkToSignInWrapper}
                             style={{justifyContent: isEmailInvalid && !mediaMatch.matches
                                     ? 'space-between'
                                     : (!isEmailInvalid && !mediaMatch.matches ? 'flex-end' : 'center')}}>
                            <Link className={classes.linkToSignIn} to={props.isAdmin ? '/admin' : '/auth'} id="remember">Вспомнил
                                пароль</Link>
                        </div>
                    </form>
                );
            case 'second':
                return (
                    <div className={classes.stepWrapper}>
                        <p className={`${classes.instructionsParagraph} ${classes.secondStepUpper}`}>
                            Код отправлен на <b>{email}</b>
                        </p>
                        <p className={`${classes.instructionsParagraph} ${classes.secondStepLower}`}>
                            Если письмо не приходит, загляните в папку «Спам» и проверьте правильность введенного e-mail
                        </p>

                        <div className={classes.secondStepForm}>
                            <CustomInput type="text" placeholder="Введите код" name="code" id="code" value={code}
                                         style={{width: mediaMatch.matches ? '100%' : '35%', marginRight: '1vw'}}
                                         onChange={handleCodeChange} isInvalid={isCodeInvalid} errorHelperText='Код неверный'/>
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
                        <p className={`${classes.instructionsParagraph} ${classes.thirdStep}`}>
                            Придумайте новый пароль
                        </p>

                        <form className={classes.newPasswordsForm} onSubmit={handleSubmitNewPassword}>
                            <CustomInput type="password" id="password" name="password" placeholder="Пароль"
                                         value={newPassword} onChange={handleChangeNewPassword}
                                         isInvalid={isRepeatedPasswordInvalid || isError}/>
                            <CustomInput type="password" id="repeatPassword" name="repeatPassword"
                                         placeholder="Повторите пароль"
                                         value={repeatedPassword} onChange={handleChangeRepeatedPassword}
                                         isInvalid={isRepeatedPasswordInvalid || isError}
                                         errorHelperText={isRepeatedPasswordInvalid ? 'Пароли не совпадают' : 'Что-то пошло не так, попробуйте снова'}
                            />
                            <button className={`${classes.sendButton} ${classes.saveButton}`}>Сохранить</button>
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
                <Snackbar sx={{marginTop: '8vh'}} open={isResendCodeInvalid} anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000} onClose={handleSnackbarClose}>
                    <Alert severity='error' sx={{width: '100%'}}>
                        Не удалось отправить код. Повторите попытку
                    </Alert>
                </Snackbar>
                <PageBackdrop isOpen={isLoading} />
            </PageWrapper>
        );
};

export default RestoringPassword;
