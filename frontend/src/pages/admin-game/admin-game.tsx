import React, {FC, useEffect, useState} from 'react';
import classes from './admin-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {Link, useParams} from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {AdminGameProps, TourProps} from '../../entities/admin-game/admin-game.interfaces';
import PauseIcon from '@mui/icons-material/Pause';
import CircleOutlinedIcon from '@mui/icons-material/Circle';
import {GamePartSettings, getGame} from '../../server-api/server-api';
import Scrollbar from '../../components/scrollbar/scrollbar';
import {getCookie, getUrlForSocket} from '../../commonFunctions';
import Modal from '../../components/modal/modal';
import Loader from '../../components/loader/loader';
import {Alert, Snackbar} from '@mui/material';

let interval: any;
let breakInterval: any;
let conn: WebSocket;
let ping: any;

const AdminGame: FC<AdminGameProps> = props => {
    const [playOrPause, setPlayOrPause] = useState<'play' | 'pause'>('play');

    const [clickedTourIndex, setClickedTourIndex] = useState<number>(); // Тур, на который жмякнули
    const [clickedGamePart, setClickedGamePart] = useState<'matrix' | 'chgk'>(); // Часть игры, на тур которой жмякнули (чтобы перерисовать количество вопросов)
    const [activeTourIndex, setActiveTour] = useState<number | undefined>(1); // Индекс активного тура активной части игры
    const [activeGamePart, setActiveGamePart] = useState<'chgk' | 'matrix'>(); // Активная часть игры
    const [activeQuestionNumber, setActiveQuestion] = useState<number | undefined>(undefined); // Индекс активного вопроса в активном туре активной части игры

    const [chgkSettings, setChgkSettings] = useState<GamePartSettings>(); // Настройки ЧГК
    const [matrixSettings, setMatrixSettings] = useState<GamePartSettings>(); // Настройки матрицы
    const [gameName, setGameName] = useState<string>();
    const {gameId} = useParams<{ gameId: string }>();
    const [timer, setTimer] = useState<number>(70000); // Таймер одного вопроса
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [breakTime, setBreakTime] = useState<number>(0); // в секундах
    const [isBreak, setIsBreak] = useState<boolean>(false); // флаг для перерыва
    const [isAppeal, setIsAppeal] = useState<boolean[]>([]);
    const [isConnectionError, setIsConnectionError] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isStop, setIsStop] = useState<boolean>(false);

    const requester = {
        startRequests: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'time'
            }));
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getAllAppeals'
            }));
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'isOnBreak'
            }));
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getQuestionNumber'
            }));

            ping = setInterval(() => {
                conn.send(JSON.stringify({
                    'action': 'ping'
                }));
            }, 30000);
        },

        changeQuestion: (questionNumber: number, roundNumber: number, gamePart: 'chgk' | 'matrix') => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'changeQuestion',
                'questionNumber': questionNumber,
                'tourNumber': roundNumber,
                'activeGamePart': gamePart
            }));
        },

        getQuestionNumber: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getQuestionNumber',
            }));
        },

        startGame: (gamePart: 'chgk' | 'matrix') => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Start',
                'gamePart': gamePart,
            }));
        },

        pauseGame: (gamePart: 'chgk' | 'matrix') => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Pause',
                'gamePart': gamePart,
            }));
        },

        stopGame: (gamePart: 'chgk' | 'matrix') => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Stop',
                'gamePart': gamePart
            }));
        },

        addTenSeconds: (gamePart: 'chgk' | 'matrix') => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': '+10sec',
                'gamePart': gamePart
            }));
        },

        stopBreak: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'stopBreak'
            }));
        },

        checkTime: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'checkTime',
            }))
        },

        checkBreakTime: (time: number) => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'checkBreakTime',
                'time': time,
            }))
        }
    };

    const handlers = {
        handleTimeMessage: (time: number, isStarted: boolean) => {
            setTimer(time);
            if (isStarted) {
                setPlayOrPause('pause');
                clearInterval(interval);
                interval = setInterval(() => requester.checkTime(), 1000);
            }
        },

        handleCheckTimeMessage: (time: number) => {
            if (time == 0) {
                clearInterval(interval);
            }

            setIsStop(stop => {
                if (!stop) {
                    if (time == 0) {
                        setPlayOrPause('play');
                    }

                    setTimer(time);
                }

                return stop;
            })
        },

        handleCheckBreakTimeMessage: (currentTime: number, time: number) => {
            setBreakTime(time);
        },

        handleAppealMessage: (questionNumber: number) => {
            setIsAppeal(appeals => {
                const appealsCopy = appeals.slice();
                appealsCopy[questionNumber - 1] = true;
                return appealsCopy;
            })
        },

        handleAppealsMessage: (appealByQuestionNumber: number[]) => {
            setIsAppeal(appeals => {
                const appealsCopy = new Array(appeals.length).fill(false)
                for (const number of appealByQuestionNumber) {
                    appealsCopy[number - 1] = true;
                }
                return appealsCopy;
            })
        },

        handleIsOnBreakMessage: (status: boolean, time: number) => {
            if (status) {
                setIsBreak(true);
                setBreakTime(time);
                clearInterval(breakInterval);
                breakInterval = setInterval(() => setBreakTime((time) => {
                    requester.checkBreakTime(time);
                    if (time - 1 <= 0) {
                        clearInterval(breakInterval);
                        setIsBreak(false);
                    }
                    return time - 1 > 0 ? time - 1 : 0;
                }), 1000)
            }
        },

        handleChangeQuestionNumber: (round: number, question: number, activeGamePart: 'chgk' | 'matrix') => {
            setClickedTourIndex(round);
            setActiveTour(round);
            setClickedGamePart(activeGamePart);
            setActiveGamePart(activeGamePart);
            setActiveQuestion(question);
            setIsLoading(false);
        },

        handleQuestionNumberIsUndefinedMessage: (activeGamePart: 'chgk' | 'matrix') => {
            setClickedTourIndex(1);
            setActiveTour(1);
            setClickedGamePart(activeGamePart);
            setActiveGamePart(activeGamePart);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({
                                     name,
                                     chgkSettings,
                                     matrixSettings
                                 }) => {
                    setGameName(name);
                    setMatrixSettings(matrixSettings ?? null);
                    setChgkSettings(chgkSettings ?? null);
                    setIsAppeal(new Array(chgkSettings ? chgkSettings.roundCount * chgkSettings.questionCount : 0).fill(false));
                });
            }
        });

        conn = new WebSocket(getUrlForSocket());

        conn.onopen = () => requester.startRequests();
        conn.onclose = () => setIsConnectionError(true);
        conn.onerror = () => setIsConnectionError(true);

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);

            switch (jsonMessage.action) {
                case 'time':
                    handlers.handleTimeMessage(jsonMessage.time, jsonMessage.isStarted);
                    break;
                case 'appeal':
                    handlers.handleAppealMessage(jsonMessage.questionNumber);
                    break;
                case 'appeals':
                    handlers.handleAppealsMessage(jsonMessage.appealByQuestionNumber);
                    break;
                case 'isOnBreak':
                    handlers.handleIsOnBreakMessage(jsonMessage.status, jsonMessage.time);
                    break;
                case 'changeQuestionNumber':
                    handlers.handleChangeQuestionNumber(jsonMessage.round, jsonMessage.question, jsonMessage.activeGamePart);
                    break;
                case 'questionNumberIsUndefined':
                    handlers.handleQuestionNumberIsUndefinedMessage(jsonMessage.activeGamePart);
                    break;
                case 'checkTime':
                    handlers.handleCheckTimeMessage(jsonMessage.time);
                    break;
                case 'checkBreakTime':
                    handlers.handleCheckBreakTimeMessage(jsonMessage.currentTime, jsonMessage.time);
                    break;
            }
        };

        return () => clearInterval(ping);
    }, []);

    const Tour: FC<TourProps> = props => {
        const handleTourClick = () => {
            if (activeTourIndex === props.tourNumber && activeGamePart === props.gamePart) {
                requester.getQuestionNumber();
            } else {
                setClickedTourIndex(props.tourIndex);
                setClickedGamePart(props.gamePart);
                setActiveQuestion(undefined);
            }
        };

        if (clickedTourIndex === undefined) {
            return null;
        }

        return (
            <div
                className={`${classes.tour} ${props.tourIndex === clickedTourIndex && clickedGamePart === props.gamePart ? classes.activeTour : ''}`}
                id={`${props.tourIndex}_${props.gamePart}`}
                onClick={handleTourClick} key={`tour_${props.tourNumber}`}>
                {
                    activeTourIndex !== undefined && props.tourIndex === activeTourIndex && activeGamePart === props.gamePart
                        ? <span>&#9654;</span>
                        : <span style={{color: 'transparent'}}>&#9654;</span>
                }
                <div className={classes.tourName}>
                    {
                        props.tourName || `Тур ${props.tourNumber}`
                    }
                </div>
            </div>
        );
    }

    const getGameName = () => {
        if ((gameName as string)?.length > 34) {
            return (gameName as string).substring(0, 35) + '\u2026';
        } else {
            return gameName;
        }
    }

    const parseTimer = (time: number) => {
        const minutes = Math.floor(time / 1000 / 60).toString().padStart(1, '0');
        const sec = Math.ceil(time / 1000 % 60).toString().padStart(2, '0');
        return `${minutes}:${sec}`;
    };

    const handleQuestionClick = (event: React.SyntheticEvent, gamePart: 'matrix' | 'chgk') => {
        const activeQuestion = document.querySelector(`.${classes.activeQuestion}`) as HTMLDivElement;
        const clickedQuestion = event.target as HTMLDivElement;
        if (activeQuestion) {
            activeQuestion.classList.remove(classes.activeQuestion);
        }
        clickedQuestion.classList.add(classes.activeQuestion);
        setActiveQuestion(+clickedQuestion.id);
        setActiveTour(clickedTourIndex || 0);
        setActiveGamePart(gamePart);
        setTimer(gamePart === 'chgk' ? 70000 : 20000);

        requester.changeQuestion(+clickedQuestion.id, clickedTourIndex || 0, gamePart);

        handleStopClick(gamePart); // Прошлый вопрос остановится!
    };

    const handlePlayClick = (gamePart: 'chgk' | 'matrix') => {
        if (playOrPause === 'play') {
            requester.startGame(gamePart);
            setIsStop(false);
            setPlayOrPause('pause');
            clearInterval(interval);
            interval = setInterval(() => requester.checkTime(), 1000);
        } else {
            clearInterval(interval);
            requester.pauseGame(gamePart);
            setPlayOrPause('play');
        }
    };

    const handleStopClick = (gamePart: 'matrix' | 'chgk' | undefined) => {
        setPlayOrPause('play');
        if (gamePart !== undefined) {
            requester.stopGame(gamePart);
        }
        setIsStop(true);
        clearInterval(interval);
        setTimer(gamePart === 'chgk' ? 70000 : 20000);
    };

    const handleAddedTimeClick = (gamePart: 'chgk' | 'matrix') => {
        requester.addTenSeconds(gamePart);
        setTimer(t => t + 10000);
    };

    const renderTours = (toursCount: number, gamePart: 'matrix' | 'chgk', tourNames?: string[]) => {
        if (!activeTourIndex || !clickedTourIndex) {
            return null;
        }

        //const startTourNumber = matrixSettings ? (gamePart === 'matrix' ? 0 : matrixSettings.roundCount) : 0;

        return Array.from(Array(toursCount).keys()).map(i => <Tour gamePart={gamePart} key={`tour_${i}_${gamePart}`}
                                                                   tourIndex={i + 1}
                                                                   tourNumber={i + 1} tourName={tourNames?.[i]}/>);
    };

    const renderQuestions = (questionsCount: number, gamePart: 'matrix' | 'chgk') => {
        if (!activeTourIndex || !clickedTourIndex || !questionsCount) {
            return null;
        }

        return Array.from(Array(questionsCount).keys()).map(i => {
            return (
                <div className={classes.questionWrapper} key={`tour_${activeTourIndex}_question_${i + 1}`}>
                    <div
                        className={`${classes.question} ${activeQuestionNumber !== undefined && i === activeQuestionNumber - 1 ? classes.activeQuestion : ''}`}
                        id={`${i + 1}`}
                        onClick={(event) => handleQuestionClick(event, gamePart)}>
                        Вопрос {i + 1}
                    </div>

                    <Link className={classes.answersButtonLink}
                          to={`/admin/game/${gameId}/${gamePart}/answers/${clickedTourIndex}/${i + 1}`}>
                        <button className={`${classes.button} ${classes.answersButton}`}>
                            Ответы
                            {
                                clickedGamePart === 'chgk' && isAppeal[(clickedTourIndex - 1) * questionsCount + i]
                                    ?
                                    <div className={classes.opposition}>
                                        <CircleOutlinedIcon sx={{
                                            fill: 'red',
                                            fontSize: '1.2vw',
                                            color: 'darkred',
                                            userSelect: 'none',
                                            pointerEvents: 'none'
                                        }}/>
                                    </div>
                                    : null
                            }
                        </button>
                    </Link>
                </div>
            );
        });
    };

    const openBreakModal = () => {
        setIsModalOpen(true);
    };

    const stopBreak = () => {
        setBreakTime(0);
        setIsBreak(false);
        clearInterval(breakInterval);
        requester.stopBreak();
    }

    if (isLoading || !gameName) {
        return <Loader/>;
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <Link to={`/admin/rating/${gameId}`} className={classes.menuLink}>Рейтинг</Link>

                <div className={classes.gameName}>
                    <p>{getGameName()}</p>
                </div>
            </Header>

            {
                isModalOpen
                    ? <Modal modalType='break' closeModal={setIsModalOpen} startBreak={setIsBreak}
                             setBreakTime={setBreakTime}/>
                    : null
            }

            <div className={classes.contentWrapper}>
                <div className={classes.buttonsWrapper}>
                    <button className={`${classes.button} ${classes.breakButton}`}
                            onClick={isBreak ? stopBreak : openBreakModal}>{isBreak ? 'Остановить перерыв' : 'Перерыв'}</button>

                    <button className={`${classes.button} ${classes.playButton}`} disabled={isBreak || activeQuestionNumber === undefined}
                            onClick={() => handlePlayClick(activeGamePart as 'chgk' | 'matrix')}>
                        {
                            playOrPause === 'play'
                                ? <PlayArrowIcon
                                    sx={{fontSize: '2.5vw', color: isBreak || activeQuestionNumber === undefined ? 'rgba(27, 38, 44, 0.5)' : 'black'}}/>
                                : <PauseIcon
                                    sx={{fontSize: '2.5vw', color: isBreak || activeQuestionNumber === undefined ? 'rgba(27, 38, 44, 0.5)' : 'black'}}/>
                        }
                    </button>

                    <button className={`${classes.button} ${classes.stopButton}`} disabled={isBreak || activeQuestionNumber === undefined}
                            onClick={() => handleStopClick(activeGamePart)}>
                        <StopIcon sx={{fontSize: '2.5vw', color: isBreak || activeQuestionNumber === undefined ? 'rgba(27, 38, 44, 0.5)' : 'black'}}/>
                    </button>

                    <button className={`${classes.button} ${classes.tenSecondsButton}`} disabled={isBreak || activeQuestionNumber === undefined}
                            onClick={() => handleAddedTimeClick(activeGamePart as 'chgk' | 'matrix')}>
                        + 10 сек.
                    </button>

                    <div className={classes.answerTime}>{parseTimer(timer)}</div>
                </div>

                <div className={classes.tablesWrapper}>
                    <div className={classes.toursWrapper}>
                        <Scrollbar>
                            {
                                matrixSettings
                                    ?
                                    <>
                                        <div className={classes.gamePartWrapper}>Матрица</div>
                                        {renderTours(matrixSettings.roundCount, 'matrix', matrixSettings.roundNames)}
                                    </>
                                    : null
                            }
                            {
                                chgkSettings
                                    ?
                                    <>
                                        <div className={classes.gamePartWrapper}>ЧГК</div>
                                        {renderTours(chgkSettings.roundCount, 'chgk')}
                                    </>
                                    : null
                            }
                        </Scrollbar>
                    </div>

                    <div className={classes.questionsWrapper}>
                        <Scrollbar>
                            {
                                clickedGamePart === 'matrix'
                                    ? renderQuestions(matrixSettings?.questionCount || 0, 'matrix')
                                    : null
                            }
                            {
                                clickedGamePart === 'chgk'
                                    ? renderQuestions(chgkSettings?.questionCount || 0, 'chgk')
                                    : null
                            }
                        </Scrollbar>
                    </div>
                </div>
                {
                    isBreak
                        ? <p className={classes.breakInformer}>Идет перерыв: <b>{parseTimer(breakTime * 1000)}</b></p>
                        : null
                }
            </div>
            <Snackbar sx={{marginTop: '8vh'}} open={isConnectionError}
                      anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
                <Alert severity='error' sx={{width: '100%'}}>
                    Ошибка соединения. Обновите страницу
                </Alert>
            </Snackbar>
        </PageWrapper>
    );
};

export default AdminGame;
