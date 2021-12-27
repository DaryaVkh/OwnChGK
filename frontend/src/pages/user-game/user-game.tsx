import React, {FC, useEffect, useState} from 'react';
import classes from './user-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {Link, useParams} from 'react-router-dom';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Alert, Snackbar} from '@mui/material';
import {UserGameProps} from '../../entities/user-game/user-game.interfaces';
import {getGame} from '../../server-api/server-api';
import {store} from '../../index';

let progressBar: any;

const UserGame: FC<UserGameProps> = props => {
    const {gameId} = useParams<{ gameId: string }>();
    const [answer, setAnswer] = useState('');
    const [gameName, setGameName] = useState('');
    const [questionNumber, setQuestionNumber] = useState(1);
    const [conn, setConn] = useState(new WebSocket('ws://localhost:80/'));
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [timeForAnswer, setTimeForAnswer] = useState(70);

    useEffect(() => {
        // TODO: Проверить, что игра началась (остальное продолжить только когда началась)
        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({
                                     name,
                                 }) => {
                    setGameName(name);
                })
            }
        })

        conn.onopen = function () {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'time'
            }));
        };

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);
            if (jsonMessage.action === 'time') {
                setTimeForAnswer(jsonMessage.time / 1000);
                if (jsonMessage.isStarted) {
                    progressBar = moveProgressBar(jsonMessage.time);
                }
                console.log(+jsonMessage.time);
            } else if (jsonMessage.action === 'start') {
                setTimeForAnswer(jsonMessage.time / 1000);
                progressBar = moveProgressBar(jsonMessage.time);
            } else if (jsonMessage.action === 'pause' || jsonMessage.action === 'stop') {
                clearInterval(progressBar);
            }
            else if (jsonMessage.action === 'changeQuestionNumber') {
                setQuestionNumber(+jsonMessage.number);
            }
        };
    }, []);

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

    const moveProgressBar = (time: number) => {
        const progressBar = document.querySelector('#progress-bar') as HTMLDivElement;

        const frame = () => {
            if (width <= 0) {
                clearInterval(id);
            } else {
                changeColor(progressBar);
                width--;
                setTimeForAnswer(t => t - 0.7);
                progressBar.style.width = width + '%';
            }
        }

        let width = Math.floor(100 * time / 70000);
        const id = setInterval(frame, 70000 / 100); // TODO тут время, если оно не всегда 60 секунд, надо будет подставлять переменную
        return id;
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsSnackbarOpen(false);
    };

    const getCookie = (name: string) => {
        let matches = document.cookie.match(new RegExp(
            '(?:^|; )' + name.replace(/([$?*|{}\[\]\\\/^])/g, '\\$1') + '=([^;]*)'
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    const handleAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnswer(event.target.value);
    }

    const handleSendButtonClick = () => {
        setIsSnackbarOpen(true);
        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'Answer',
            'answer': answer
        }));
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <Link to="/game" className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                <Link to="/game" className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>

                <div className={classes.gameName}>{gameName}</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.teamWrapper}>
                    <div className={classes.team}>Команда</div>
                    <div className={classes.teamName}>{store.getState().appReducer.user.team}</div>
                </div>

                <div className={classes.answerWrapper}>
                    <div className={classes.timeLeft}>Осталось: {Math.ceil(timeForAnswer)} сек.</div>

                    <div className={classes.progressBar} id="progress-bar"/>
                    <div className={classes.answerBox}>
                        <p className={classes.answerNumber}>Вопрос {questionNumber}</p>

                        <div className={classes.answerInputWrapper}>
                            <CustomInput type="text" id="answer" name="answer" placeholder="Ответ"
                                         style={{width: '79%'}} value={answer} onChange={handleAnswer}/>
                            <button className={classes.sendAnswerButton} onClick={handleSendButtonClick}>Отправить
                            </button>
                        </div>
                    </div>
                </div>

                <Snackbar open={isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="success" sx={{width: '100%'}}>
                        Ответ успешно сохранен
                    </Alert>
                </Snackbar>
            </div>
        </PageWrapper>
    );
}

export default UserGame;