import React, {FC, useEffect, useState} from 'react';
import classes from './user-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {Link, useParams} from 'react-router-dom';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Alert, Snackbar} from '@mui/material';
import {UserGameProps} from '../../entities/user-game/user-game.interfaces';
import {getGame} from '../../server-api/server-api';
import {getCookie, getUrlForSocket} from '../../commonFunctions';
import NavBar from '../../components/nav-bar/nav-bar';
import Loader from '../../components/loader/loader';
import {AppState} from '../../entities/app/app.interfaces';
import {connect} from 'react-redux';

let progressBar: any;
let interval: any;
let checkStart: any;
let ping: any;
let conn: WebSocket;

const UserGame: FC<UserGameProps> = props => {
    const {gameId} = useParams<{ gameId: string }>();
    const [answer, setAnswer] = useState<string>('');
    const [gameName, setGameName] = useState<string>();
    const [questionNumber, setQuestionNumber] = useState<number>(1);
    const [timeForAnswer, setTimeForAnswer] = useState<number>(70);
    const [flags, setFlags] = useState<{
        isSnackbarOpen: boolean,
        isAnswerAccepted: boolean
    }>({
        isSnackbarOpen: false,
        isAnswerAccepted: false
    });
    const [isBreak, setIsBreak] = useState<boolean>(false);
    const [breakTime, setBreakTime] = useState<number>(0);
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
    const [isConnectionError, setIsConnectionError] = useState<boolean>(false);

    useEffect(() => {
        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({
                                     name,
                                 }) => {
                    setGameName(name);
                });
            }
        });

        conn = new WebSocket(getUrlForSocket());

        conn.onopen = () => {
            conn.send(JSON.stringify({
                'action': 'checkStart',
                'cookie': getCookie('authorization'),
            }));

            checkStart = setInterval(() => {
                if (!isGameStarted) {
                    conn.send(JSON.stringify({
                        'action': 'checkStart',
                        'cookie': getCookie('authorization'),
                    }));
                } else {
                    clearInterval(checkStart);
                }
            }, 5000);

            ping = setInterval(() => {
                conn.send(JSON.stringify({
                    'action': 'ping'
                }));
            }, 30000);
        }

        conn.onclose = () => {
            setIsConnectionError(true);
        };

        conn.onerror = () => {
            setIsConnectionError(true);
        }

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);
            if (jsonMessage.action === 'gameNotStarted') {
                setIsGameStarted(false);
                return;
            } else if (jsonMessage.action === 'startGame') {
                setIsGameStarted(true);
                clearInterval(checkStart);
            } else if (jsonMessage.action === 'time') {
                setTimeForAnswer(() => {
                    const progress = document.querySelector('#progress-bar') as HTMLDivElement;
                    const width = Math.ceil(100 * jsonMessage.time / jsonMessage.maxTime);
                    if (!progress) {
                        setIsConnectionError(true);
                    } else {
                        progress.style.width = width + '%';
                        changeColor(progress);
                    }
                    return jsonMessage.time / 1000;
                });
                if (jsonMessage.isStarted) {
                    progressBar = moveProgressBar(jsonMessage.time, jsonMessage.maxTime);
                }
            } else if (jsonMessage.action === 'start') {
                setTimeForAnswer(jsonMessage.time / 1000);
                progressBar = moveProgressBar(jsonMessage.time, jsonMessage.maxTime);
            } else if (jsonMessage.action === 'addTime') {
                clearInterval(progressBar);
                setTimeForAnswer(t => (t ?? 0) + 10);
                if (jsonMessage.isStarted) {
                    progressBar = moveProgressBar(jsonMessage.time, jsonMessage.maxTime);
                }
            } else if (jsonMessage.action === 'pause') {
                clearInterval(progressBar);
            } else if (jsonMessage.action === 'stop') {
                clearInterval(progressBar);
                setTimeForAnswer(70000 / 1000);
                let progress = document.querySelector('#progress-bar') as HTMLDivElement;
                progress.style.width = '100%';
                changeColor(progress);
            } else if (jsonMessage.action === 'changeQuestionNumber') {
                setQuestionNumber(+jsonMessage.number);
                clearInterval(progressBar);
                setTimeForAnswer(70000 / 1000);
                setAnswer('');
                let progress = document.querySelector('#progress-bar') as HTMLDivElement;
                progress.style.width = '100%';
                changeColor(progress);
            } else if (jsonMessage.action === 'currentQuestionNumber') {
                setQuestionNumber(+jsonMessage.number);
            } else if (jsonMessage.action === 'statusAnswer') {
                if (jsonMessage.isAccepted) {
                    setFlags({
                        isAnswerAccepted: true,
                        isSnackbarOpen: true
                    });
                } else {
                    setFlags({
                        isAnswerAccepted: false,
                        isSnackbarOpen: true
                    });
                }
                setTimeout(() => setFlags(flags => {
                    return {
                        isSnackbarOpen: false,
                        isAnswerAccepted: flags.isAnswerAccepted
                    }
                }), 5000);
            } else if (jsonMessage.action === 'isOnBreak') {
                if (jsonMessage.status) {
                    setIsBreak(true);
                    setBreakTime(jsonMessage.time);
                    interval = setInterval(() => setBreakTime((time) => {
                        if (time - 1 <= 0) {
                            clearInterval(interval);
                            setIsBreak(false);
                        }
                        return time - 1 > 0 ? time - 1 : 0;
                    }), 1000)
                } else {
                    setIsBreak(false);
                    setBreakTime(0);
                    clearInterval(interval);
                }
            }
        };

        return () => clearInterval(ping);
    }, []);

    useEffect(() => {
        if (isGameStarted) {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getQuestionNumber'
            }));
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'time'
            }));
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'isOnBreak'
            }));
        }
    }, [isGameStarted]);

    const getGameName = () => {
        if ((gameName as string).length > 34) {
            return (gameName as string).substr(0, 34) + '\u2026';
        } else {
            return gameName;
        }
    }

    const getTeamName = () => {
        let teamName = props.userTeam;
        if (teamName.length > 45) {
            return teamName.substr(0, 45) + '\u2026';
        } else {
            return teamName;
        }
    }

    const getGameNameForWaitingScreen = () => {
        if ((gameName as string).length > 52) {
            return `«${(gameName as string).substr(0, 52)}\u2026»`;
        } else {
            return `«${gameName}»`;
        }
    }

    const parseTimer = () => {
        const minutes = Math.floor(breakTime / 60).toString().padStart(1, '0');
        const sec = Math.floor(breakTime % 60).toString().padStart(2, '0');
        return `${minutes}:${sec}`;
    };

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
    };

    const moveProgressBar = (time: number, maxTime: number) => {
        const progressBar = document.querySelector('#progress-bar') as HTMLDivElement;
        if (!progressBar) {
            setIsConnectionError(true);
            return;
        }

        const frame = () => {
            if (width <= 0) {
                clearInterval(id);
            } else {
                changeColor(progressBar);
                setTimeForAnswer(t => {
                    width = Math.ceil(100 * (t ?? 0) / (maxTime / 1000));
                    progressBar.style.width = width + '%';
                    return (t ?? 0) - 1;
                });
            }
        };

        let width = Math.ceil(100 * time / maxTime);
        const id = setInterval(frame, 1000); // TODO тут время, если оно не всегда 60 секунд, надо будет подставлять переменную
        return id;
    };

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
    };

    const handleSendButtonClick = () => {
        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'Answer',
            'answer': answer
        }));

        setTimeout(() => {
            setFlags(flags => {
                const res = {
                    isSnackbarOpen: true,
                    isAnswerAccepted: false
                };

                if (!flags.isSnackbarOpen) {
                    setTimeout(() => setFlags(flags => {
                        return {
                            isSnackbarOpen: false,
                            isAnswerAccepted: flags.isAnswerAccepted
                        }
                    }), 5000);
                    return res;
                }

                return flags;
            });
        }, 1000);
    };

    const renderPage = () => {
        if (!isGameStarted) {
            return (
                <PageWrapper>
                    <Header isAuthorized={true} isAdmin={false}>
                        <NavBar isAdmin={false} page=""/>
                    </Header>

                    <div className={classes.gameStartContentWrapper}>
                        <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                        <div className={classes.pageText}>{getGameNameForWaitingScreen()}<br /> скоро начнется</div>
                        <div className={classes.pageText}>Подождите</div>
                    </div>
                    <Snackbar sx={{marginTop: '8vh'}} open={isConnectionError} anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
                        <Alert severity='error' sx={{width: '100%'}}>
                            Ошибка соединения. Обновите страницу
                        </Alert>
                    </Snackbar>
                </PageWrapper>
            )
        }

        if (isBreak) {
            return (
                <PageWrapper>
                    <Header isAuthorized={true} isAdmin={false}>
                        <Link to={`/rating/${gameId}`} className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                        <Link to={`/game-answers/${gameId}`} className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>

                        <div className={classes.breakHeader}>Перерыв</div>
                    </Header>

                    <div className={classes.breakContentWrapper}>
                        <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                        <div className={classes.breakTime}>{parseTimer()}</div>
                    </div>
                    <Snackbar sx={{marginTop: '8vh'}} open={isConnectionError} anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
                        <Alert severity='error' sx={{width: '100%'}}>
                            Ошибка соединения. Обновите страницу
                        </Alert>
                    </Snackbar>
                </PageWrapper>
            );
        }

        return (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={false}>
                    <Link to={`/rating/${gameId}`} className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                    <Link to={`/game-answers/${gameId}`} className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>

                    <div className={classes.gameName}>
                        <p>{getGameName()}</p>
                    </div>
                </Header>

                <div className={classes.contentWrapper}>
                    <div className={classes.teamWrapper}>
                        <div className={classes.team}>Команда</div>
                        <div className={classes.teamName}>{getTeamName()}</div>
                    </div>

                    <div className={classes.answerWrapper}>
                        <div
                            className={classes.timeLeft}>Осталось: {Math.ceil(timeForAnswer ?? 0) >=
                        0 ? Math.ceil(timeForAnswer ?? 0) : 0} сек.
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

                    <Snackbar open={flags.isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}>
                        <Alert onClose={handleClose} severity={flags.isAnswerAccepted ? 'success' : 'error'}
                               sx={{width: '100%'}}>
                            {flags.isAnswerAccepted ? 'Ответ успешно отправлен' : 'Ответ не отправлен'}
                        </Alert>
                    </Snackbar>
                </div>
                <Snackbar sx={{marginTop: '8vh'}} open={isConnectionError} anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
                    <Alert severity='error' sx={{width: '100%'}}>
                        Ошибка соединения. Обновите страницу
                    </Alert>
                </Snackbar>
            </PageWrapper>
        );
    }

    return !gameName ? <Loader /> : renderPage();
};

function mapStateToProps(state: AppState) {
    return {
        userTeam: state.appReducer.user.team
    };
}


export default connect(mapStateToProps)(UserGame);