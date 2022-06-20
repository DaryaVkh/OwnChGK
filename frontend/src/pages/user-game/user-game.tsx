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

let progressBarInterval: any;
let interval: any;
let checkStart: any;
let ping: any;
let conn: WebSocket;
let matrixSettingsCurrent: GamePartSettings | undefined;

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
    const [chgkSettings, setChgkSettings] = useState<GamePartSettings>();
    const [matrixAnswers, setMatrixAnswers] = useState<{ [key: number]: string[] } | null>(null); // Заполнить там же, где matrixSettings, вызвав fillMatrixAnswers(tourNames, questionsCount)
    const [acceptedMatrixAnswers, setAcceptedMatrixAnswers] = useState<{ [key: number]: string[] } | null>(null); // Заполнить там же, где matrixSettings, вызвав fillMatrixAnswers(tourNames, questionsCount)
    const [acceptedAnswer, setAcceptedAnswer] = useState<string | undefined>();
    const [mediaMatch, setMediaMatch] = useState<MediaQueryList>(window.matchMedia('(max-width: 600px)'));
    const [activeMatrixRound, setActiveMatrixRound] = useState<{ name: string, index: number }>();
    const [activeMatrixQuestion, setActiveMatrixQuestion] = useState<number>(1);
    const [focusedMatrixAnswerInfo, setFocusedMatrixAnswerInfo] = useState<{index: number, roundName: string, roundNumber: number}>();

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

        checkTime: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'checkTime',
            }))
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
        },

        checkBreakTime: (time: number) => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'checkBreakTime',
                'time': time,
            }))
        },
    }

    const handler = {
        handleGameNotStartedMessage: () => {
            setIsGameStarted(false);
            setIsLoading(false);
        },

        handleGameStatusMessage: (isStarted: boolean, gamePart: 'chgk' | 'matrix', isOnBreak: boolean,
                                  breakTime: number, questionNumber: number, matrixActive: { round: number, question: number }, maxTime: number, time: number) => {
            if (isStarted) {
                setGamePart(gamePart);
                setIsGameStarted(true);
                clearInterval(checkStart);
                clearInterval(interval);
                setQuestionNumber(questionNumber);
                if (gamePart === 'matrix') {
                    const matrixRoundName = matrixSettingsCurrent?.roundNames?.[matrixActive.round - 1];
                    if (matrixRoundName) {
                        setActiveMatrixRound({name: matrixRoundName, index: matrixActive.round});
                    }
                    setActiveMatrixQuestion(matrixActive.question);
                }
                setTimeForAnswer(time / 1000);
                setMaxTime(maxTime / 1000);
                if (isOnBreak) {
                    setIsBreak(true);
                    setBreakTime(breakTime);
                    interval = setInterval(() => setBreakTime((time) => {
                        requester.checkBreakTime(time);
                        if (time - 1 <= 0) {
                            clearInterval(interval);
                            setIsBreak(false);
                        }
                        return time - 1 > 0 ? time - 1 : 0;
                    }), 1000);
                }

                setIsLoading(false);
                requester.getQuestionTime();
            } else {
                setIsLoading(false);
            }
        },

        handleGetTeamAnswers: (matrixAnswers: { roundNumber: number, questionNumber: number, answer: string }[]) => {
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

        handleTimeMessage: (time: number, maxTime: number, isStarted: boolean, gamePart: 'chgk' | 'matrix') => {
            setTimeForAnswer(() => {
                const progress = document.querySelector('#progress-bar') as HTMLDivElement;
                const width = Math.ceil(100 * time / maxTime);
                if (!progress) {
                    //setIsConnectionError(true)
                } else {
                    progress.style.width = width + '%';
                    changeColor(progress, gamePart);
                }
                return time / 1000;
            });
            if (isStarted) {
                clearInterval(progressBarInterval);
                progressBarInterval = moveProgressBar(time, maxTime);
            }
            setMaxTime(maxTime / 1000);
        },

        handleCheckTimeMessage: (time: number, maxTime: number, gamePart: 'chgk' | 'matrix') => {
            const progressBar = document.querySelector('#progress-bar') as HTMLDivElement;
            if (!progressBar || time == 0) {
                clearInterval(progressBarInterval);
            }

            const width = Math.ceil(100 * time / maxTime);
            progressBar.style.width = width + '%';
            changeColor(progressBar, gamePart);

            const newTime = Math.round(time / 1000)
            setTimeForAnswer(newTime);
            setMaxTime(Math.round(maxTime / 1000));
        },

        handleCheckBreakTimeMessage: (currentTime: number, time: number) => {
            setBreakTime(time);
        },

        handleStartMessage: (time: number, maxTime: number) => {
            setTimeForAnswer(time / 1000);
            clearInterval(progressBarInterval);
            progressBarInterval = moveProgressBar(time, maxTime);
            setMaxTime(maxTime / 1000);
        },

        handleAddTimeMessage: (time: number, maxTime: number, isStarted: boolean) => {
            clearInterval(progressBarInterval);
            setTimeForAnswer(t => (t ?? 0) + 10);
            if (isStarted) {
                clearInterval(progressBarInterval);
                progressBarInterval = moveProgressBar(time, maxTime);
            }
            setMaxTime(maxTime / 1000);
        },

        handlePauseMessage: () => {
            clearInterval(progressBarInterval);
        },

        handleStopMessage: (gamePart: 'chgk' | 'matrix') => {
            clearInterval(progressBarInterval);
            setTimeForAnswer(gamePart === 'chgk' ? 70 : 20);
            let progress = document.querySelector('#progress-bar') as HTMLDivElement;
            if (progress) {
                progress.style.width = '100%';
                changeColor(progress, gamePart);
            }
        },

        handleChangeQuestionNumberMessage: (gamePart: 'chgk' | 'matrix', number: number, matrixActive: { round: number, question: number }) => {
            clearInterval(progressBarInterval);
            setAnswer('');
            let progress = document.querySelector('#progress-bar') as HTMLDivElement;
            if (progress) {
                progress.style.width = '100%';
            }
            let answerInput = document.querySelector('#answer') as HTMLInputElement;
            if (answerInput && gamePart === 'chgk') {
                answerInput.focus();
            }
            changeColor(progress, gamePart);
            setTimeForAnswer(gamePart === 'chgk' ? 70 : 20);
            setMaxTime(gamePart === 'chgk' ? 70 : 20);
            if (number != questionNumber) {
                setAcceptedAnswer(undefined);
            }
            setQuestionNumber(number);
            if (gamePart === 'matrix') {
                const matrixRoundName = matrixSettingsCurrent?.roundNames?.[matrixActive.round - 1];
                if (matrixRoundName) {
                    setActiveMatrixRound({name: matrixRoundName, index: matrixActive.round});
                }
                setActiveMatrixQuestion(matrixActive.question);
            }
            setGamePart(gamePart);
        },

        handleCurrentQuestionNumberMessage: (gamePart: 'chgk' | 'matrix', questionNumber: number, matrixActive: { round: number, question: number }) => {
            setQuestionNumber(questionNumber);
            if (gamePart === 'matrix') {
                const matrixRoundName = matrixSettingsCurrent?.roundNames?.[matrixActive.round - 1];
                if (matrixRoundName) {
                    setActiveMatrixRound({name: matrixRoundName, index: matrixActive.round});
                }
                setActiveMatrixQuestion(matrixActive.question);
            }
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
                    requester.checkBreakTime(time);
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
        };

        window.addEventListener('resize', resizeEventHandler);

        return () => {
            window.removeEventListener('resize', resizeEventHandler);
        };
    }, []);

    useEffect(() => {
        const enterEventHandler = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (gamePart === 'matrix') {
                    if (focusedMatrixAnswerInfo) {
                        handleSendMatrixAnswer(focusedMatrixAnswerInfo.index, focusedMatrixAnswerInfo.roundName, focusedMatrixAnswerInfo.roundNumber);
                    }
                } else if (gamePart === 'chgk') {
                    handleSendButtonClick();
                }
            }
        };

        window.addEventListener('keypress', enterEventHandler);

        return () => {
            window.removeEventListener('keypress', enterEventHandler);
        }
    }, [answer, focusedMatrixAnswerInfo, gamePart]);

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
                            jsonMessage.matrixActive, jsonMessage.maxTime, jsonMessage.time);
                        break;
                    case 'time':
                        handler.handleTimeMessage(jsonMessage.time, jsonMessage.maxTime, jsonMessage.isStarted, jsonMessage.gamePart);
                        break;
                    case 'checkTime':
                        handler.handleCheckTimeMessage(jsonMessage.time, jsonMessage.maxTime, jsonMessage.gamePart);
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
                        handler.handleChangeQuestionNumberMessage(jsonMessage.activeGamePart, jsonMessage.number, jsonMessage.matrixActive);
                        break;
                    case 'currentQuestionNumber':
                        handler.handleCurrentQuestionNumberMessage(jsonMessage.activeGamePart, jsonMessage.number, jsonMessage.matrixActive);
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
                    case 'checkBreakTime':
                        handler.handleCheckBreakTimeMessage(jsonMessage.currentTime, jsonMessage.time);
                        break;
                }
            }
        };

        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({
                                     name,
                                     chgkSettings,
                                     matrixSettings
                                 }) => {
                    setGameName(name);
                    matrixSettingsCurrent = undefined;
                    if (matrixSettings) {
                        matrixSettingsCurrent = matrixSettings;
                        fillMatrixAnswers(matrixSettings.roundCount, matrixSettings.questionCount);
                    }
                    if (chgkSettings) {
                        setChgkSettings(chgkSettings);
                    }

                    openWs();
                });
            }
        });

        return () => clearInterval(ping);
    }, []);

    const fillMatrixAnswers = (roundsCount: number, questionsCount: number) => {
        const answers: { [key: number]: string[] } = {};
        for (let i = 1; i <= roundsCount; i++) {
            answers[i] = Array(questionsCount).fill('');
        }
        setMatrixAnswers(answers);
        setAcceptedMatrixAnswers(answers);
    };

    const getTeamName = () => {
        const teamName = props.userTeam;
        const maxLength = mediaMatch.matches ? 25 : 45;
        if (teamName.length > maxLength) {
            return teamName.substring(0, maxLength + 1) + '\u2026';
        }
        return teamName;
    }

    const getGameNameForWaitingScreen = () => {
        const maxLength = mediaMatch.matches ? 30 : 52;
        if ((gameName as string).length > maxLength) {
            return `«${(gameName as string).substring(0, maxLength + 1)}\u2026»`;
        }
        return `«${gameName}»`;
    }

    const parseTimer = () => {
        const minutes = Math.floor(breakTime / 60).toString().padStart(1, '0');
        const sec = Math.floor(breakTime % 60).toString().padStart(2, '0');
        return `${minutes}:${sec}`;
    };

    const changeColor = (progressBar: HTMLDivElement, gamePart: 'chgk' | 'matrix') => {
        if (!progressBar) {
            return;
        }

        if (progressBar.style.width) {
            let width = +(progressBar.style.width).slice(0, -1);
            progressBar.style.backgroundColor = chooseColor(width, gamePart);
        }
    };

    const chooseColor = (width: number, gamePart: 'chgk' | 'matrix') => {
        const redTime = (gamePart === 'chgk' ? 10 / 70 * 100 + 1 : 5 / 20 * 100);
        switch (true) {
            case (width <= redTime): // 10-0, 5-0
                return 'red';
            case (redTime < width && width <= 50): // 35-11, 10-6
                return 'yellow';
        }

        return 'green';  // 70-36, 20-11
    }

    const moveProgressBar = (time: number, maxTime: number) => {
        return setInterval(() => requester.checkTime(), 1000);
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
        requester.giveAnswerToMatrix(matrixAnswers?.[roundNumber]?.[questionNumber - 1] as string, roundNumber, questionNumber, roundName);

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

    const getShortenedAnswer = (answer: string) => {
        const maxLength = mediaMatch.matches ? 30 : 52;
        if (answer.length > maxLength) {
            return `${answer.substring(0, maxLength + 1)}\u2026`;
        }
        return `${answer}`;
    };

    const renderMatrix = () => {
        return matrixSettingsCurrent?.roundNames?.map((tourName, i) => {
            return (
                <div className={classes.tourQuestionsWrapper} key={`${tourName}_${i}`}>
                    <div className={classes.tourName}>{tourName}</div>

                    {
                        Array.from(Array(matrixSettingsCurrent?.questionCount).keys()).map((j) => {
                            return (
                                <div key={`matrix_question_${j}`} style={{marginBottom: j === (matrixSettingsCurrent?.questionCount as number) - 1 ? (mediaMatch.matches ? '10vw' : '4vh') : 0}}>
                                    <p className={classes.matrixAnswerNumber}>Вопрос {j + 1}</p>

                                    <div className={classes.answerInputWrapper}>
                                        <CustomInput type="text" id="answer" name="answer" placeholder="Ответ"
                                                     style={{
                                                         width: mediaMatch.matches ? '100%' : '79%', marginBottom: '4%',
                                                         height: mediaMatch.matches ? '8.7vw' : '7vh',
                                                         marginRight: mediaMatch.matches ? '0' : '2%'
                                                     }} value={matrixAnswers?.[i + 1][j]} onFocus={() => setFocusedMatrixAnswerInfo({index: j + 1, roundName: tourName, roundNumber: i + 1})}
                                                     onChange={(event) => handleMatrixAnswer(event, j, i + 1)}/>
                                        {
                                            acceptedMatrixAnswers?.[i + 1][j] && mediaMatch.matches
                                                ?
                                                <small className={classes.accepted}>{'Принятый ответ: '}
                                                    <span
                                                        className={classes.acceptedAnswer}>{getShortenedAnswer(acceptedMatrixAnswers?.[i + 1][j] as string)}</span>
                                                </small>
                                                : null
                                        }

                                        <button className={classes.sendAnswerButton}
                                                onClick={() => handleSendMatrixAnswer(j + 1, tourName, i + 1)}>Отправить
                                        </button>

                                        {
                                            acceptedMatrixAnswers?.[i + 1][j] && !mediaMatch.matches
                                                ?
                                                <small className={classes.accepted}>{'Принятый ответ: '}
                                                    <span
                                                        className={classes.acceptedAnswer}>{getShortenedAnswer(acceptedMatrixAnswers?.[i + 1][j] as string)}</span>
                                                </small>
                                                : null
                                        }
                                    </div>

                                    <Snackbar open={flags.isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}
                                              sx={{
                                                  position: mediaMatch.matches ? 'absolute' : 'fixed',
                                                  bottom: mediaMatch.matches ? '-8vh' : 'unset'
                                              }}>
                                        <Alert onClose={handleClose}
                                               severity={flags.isAnswerAccepted ? 'success' : 'error'}
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

    const renderChgkQuestionText = () => {
        const roundIndex = Math.ceil(questionNumber / (chgkSettings?.questionCount as number));
        const questionInRoundIndex = questionNumber - (roundIndex - 1) * (chgkSettings?.questionCount as number);
        const question = chgkSettings?.questions?.[roundIndex]?.[questionInRoundIndex - 1];
        return (
            <>
                <div className={classes.answerNumber} style={{marginBottom: question ? '1.5vh' : '0'}}>
                    {`Вопрос ${questionNumber}`}
                </div>
                {question || ''}
            </>
        );
    };

    const renderMatrixQuestionText = () => {
        const question = matrixSettingsCurrent?.questions?.[activeMatrixRound?.index as number]?.[activeMatrixQuestion - 1];
        if (question) {
            return (
                <div className={classes.matrixQuestion}>{question}</div>
            );
        }
        return null;
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
                        <div className={classes.questionWrapper}>
                            <div className={classes.activeRoundName}>
                                <div>Вопрос {activeMatrixQuestion}</div>
                                <div style={{maxWidth: '60%'}}>{activeMatrixRound?.name}</div>
                            </div>
                            {renderMatrixQuestionText()}
                            <div
                                className={classes.matrixTime}>Осталось: {Math.ceil(timeForAnswer ?? 0) >= 0 ? Math.ceil(timeForAnswer ?? 0) : 0} сек.
                            </div>
                        </div>

                        <div style={{width: '100%', height: '2%', minHeight: '10px'}}>
                            <div className={classes.progressBar} id="progress-bar"
                                 style={{width: width + '%', backgroundColor: chooseColor(width, gamePart)}}/>
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
                        <div className={classes.questionWrapper}>
                            {
                                renderChgkQuestionText()
                            }
                        </div>
                        <div style={{width: '100%', height: '2%', minHeight: '10px'}}>
                            <div className={classes.progressBar} id="progress-bar"
                                 style={{width: width + '%', backgroundColor: chooseColor(width, gamePart)}}/>
                        </div>
                        <div className={classes.answerBox}>
                            <div style={{display: 'flex', flexDirection: 'column', width: '85%'}}>
                                <p className={classes.timeLeft}>Осталось: {Math.ceil(timeForAnswer ?? 0) >=
                                0 ? Math.ceil(timeForAnswer ?? 0) : 0} сек.</p>

                                <div className={classes.answerInputWrapper}>
                                    <CustomInput type="text" id="answer" name="answer" placeholder="Ответ"
                                                 style={{
                                                     width: mediaMatch.matches ? '100%' : '79%',
                                                     height: mediaMatch.matches ? '8.7vw' : '7vh',
                                                     marginRight: mediaMatch.matches ? 0 : '20px'
                                                 }} value={answer} onChange={handleAnswer}/>
                                    {
                                        acceptedAnswer && mediaMatch.matches
                                            ?
                                            <small className={classes.acceptedChgk}>{'Принятый ответ: '}
                                                <span className={classes.acceptedAnswer}>{getShortenedAnswer(acceptedAnswer)}</span>
                                            </small>
                                            : null
                                    }
                                    <button className={classes.sendAnswerButton}
                                            onClick={handleSendButtonClick}>Отправить
                                    </button>

                                    {
                                        acceptedAnswer && !mediaMatch.matches
                                            ?
                                            <small className={classes.acceptedChgk}>{'Принятый ответ: '}
                                                <span className={classes.acceptedAnswer}>{getShortenedAnswer(acceptedAnswer)}</span>
                                            </small>
                                            : null
                                    }
                                </div>
                            </div>

                            <Snackbar open={flags.isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}
                                      sx={{
                                          position: mediaMatch.matches ? 'absolute' : 'fixed',
                                          bottom: mediaMatch.matches ? '-8vh' : 'unset'
                                      }}>
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
                            ? <MobileNavbar isAdmin={false} page='' isGame={false}/>
                            : null
                    }
                    <div className={classes.gameStartContentWrapper}>
                        <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                        <div className={classes.pageText}>{getGameNameForWaitingScreen()}<br/> скоро начнется</div>
                        <div className={classes.pageText}>Подождите</div>
                    </div>
                    <Snackbar sx={{marginTop: '8vh'}} open={isConnectionError}
                              anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
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
                                    <Link to={`/rating/${gameId}`}
                                          className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                                    <Link to={`/game-answers/${gameId}`}
                                          className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>
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
                    <Snackbar sx={{marginTop: '8vh'}} open={isConnectionError}
                              anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
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
                                <Link to={`/rating/${gameId}`}
                                      className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                                <Link to={`/game-answers/${gameId}`}
                                      className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>
                            </>
                            : null
                    }

                    <div className={classes.gameName}>
                        {gameName}
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
                <Snackbar sx={{marginTop: '8vh'}} open={isConnectionError}
                          anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
                    <Alert severity='error' sx={{width: '100%'}}>
                        Ошибка соединения. Обновите страницу
                    </Alert>
                </Snackbar>
            </PageWrapper>
        );
    }

    return isLoading || !gameName ? <Loader/> : renderPage();
};

function mapStateToProps(state: AppState) {
    return {
        userTeam: state.appReducer.user.team
    };
}

export default connect(mapStateToProps)(UserGame);
