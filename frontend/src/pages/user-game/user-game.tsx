import React, {FC, useState} from 'react';
import classes from './user-game.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import Header from "../../components/header/header";
import {Link} from 'react-router-dom';
import {CustomInput} from "../../components/custom-input/custom-input";
import {Alert, Snackbar} from "@mui/material";
import {UserGameProps} from "../../entities/user-game/user-game.interfaces";

const UserGame: FC<UserGameProps> = props => {
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [timeForAnswer, setTimeForAnswer] = useState(60);

    const changeColor = (progressBar: HTMLDivElement) => {
        if (progressBar.style.width) {
            let width = +(progressBar.style.width).slice(0, -1);
            switch (true) {
                case (width <= 10):
                    progressBar.style.backgroundColor = 'red';
                    break;

                case (width > 11 && width <= 25):
                    progressBar.style.backgroundColor = 'orange';
                    break;

                case (width > 26 && width <= 50):
                    progressBar.style.backgroundColor = 'yellow';
                    break;

                case (width > 51 && width <= 100):
                    progressBar.style.backgroundColor = 'green';
                    break;
            }
        }
    }

    const moveProgressBar = () => {
        const progressBar = document.querySelector('#progress-bar') as HTMLDivElement;

        const frame = () => {
            if (width <= 0) {
                clearInterval(id);
            } else {
                changeColor(progressBar);
                width--;
                setTimeForAnswer(t => t - 0.6);
                progressBar.style.width = width + '%';
            }
        }

        let width = 100;
        const id = setInterval(frame, 60000 / 100); // TODO тут время, если оно не всегда 60 секунд, надо будет подставлять переменную
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsSnackbarOpen(false);
    };

    const handleSendButtonClick = (event: React.SyntheticEvent) => {
        setIsSnackbarOpen(true);
        // TODO тут сохраняем где нить ответ (или куда-то его там отправляем)
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <Link to='game' className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                <Link to='game' className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>

                <div className={classes.gameName}>{props.gameName}</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.teamWrapper}>
                    <div className={classes.team}>Команда</div>
                    <div className={classes.teamName}>{props.teamName}</div>
                </div>

                <div className={classes.answerWrapper}>
                    <div className={classes.timeLeft}>Осталось: {Math.ceil(timeForAnswer)} сек.</div>

                    <div className={classes.progressBar} id='progress-bar' />
                    <div className={classes.answerBox}>
                        <p className={classes.answerNumber}>Вопрос 1</p> {/* TODO как менять динамически номер вопроса?*/}

                        <div className={classes.answerInputWrapper}>
                            <CustomInput type='text' id='answer' name='answer' placeholder='Ответ' style={{width: '79%'}} />
                            <button className={classes.sendAnswerButton} onClick={handleSendButtonClick}>Отправить</button>
                        </div>
                    </div>
                </div>

                <Snackbar open={isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                        Ответ успешно сохранен
                    </Alert>
                </Snackbar>
            </div>
        </PageWrapper>
    );
}

export default UserGame;