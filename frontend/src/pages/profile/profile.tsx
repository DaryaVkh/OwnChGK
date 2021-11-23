import React, {FC, useState} from 'react';
import classes from './profile.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import {ProfileProps} from "../../entities/profile/profile.interfaces";
import Header from "../../components/header/header";
import {CustomInput} from "../../components/custom-input/custom-input";
import {Redirect} from 'react-router-dom';
import {Alert} from "@mui/material";

const Profile: FC<ProfileProps> = props => {
    let userName: string = '';
    let userTeam: string = '';
    let userEmail: string = '';
    let userPassword: string = '';
    const [isRepeatedPasswordInvalid, setIsRepeatedPasswordInvalid] = useState(false);
    const [isOldPasswordInvalid, setIsOldPasswordInvalid] = useState(false);
    const [isRedirected, setIsRedirected] = useState(false);

    //TODO либо каждый раз у сервака спрашивать данные юзера, либо при авторизации записать куда нибудь в переменную (например в app) и передавать оттуда пропсой

    const checkRepeatedPassword = () => {
        const pswd = document.querySelector('#new-password') as HTMLInputElement;
        const repeatedPassword = document.querySelector('#repeat-new-password') as HTMLInputElement;
        if (pswd.value !== repeatedPassword.value) {
            setIsRepeatedPasswordInvalid(true);
        } else {
            userPassword = pswd.value;
            setIsRepeatedPasswordInvalid(false);
        }
    }

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        checkRepeatedPassword();

        //TODO проверять по бд старый пароль
        if (isOldPasswordInvalid) {
            return false;
        }

        if (isRepeatedPasswordInvalid) {
            return false;
        }

        //TODO передаем изменения в бд
        setIsRedirected(true);
    }

    return isRedirected
        ? <Redirect to={props.isAdmin ? '/admin/start-screen' : '/start-screen'}/>
        :
        (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={props.isAdmin}>
                    <div className={classes.pageTitle}>Профиль</div>
                </Header>

                <form className={classes.box} onSubmit={handleSubmit}>
                    <div className={classes.contentWrapper}>
                        <div className={classes.infoWrapper}>
                            <CustomInput type='text' id='name' name='name' placeholder='Имя' defaultValue={userName} required={false} style={{marginTop: 'calc(2vw + 2vh)'}} />

                            {
                                !props.isAdmin
                                ?
                                    <div className={classes.infoCategoryWrapper}>
                                        <p className={classes.category}>Команда</p>
                                        <p className={classes.userData}>{userTeam}</p>
                                    </div>
                                : null
                            }

                            <div className={classes.infoCategoryWrapper} style={{marginTop: '3vh'}}>
                                <p className={classes.category}>Почта</p>
                                <p className={classes.userData}>{userEmail}</p>
                            </div>
                        </div>

                        <div className={classes.changePasswordWrapper}>
                            <p className={classes.changePasswordParagraph}>Изменение пароля</p>

                            <CustomInput type='password' id='old-password' name='old-password' placeholder='Введите старый пароль' style={{marginBottom: '3.5vh'}} isInvalid={isOldPasswordInvalid} />
                            <CustomInput type='password' id='new-password' name='new-password' placeholder='Введите новый пароль' isInvalid={isRepeatedPasswordInvalid} />
                            <CustomInput type='password' id='repeat-new-password' name='repeat-new-password' placeholder='Повторите новый пароль' isInvalid={isRepeatedPasswordInvalid} onBlur={checkRepeatedPassword} />

                            {isOldPasswordInvalid ? <Alert severity='error' sx={{
                                color: 'white',
                                backgroundColor: '#F44336',
                                marginTop: '1vh',
                                '& .MuiAlert-icon': {
                                    color: 'white'
                                }
                            }}>Неверный старый пароль</Alert> : null}

                            {isRepeatedPasswordInvalid ? <Alert severity='error' sx={{
                                color: 'white',
                                backgroundColor: '#F44336',
                                marginTop: '1vh',
                                '& .MuiAlert-icon': {
                                    color: 'white'
                                }
                            }}>Пароли не совпадают</Alert> : null}
                        </div>
                    </div>

                    <div className={classes.buttonWrapper}>
                        <button className={classes.saveButton} type='submit'>Сохранить</button>
                    </div>
                </form>
            </PageWrapper>
        );
}

export default Profile;