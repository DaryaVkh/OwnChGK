import React, {FC, useEffect, useState} from 'react';
import classes from './admin-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {Link, useParams} from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {AdminGameProps} from '../../entities/admin-game/admin-game.interfaces';
import PauseIcon from '@mui/icons-material/Pause';
import CircleOutlinedIcon from '@mui/icons-material/Circle';
import {getGame} from '../../server-api/server-api';
import Scrollbar from '../../components/scrollbar/scrollbar';
import {getCookie} from '../../commonFunctions';

let isOpposition = false;
let interval: any;

const AdminGame: FC<AdminGameProps> = props => {
    const [playOrPause, setPlayOrPause] = useState<'play' | 'pause'>('play');
    const [activeTourNumber, setActiveTour] = useState<number>(1);
    const [activeQuestionNumber, setActiveQuestion] = useState<number>(1);
    const [toursCount, setToursCount] = useState(0);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [gameName, setGameName] = useState('');
    const {gameId} = useParams<{ gameId: string }>();
    const [conn, setConn] = useState(new WebSocket('ws://localhost:80/'));
    const [timer, setTimer] = useState(70000);
    //TODO по имени игры, которая приходит в пропсе, достать из бд количество туров и вопросов
    //TODO дописать уже какую-то игровую логику

    useEffect(() => {
        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({
                                     name,
                                     roundCount,
                                     questionCount
                                 }) => {
                    setGameName(name);
                    setToursCount(roundCount);
                    setQuestionsCount(questionCount);
                });
            }
        });

        conn.onopen = function () {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'time'
            }));
        };

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);
            if (jsonMessage.action === 'time') {
                console.log(jsonMessage.time);
                setTimer(jsonMessage.time);
                if (jsonMessage.isStarted) {
                    setPlayOrPause('pause');
                    interval = setInterval(() => setTimer(t => {
                        let res = t - 1000;
                        if (res <= 0) {
                            clearInterval(interval);
                            setPlayOrPause('play');
                        }
                        return res > 0 ? res : 0;
                    }), 1000);
                }
            }
        };
    }, []);

    const parseTimer = () => {
        const minutes = Math.floor(timer / 1000 / 60).toString().padStart(1, '0');
        const sec = Math.ceil(timer / 1000 % 60).toString().padStart(2, '0');
        return `${minutes}:${sec}`;
    };

    const handleTourClick = (event: React.SyntheticEvent) => {
        const activeTour = document.querySelector(`.${classes.activeTour}`) as HTMLDivElement;
        const clickedTour = event.target as HTMLDivElement;
        activeTour.classList.remove(classes.activeTour);
        clickedTour.classList.add(classes.activeTour);
        setActiveTour(+clickedTour.id);

        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'changeQuestion',
            'questionNumber': 1,
            'tourNumber': +clickedTour.id,
        }));

        handleStopClick();
    };

    const handleQuestionClick = (event: React.SyntheticEvent) => {
        const activeQuestion = document.querySelector(`.${classes.activeQuestion}`) as HTMLDivElement;
        const clickedQuestion = event.target as HTMLDivElement;
        activeQuestion.classList.remove(classes.activeQuestion);
        clickedQuestion.classList.add(classes.activeQuestion);
        setActiveQuestion(+clickedQuestion.id);

        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'changeQuestion',
            'questionNumber': +clickedQuestion.id,
            'tourNumber': activeTourNumber,
        }));

        handleStopClick();
    };

    const handlePlayClick = () => {
        if (playOrPause === 'play') {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Start',
                'question': [activeTourNumber, activeQuestionNumber]
            }));
            setPlayOrPause('pause');
            interval = setInterval(() =>
                setTimer(t => {
                    let res = t - 1000;
                    if (res <= 0) {
                        clearInterval(interval);
                        setPlayOrPause('play');
                    }
                    return res > 0 ? res : 0;
                }), 1000);
        } else {
            clearInterval(interval);
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Pause'
            }));
            setPlayOrPause('play');
        }
    };

    const handleStopClick = () => {
        setPlayOrPause('play');
        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'Stop'
        }));
        clearInterval(interval);
        setTimer(70000);
    };

    const handleAddedTimeClick = () => {
        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': '+10sec'
        }));
        setTimer(t => t + 10000);
    };

    const renderTours = () => {
        return Array.from(Array(toursCount).keys()).map(i => {
            return <div className={`${classes.tour} ${i === 0 ? classes.activeTour : ''}`} id={`${i + 1}`}
                        onClick={handleTourClick} key={`tour_${i + 1}`}>Тур {i + 1}</div>;
        });
    };

    const renderQuestions = () => {
        return Array.from(Array(questionsCount).keys()).map(i => {
            return (
                <div className={classes.questionWrapper} key={`tour_${activeTourNumber}_question_${i + 1}`}>
                    <div className={`${classes.question} ${i === 0 ? classes.activeQuestion : ''}`} id={`${i + 1}`}
                         onClick={handleQuestionClick}>
                        Вопрос {i + 1}
                    </div>

                    <Link className={classes.answersButtonLink}
                          to={`/admin/game/${gameId}/answers/${activeTourNumber}/${i + 1}`}>
                        <button className={`${classes.button} ${classes.answersButton}`}>
                            Ответы
                            {
                                isOpposition
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

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <Link to={`admin/game/:${gameId}`} className={classes.menuLink}>Рейтинг</Link>

                <div className={classes.gameName}>{gameName}</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.buttonsWrapper}>
                    <button className={`${classes.button} ${classes.breakButton}`}>Перерыв</button>

                    <button className={`${classes.button} ${classes.playButton}`} onClick={handlePlayClick}>
                        {playOrPause === 'play'
                            ? <PlayArrowIcon sx={{fontSize: '2.5vw', color: 'black'}}/>
                            : <PauseIcon sx={{fontSize: '2.5vw', color: 'black'}}/>
                        }
                    </button>

                    <button className={`${classes.button} ${classes.stopButton}`} onClick={handleStopClick}>
                        <StopIcon sx={{fontSize: '2.5vw', color: 'black'}}/>
                    </button>

                    <button className={`${classes.button} ${classes.tenSecondsButton}`} onClick={handleAddedTimeClick}>+
                        10 сек.
                    </button>

                    <div className={classes.answerTime}>{parseTimer()}</div>
                </div>

                <div className={classes.tablesWrapper}>
                    <div className={classes.toursWrapper}>
                        <Scrollbar>
                            {renderTours()}
                        </Scrollbar>
                    </div>

                    <div className={classes.questionsWrapper}>
                        <Scrollbar>
                            {renderQuestions()}
                        </Scrollbar>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default AdminGame;