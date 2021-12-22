import React, {FC, useEffect, useState} from 'react';
import classes from './admin-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {Link, useParams} from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {Scrollbars} from 'rc-scrollbars';
import {AdminGameProps} from '../../entities/admin-game/admin-game.interfaces';
import PauseIcon from '@mui/icons-material/Pause';
import CircleOutlinedIcon from '@mui/icons-material/Circle';
import {getGame} from '../../server-api/server-api';

let isOpposition = false;

const AdminGame: FC<AdminGameProps> = props => {
    const [playOrPause, setPlayOrPause] = useState<'play' | 'pause'>('play');
    const [activeTour, setActiveTour] = useState<number>(1);
    const [activeQuestion, setActiveQuestion] = useState<number>(1);
    const [toursCount, setToursCount] = useState(0);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [gameName, setGameName] = useState('');
    const {gameId} = useParams<{ gameId: string }>();
    //TODO по имени игры, которая приходит в пропсе, достать из бд количество туров и вопросов
    //TODO дописать уже какую-то игровую логику

    useEffect(() => {
        fetch(`/users/${gameId}/changeToken`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json'
            }
        });

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
                })
            }
        })
    }, []);

    const conn = new WebSocket('ws://localhost:80/'); //Todo: порт указать
    conn.onopen = function () {
        conn.send(JSON.stringify({
            'cookie': getCookie("authorization"),
            'action': 'time'
        }));
    };

    conn.onmessage = function (event) {
        const jsonMessage = JSON.parse(event.data);
        if (jsonMessage.action === 'time')
        {
            let time = jsonMessage.time;
            console.log(+time);
        }
    };
    const getCookie = (name: string) => {
        let matches = document.cookie.match(new RegExp(
            '(?:^|; )' + name.replace(/([$?*|{}\[\]\\\/^])/g, '\\$1') + '=([^;]*)'
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    const handleTourClick = (event: React.SyntheticEvent) => {
        const activeTour = document.querySelector(`.${classes.activeTour}`) as HTMLDivElement;
        const clickedTour = event.target as HTMLDivElement;
        activeTour.classList.remove(classes.activeTour);
        clickedTour.classList.add(classes.activeTour);
        setActiveTour(+clickedTour.id);
    }

    const handleQuestionClick = (event: React.SyntheticEvent) => {
        const activeQuestion = document.querySelector(`.${classes.activeQuestion}`) as HTMLDivElement;
        const clickedQuestion = event.target as HTMLDivElement;
        activeQuestion.classList.remove(classes.activeQuestion);
        clickedQuestion.classList.add(classes.activeQuestion);
        setActiveQuestion(+clickedQuestion.id);
    }

    const handlePlayClick = () => {
        //TODO тут стопим или запускаем таймер текущего вопроса
        if (playOrPause === 'play') {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Start',
                'question': [activeTour, activeQuestion]
            }));
            setPlayOrPause('pause');
        } else {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'Pause'
            }));
            setPlayOrPause('play');
        }
    }

    const handleStopClick = () => {
        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'Stop'
        }));
    }

    const handleAddedTimeClick = () => {
        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': '+10sec'
        }));
    }

    const renderTours = () => {
        return Array.from(Array(toursCount).keys()).map(i => {
            return <div className={`${classes.tour} ${i === 0 ? classes.activeTour : ''}`} id={`${i + 1}`}
                        onClick={handleTourClick} key={`tour_${i + 1}`}>Тур {i + 1}</div>;
        });
    }

    const renderQuestions = () => {
        return Array.from(Array(questionsCount).keys()).map(i => {
            return (
                <div className={classes.questionWrapper} key={`tour_${activeTour}_question_${i + 1}`}>
                    <div className={`${classes.question} ${i === 0 ? classes.activeQuestion : ''}`} id={`${i + 1}`}
                         onClick={handleQuestionClick}>
                        Вопрос {i + 1}
                    </div>

                    <Link className={classes.answersButtonLink} to={`/answers/${activeTour}/${i + 1}`}>
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
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <Link to="/admin/game" className={classes.menuLink}>Рейтинг</Link>

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

                    <div className={classes.answerTime}>1:10</div>
                </div>

                <div className={classes.tablesWrapper}>
                    <div className={classes.toursWrapper}>
                        <Scrollbars className={classes.scrollbar} autoHide autoHideTimeout={500}
                                    autoHideDuration={200}
                                    renderThumbVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                    renderTrackVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                    classes={{view: classes.scrollbarView}}>

                            {renderTours()}
                        </Scrollbars>
                    </div>

                    <div className={classes.questionsWrapper}>
                        <Scrollbars className={classes.scrollbar} autoHide autoHideTimeout={500}
                                    autoHideDuration={200}
                                    renderThumbVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                    renderTrackVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                    classes={{view: classes.scrollbarView}}>

                            {renderQuestions()}
                        </Scrollbars>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}

export default AdminGame;