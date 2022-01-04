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
import {getCookie} from '../../commonFunctions';

let progressBar: any;

const UserGame: FC<UserGameProps> = props => {
    const {gameId} = useParams<{ gameId: string }>();
    const [answer, setAnswer] = useState('');
    const [gameName, setGameName] = useState('');
    const [questionNumber, setQuestionNumber] = useState(1);
    const [conn, setConn] = useState(new WebSocket('ws://localhost:80/'));
    const [timeForAnswer, setTimeForAnswer] = useState(70);
    const [flags, setFlags] = useState<{
        isSnackbarOpen: boolean,
        isAnswerAccepted: boolean
    }>({
        isSnackbarOpen: false,
        isAnswerAccepted: false
    })

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
                'action': 'getQuestionNumber'
            }));
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'time'
            }));
        };

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);
            if (jsonMessage.action === 'time') {
                console.log('a');
                console.log(jsonMessage.time);
                console.log('maxTime:', jsonMessage.maxTime);
                setTimeForAnswer(jsonMessage.time / 1000);
                if (jsonMessage.isStarted) {
                    console.log('a move');
                    progressBar = moveProgressBar(jsonMessage.time, jsonMessage.maxTime);
                }
            } else if (jsonMessage.action === 'start') {
                console.log('b');
                console.log(jsonMessage.time);
                setTimeForAnswer(jsonMessage.time / 1000);
                console.log('maxTime:', jsonMessage.maxTime);
                progressBar = moveProgressBar(jsonMessage.time, jsonMessage.maxTime);
            } else if (jsonMessage.action === 'addTime') {
                console.log('c');
                console.log(jsonMessage.time);
                console.log('maxTime:', jsonMessage.maxTime);
                clearInterval(progressBar);
                setTimeForAnswer(t => t + 10);
                if (jsonMessage.isStarted) {
                    console.log('c move');
                    progressBar = moveProgressBar(jsonMessage.time, jsonMessage.maxTime);
                }
            } else if (jsonMessage.action === 'pause') {
                console.log('d');
                clearInterval(progressBar);
            } else if (jsonMessage.action === 'stop') {
                console.log('p');
                clearInterval(progressBar);
                setTimeForAnswer(70000 / 1000);
                progressBar.style.width = '100%';
            } else if (jsonMessage.action === 'changeQuestionNumber') {
                console.log('e');
                console.log(jsonMessage.time);
                setQuestionNumber(+jsonMessage.number);
                clearInterval(progressBar);
                setTimeForAnswer(70000 / 1000);
                progressBar.style.width = '100%';
            } else if (jsonMessage.action === 'statusAnswer') {
                if (jsonMessage.isAccepted) {
                    setFlags({
                        isAnswerAccepted: true,
                        isSnackbarOpen: true
                    })
                } else {
                    setFlags({
                        isAnswerAccepted: false,
                        isSnackbarOpen: true
                    })
                }
                setTimeout(() => setFlags({
                    isSnackbarOpen: false,
                    isAnswerAccepted: false
                }), 5000);
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

    const moveProgressBar = (time: number, maxTime: number) => {
        const progressBar = document.querySelector('#progress-bar') as HTMLDivElement;

        const frame = () => {
            if (width <= 0) {
                clearInterval(id);
            } else {
                changeColor(progressBar);
                setTimeForAnswer(t => {
                    width = Math.ceil(100 * t / (maxTime / 1000));
                    progressBar.style.width = width + '%';
                    return t - 1
                });
            }
        }

        console.log('fromMove:', maxTime);
        let width = Math.ceil(100 * time / maxTime);
        const id = setInterval(frame, 1000); // TODO тут время, если оно не всегда 60 секунд, надо будет подставлять переменную
        return id;
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setFlags({
            isSnackbarOpen: false,
            isAnswerAccepted: false
        });
    };

    const handleAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnswer(event.target.value);
    }

    const handleSendButtonClick = () => {
        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'Answer',
            'answer': answer
        }));

        console.log('click');
        setTimeout(() => {
            setFlags(flags => {
                let result = {
                    isSnackbarOpen: true,
                    isAnswerAccepted: flags.isAnswerAccepted
                };
                console.log('из таймаута', result);
                return result;
            });

            setTimeout(() => setFlags({
                isSnackbarOpen: false,
                isAnswerAccepted: false
            }), 5000);
        }, 2000);
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <Link to="#" className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                <Link to={`/game-answers/${gameId}`} className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>

                <div className={classes.gameName}>{gameName}</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.teamWrapper}>
                    <div className={classes.team}>Команда</div>
                    <div className={classes.teamName}>{store.getState().appReducer.user.team}</div>
                </div>

                <div className={classes.answerWrapper}>
                    <div
                        className={classes.timeLeft}>Осталось: {Math.ceil(timeForAnswer) >= 0 ? Math.ceil(timeForAnswer) : 0} сек.
                    </div>

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

                {console.log('Из снэкбара', flags)}
                <Snackbar open={flags.isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity={flags.isAnswerAccepted ? 'success' : 'error'}
                           sx={{width: '100%'}}>
                        {flags.isAnswerAccepted ? 'Ответ успешно сохранен' : 'Ответ не отправлен'}
                    </Alert>
                </Snackbar>
            </div>
        </PageWrapper>
    );
}

export default UserGame;