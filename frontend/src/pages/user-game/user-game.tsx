import React, {ChangeEvent, FC, useEffect, useState} from 'react';
import classes from './user-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {Link, useParams} from 'react-router-dom';
import {CustomInput} from '../../components/custom-input/custom-input';
import {Alert, Snackbar} from '@mui/material';
import {UserGameProps} from '../../entities/user-game/user-game.interfaces';
import {GamePartSettings, getGame} from '../../server-api/server-api';
import {getCookie, getUrlForSocket} from '../../commonFunctions';
import NavBar from '../../components/nav-bar/nav-bar';
import Loader from '../../components/loader/loader';
import {AppState} from '../../entities/app/app.interfaces';
import {connect} from 'react-redux';
import MobileNavbar from '../../components/mobile-navbar/mobile-navbar';
import Scrollbar from '../../components/scrollbar/scrollbar';

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
    const [maxTime, setMaxTime] = useState<number>(70);
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
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [gamePart, setGamePart] = useState<'matrix' | 'chgk'>(); // активная часть игры
    const [matrixSettings, setMatrixSettings] = useState<GamePartSettings>();
    const [matrixAnswers, setMatrixAnswers] = useState<{[key: number]: string[]} | null>(null); // Заполнить там же, где matrixSettings, вызвав fillMatrixAnswers(tourNames, questionsCount)
    const [acceptedMatrixAnswers, setAcceptedMatrixAnswers] = useState<{[key: number]: string[]} | null>(null); // Заполнить там же, где matrixSettings, вызвав fillMatrixAnswers(tourNames, questionsCount)
    const [acceptedAnswer, setAcceptedAnswer] = useState<string>();
    const [mediaMatch, setMediaMatch] = useState<MediaQueryList>(window.matchMedia('(max-width: 600px)'));

    const requester = {
        startRequests: () => {
            conn.send(JSON.stringify({
                'action': 'checkStart',
                'cookie': getCookie('authorization'),
            }));


            requester.getTeamAnswers();

            clearInterval(checkStart);
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

            clearInterval(ping);
            ping = setInterval(() => {
                conn.send(JSON.stringify({
                    'action': 'ping'
                }));
            }, 30000);
        },

        checkBreak: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'isOnBreak'
            }));
        },

        getQuestionNumber: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getQuestionNumber'
            }));
        },

        getQuestionTime: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'time'
            }));
        },

        giveAnswerToChgk: (answer: string) => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Answer',
                'answer': answer
            }));
        },

        giveAnswerToMatrix: (answer: string, roundNumber: number, questionNumber: number, roundName: string) => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Answer',
                'answer': answer,
                'roundNumber': roundNumber,
                'questionNumber': questionNumber,
                'roundName': roundName,
            }));
        },

        getTeamAnswers: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getTeamAnswers'
            }));
        }
    }

    const handler = {
        handleGameNotStartedMessage: () => {
            setIsGameStarted(false);
            setIsLoading(false);
        },

        handleGameStatusMessage: (isStarted: boolean, gamePart: 'chgk' | 'matrix', isOnBreak: boolean,
                                  breakTime: number, questionNumber: number, maxTime: number, time: number) => {
            if (isStarted) {
                setGamePart(gamePart);
                setIsGameStarted(true);
                clearInterval(checkStart);
                clearInterval(interval);
                setQuestionNumber(questionNumber);
                setTimeForAnswer(time / 1000);
                setMaxTime(maxTime / 1000);
                if (isOnBreak) {
                    setIsBreak(true);
                    setBreakTime(breakTime);
                    interval = setInterval(() => setBreakTime((time) => {
                        if (time - 1 <= 0) {
                            clearInterval(interval);
                            setIsBreak(false);
                        }
                        return time - 1 > 0 ? time - 1 : 0;
                    }), 1000);
                }

                setIsLoading(false);
                requester.getQuestionTime();
            }
        },

        handleGetTeamAnswers: (matrixAnswers: {roundNumber: number, questionNumber: number, answer: string}[]) => {
            setAcceptedMatrixAnswers((prevValue) => {
                const copy = prevValue ? {...prevValue} : {};
                if (!matrixAnswers) {
                    return copy;
                }

                for (const answer of matrixAnswers) {
                    copy[answer.roundNumber][answer.questionNumber - 1] = answer.answer;
                }
                return copy;
            });
        },

        handleTimeMessage: (time: number, maxTime: number, isStarted: boolean) => {
            setTimeForAnswer(() => {
                const progress = document.querySelector('#progress-bar') as HTMLDivElement;
                const width = Math.ceil(100 * time / maxTime);
                if (!progress) {
                    //setIsConnectionError(true)
                } else {
                    progress.style.width = width + '%';
                    changeColor(progress);
                }
                return time / 1000;
            });
            if (isStarted) {
                clearInterval(progressBar);
                progressBar = moveProgressBar(time, maxTime);
            }
            setMaxTime(maxTime / 1000);
        },

        handleStartMessage: (time: number, maxTime: number) => {
            setTimeForAnswer(time / 1000);
            clearInterval(progressBar);
            progressBar = moveProgressBar(time, maxTime);
            setMaxTime(maxTime / 1000);
        },

        handleAddTimeMessage: (time: number, maxTime: number, isStarted: boolean) => {
            clearInterval(progressBar);
            setTimeForAnswer(t => (t ?? 0) + 10);
            if (isStarted) {
                clearInterval(progressBar);
                progressBar = moveProgressBar(time, maxTime);
            }
            setMaxTime(maxTime / 1000);
        },

        handlePauseMessage: () => {
            clearInterval(progressBar);
        },

        handleStopMessage: (gamePart: 'chgk' | 'matrix') => {
            clearInterval(progressBar);
            setTimeForAnswer(gamePart === 'chgk' ? 70 : 20);
            let progress = document.querySelector('#progress-bar') as HTMLDivElement;
            if (progress) {
                progress.style.width = '100%';
                changeColor(progress);
            }
        },

        handleChangeQuestionNumberMessage: (gamePart: 'chgk' | 'matrix', number: number) => {
            clearInterval(progressBar);
            setAnswer('');
            let progress = document.querySelector('#progress-bar') as HTMLDivElement;
            if (progress) {
                progress.style.width = '100%';
            }
            let answerInput = document.querySelector('#answer') as HTMLInputElement;
            if (answerInput) {
                answerInput.focus();
            }
            changeColor(progress);
            setTimeForAnswer(gamePart === 'chgk' ? 70 : 20);
            setMaxTime(gamePart === 'chgk' ? 70 : 20);
            if (number != questionNumber) {
                setAcceptedAnswer(undefined);
            }
            setQuestionNumber(number);
            setGamePart(gamePart);
        },

        handleCurrentQuestionNumberMessage: (gamePart: 'chgk' | 'matrix', questionNumber: number) => {
            setQuestionNumber(questionNumber);
            setGamePart(gamePart);
        },

        handleStatusAnswerMessage: (gamePart: 'chgk' | 'matrix', newAnswer: string, roundNumber: number, questionNumber: number, isAccepted: boolean) => {
            if (gamePart === "chgk") {
                setAcceptedAnswer(newAnswer);
            } else {
                setAcceptedMatrixAnswers((prevValue) => {
                    const copy = {...prevValue};
                    copy[roundNumber] = copy[roundNumber].map((answer, i) => i === questionNumber - 1 ? newAnswer : answer);
                    return copy;
                });
            }

            if (isAccepted) {
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
        },

        handleIsOnBreakMessage: (status: boolean, time: number) => {
            if (status) {
                setIsBreak(true);
                setBreakTime(time);
                clearInterval(interval);
                interval = setInterval(() => setBreakTime((time) => {
                    if (time - 1 <= 0) {
                        clearInterval(interval);
                        setIsBreak(false);
                    }
                    return time - 1 > 0 ? time - 1 : 0;
                }), 1000);
            } else {
                clearInterval(interval);
                setIsBreak(false);
                setBreakTime(0);
            }

            if (isLoading) {
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        const resizeEventHandler = () => {
            setMediaMatch(window.matchMedia('(max-width: 600px)'));
        }

        window.addEventListener('resize', resizeEventHandler);

        return () => {
            window.removeEventListener('resize', resizeEventHandler);
        };
    }, []);

    useEffect(() => {
        const openWs = () => {
            conn = new WebSocket(getUrlForSocket());

            conn.onopen = () => requester.startRequests();
            conn.onclose = () => setIsConnectionError(true);
            conn.onerror = () => setIsConnectionError(true);

            conn.onmessage = function (event) {
                const jsonMessage = JSON.parse(event.data);

                switch (jsonMessage.action) {
                    case 'gameNotStarted':
                        handler.handleGameNotStartedMessage();
                        break;
                    case 'gameStatus':
                        handler.handleGameStatusMessage(jsonMessage.isStarted, jsonMessage.activeGamePart,
                            jsonMessage.isOnBreak, jsonMessage.breakTime, jsonMessage.currentQuestionNumber,
                            jsonMessage.maxTime, jsonMessage.time);
                        break;
                    case 'time':
                        handler.handleTimeMessage(jsonMessage.time, jsonMessage.maxTime, jsonMessage.isStarted);
                        break;
                    case 'start':
                        handler.handleStartMessage(jsonMessage.time, jsonMessage.maxTime);
                        break;
                    case 'addTime':
                        handler.handleAddTimeMessage(jsonMessage.time, jsonMessage.maxTime, jsonMessage.isStarted);
                        break;
                    case 'pause':
                        handler.handlePauseMessage();
                        break;
                    case 'stop':
                        handler.handleStopMessage(jsonMessage.activeGamePart);
                        break;
                    case 'changeQuestionNumber':
                        handler.handleChangeQuestionNumberMessage(jsonMessage.activeGamePart, jsonMessage.number);
                        break;
                    case 'currentQuestionNumber':
                        handler.handleCurrentQuestionNumberMessage(jsonMessage.activeGamePart, jsonMessage.number);
                        break;
                    case 'statusAnswer':
                        handler.handleStatusAnswerMessage(jsonMessage.activeGamePart, jsonMessage.answer,
                            jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.isAccepted);
                        break;
                    case 'isOnBreak':
                        handler.handleIsOnBreakMessage(jsonMessage.status, jsonMessage.time);
                        break;
                    case 'teamAnswers':
                        handler.handleGetTeamAnswers(jsonMessage.matrixAnswers);
                        break;
                }
            }
        };

        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({
                                     name,
                                     matrixSettings
                                 }) => {
                    setGameName(name);
                    if (matrixSettings) {
                        setMatrixSettings(matrixSettings);
                        fillMatrixAnswers(matrixSettings.roundCount, matrixSettings.questionCount);
                    }

                    openWs();
                });
            }
        });

        return () => clearInterval(ping);
    }, []);

    const fillMatrixAnswers = (roundsCount: number, questionsCount: number) => {
        const answers: {[key: number]: string[]} = {};
        for (let i = 1; i <= roundsCount; i++) {
            answers[i] = Array(questionsCount).fill('');
        }
        setMatrixAnswers(answers);
        setAcceptedMatrixAnswers(answers);
    };

    const getGameName = () => {
        const maxLength = mediaMatch.matches ? 22 : 34;
        if ((gameName as string).length > maxLength) {
            return (gameName as string).substring(0, maxLength + 1) + '\u2026';
        } else {
            return gameName;
        }
    }

    const getTeamName = () => {
        const teamName = props.userTeam;
        const maxLength = mediaMatch.matches ? 25 : 45;
        if (teamName.length > maxLength) {
            return teamName.substring(0, maxLength + 1) + '\u2026';
        } else {
            return teamName;
        }
    }

    const getGameNameForWaitingScreen = () => {
        const maxLength = mediaMatch.matches ? 30 : 52;
        if ((gameName as string).length > maxLength) {
            return `«${(gameName as string).substring(0, maxLength + 1)}\u2026»`;
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
        if (!progressBar) {
            return;
        }

        if (progressBar.style.width) {
            let width = +(progressBar.style.width).slice(0, -1);
            progressBar.style.backgroundColor = chooseColor(width);
        }
    };

    const chooseColor = (width: number) => {
        switch (true) {
            case (width <= 10):
                return 'red';
            case (width >= 11 && width <= 25):
                return 'orange';
            case (width >= 26 && width <= 50):
                return 'yellow';
        }

        return 'green';
    }

    const moveProgressBar = (time: number, maxTime: number) => {
        const progressBar = document.querySelector('#progress-bar') as HTMLDivElement;
        if (!progressBar) {
            //setIsConnectionError(true);
            return;
        }

        const frame = () => {
            if (width <= 0) {
                progressBar.style.width = 0 + '%';
                clearInterval(id);
            } else {
                changeColor(progressBar);
                setTimeForAnswer(t => {
                    width = Math.ceil(100 * (t ?? 0) / (maxTime / 1000));
                    const result = (t ?? 0) - 1;
                    progressBar.style.width = (result <= 0 ? 0 : width) + '%';
                    return result;
                });
            }
        };

        let width = Math.ceil(100 * time / maxTime);
        const id = setInterval(frame, 1000);
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
        requester.giveAnswerToChgk(answer);

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

    const handleMatrixAnswer = (event: ChangeEvent<HTMLInputElement>, index: number, roundNumber: number) => {
        setMatrixAnswers((prevValue) => {
            const copy = {...prevValue};
            copy[roundNumber] = copy[roundNumber].map((answer, i) => i === index ? event.target.value : answer);
            return copy;
        });
    };

    const handleSendMatrixAnswer = (questionNumber: number, roundName: string, roundNumber: number) => {
        requester.giveAnswerToMatrix(matrixAnswers?.[roundNumber][questionNumber - 1] as string, roundNumber, questionNumber, roundName);

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

    const renderMatrix = () => {
        return matrixSettings?.roundNames?.map((tourName, i) => {
            return (
                <div className={classes.tourQuestionsWrapper} key={`${tourName}_${i}`}>
                    <div className={classes.tourName}>{tourName}</div>

                    {
                        Array.from(Array(matrixSettings.questionCount).keys()).map((j) => {
                            return (
                                <div key={`matrix_question_${j}`}>
                                    <p className={classes.matrixAnswerNumber}>Вопрос {j + 1}</p>

                                    <div className={classes.answerInputWrapper}>
                                        <CustomInput type="text" id="answer" name="answer" placeholder="Ответ"
                                                     style={{width: mediaMatch.matches ? '100%' : '79%', marginBottom: '4%',
                                                         height: mediaMatch.matches ? '8.7vw' : '7vh'}} value={matrixAnswers?.[i + 1][j]} onChange={(event) => handleMatrixAnswer(event, j, i + 1)}/>
                                        <button className={classes.sendAnswerButton} onClick={() => handleSendMatrixAnswer(j + 1, tourName, i + 1)}>Отправить
                                        </button>

                                        {
                                            acceptedMatrixAnswers?.[i + 1][j]
                                                ?
                                                <small className={classes.accepted}>{'Принятый ответ: '}
                                                    <span className={classes.acceptedAnswer}>{acceptedMatrixAnswers?.[i + 1][j]}</span>
                                                </small>
                                                : null
                                        }
                                    </div>

                                    <Snackbar open={flags.isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}
                                              sx={{position: mediaMatch.matches ? 'absolute' : 'fixed',
                                                  bottom: mediaMatch.matches ? '-8vh' : 'unset'}}>
                                        <Alert onClose={handleClose} severity={flags.isAnswerAccepted ? 'success' : 'error'}
                                               sx={{width: '100%'}}>
                                            {flags.isAnswerAccepted ? 'Ответ успешно отправлен' : 'Ответ не отправлен'}
                                        </Alert>
                                    </Snackbar>
                                </div>
                            );
                        })
                    }
                </div>
            );
        });
    };

    const renderGamePart = () => {
        const width = Math.ceil(100 * (timeForAnswer / maxTime));

        if (gamePart === 'matrix') {
            return (
                <>
                    <div className={classes.teamWrapper}>
                        <div className={classes.team}>{'Команда '}</div>
                        <div className={classes.teamName}>{getTeamName()}</div>
                    </div>

                    <div className={classes.answersWrapper}>
                        <div className={classes.timeLeft}>Осталось: {Math.ceil(timeForAnswer ?? 0) >= 0 ? Math.ceil(timeForAnswer ?? 0) : 0} сек.
                        </div>

                        <div style={{width: mediaMatch.matches ? '98%' : '99%', height: '2%', marginLeft: '4px'}}>
                            <div className={classes.progressBar} id="progress-bar"
                                 style={{width: width + '%', backgroundColor: chooseColor(width)}}/>
                        </div>

                        <div className={classes.answersBox}>
                            <Scrollbar>
                                {renderMatrix()}
                            </Scrollbar>
                        </div>
                    </div>
                </>
            );
        }
        if (gamePart === 'chgk') {
            return (
                <>
                    <div className={classes.teamWrapper}>
                        <div className={classes.team}>{'Команда '}</div>
                        <div className={classes.teamName}>{getTeamName()}</div>
                    </div>

                    <div className={classes.answerWrapper}>
                        <div className={classes.timeLeft}>Осталось: {Math.ceil(timeForAnswer ?? 0) >=
                        0 ? Math.ceil(timeForAnswer ?? 0) : 0} сек.
                        </div>

                        <div style={{width: mediaMatch.matches ? '98%' : '99%', height: '2%', marginLeft: '4px'}}>
                            <div className={classes.progressBar} id="progress-bar"
                                 style={{width: width + '%', backgroundColor: chooseColor(width)}}/>
                        </div>
                        <div className={classes.answerBox}>
                            <p className={classes.answerNumber}>Вопрос {questionNumber}</p>

                            <div className={classes.answerInputWrapper}>
                                <CustomInput type="text" id="answer" name="answer" placeholder="Ответ"
                                             style={{width: mediaMatch.matches ? '100%' : '79%',
                                                 height: mediaMatch.matches ? '8.7vw' : '7vh'}} value={answer} onChange={handleAnswer}/>
                                <button className={classes.sendAnswerButton} onClick={handleSendButtonClick}>Отправить
                                </button>

                                {
                                    acceptedAnswer
                                        ?
                                        <small className={classes.acceptedChgk}>{'Принятый ответ: '}
                                            <span className={classes.acceptedAnswer}>{acceptedAnswer}</span>
                                        </small>
                                        : null
                                }
                            </div>

                            <Snackbar open={flags.isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}
                                      sx={{position: mediaMatch.matches ? 'absolute' : 'fixed',
                                          bottom: mediaMatch.matches ? '-8vh' : 'unset'}}>
                                <Alert onClose={handleClose} severity={flags.isAnswerAccepted ? 'success' : 'error'}
                                       sx={{width: '100%'}}>
                                    {flags.isAnswerAccepted ? 'Ответ успешно отправлен' : 'Ответ не отправлен'}
                                </Alert>
                            </Snackbar>
                        </div>
                    </div>
                </>
            );
        }
    };

    const renderPage = () => {
        if (!isGameStarted) {
            return (
                <PageWrapper>
                    <Header isAuthorized={true} isAdmin={false}>
                        {
                            !mediaMatch.matches
                                ? <NavBar isAdmin={false} page=''/>
                                : null
                        }
                    </Header>

                    {
                        mediaMatch.matches
                            ? <MobileNavbar isAdmin={false} page='' isGame={false} />
                            : null
                    }
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

                        {
                            !mediaMatch.matches
                                ?
                                <>
                                    <Link to={`/rating/${gameId}`} className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                                    <Link to={`/game-answers/${gameId}`} className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>
                                </>
                                : null
                        }

                        <div className={classes.breakHeader}>Перерыв</div>
                    </Header>

                    {
                        mediaMatch.matches
                            ? <MobileNavbar isGame={true} isAdmin={false} page={''} toAnswers={true} gameId={gameId}/>
                            : null
                    }
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
                    {
                        !mediaMatch.matches
                            ?
                            <>
                                <Link to={`/rating/${gameId}`} className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                                <Link to={`/game-answers/${gameId}`} className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>
                            </>
                            : null
                    }

                    <div className={classes.gameName}>
                        <p>{getGameName()}</p>
                    </div>
                </Header>

                {
                    mediaMatch.matches
                        ? <MobileNavbar isGame={true} isAdmin={false} page='' toAnswers={true} gameId={gameId}/>
                        : null
                }
                <div className={classes.contentWrapper}>
                    {renderGamePart()}
                </div>
                <Snackbar sx={{marginTop: '8vh'}} open={isConnectionError} anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
                    <Alert severity='error' sx={{width: '100%'}}>
                        Ошибка соединения. Обновите страницу
                    </Alert>
                </Snackbar>
            </PageWrapper>
        );
    }

    return isLoading || !gameName ? <Loader /> : renderPage();
};

function mapStateToProps(state: AppState) {
    return {
        userTeam: state.appReducer.user.team
    };
}


export default connect(mapStateToProps)(UserGame);