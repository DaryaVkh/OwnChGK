import React, {FC, useState} from 'react';
import classes from './admin-game.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import Header from "../../components/header/header";
import {Link} from "react-router-dom";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import {Scrollbars} from "rc-scrollbars";
import {AdminGameProps} from "../../entities/admin-game/admin-game.interfaces";
import PauseIcon from '@mui/icons-material/Pause';
import CircleOutlinedIcon from '@mui/icons-material/Circle';

let toursCount = 3;
let questionsCount = 10;
let isOpposition = false;

const AdminGame: FC<AdminGameProps> = props => {
    const [playOrPause, setPlayOrPause] = useState<'play' | 'pause'>('play');
    //TODO по имени игры, которая приходит в пропсе, достать из бд количество туров и вопросов
    //TODO дописать уже какую-то игровую логику

    const handleTourClick = (event: React.SyntheticEvent) => {
        const activeTour = document.querySelector(`.${classes.activeTour}`) as HTMLDivElement;
        const clickedTour = event.target as HTMLDivElement;
        activeTour.classList.remove(classes.activeTour);
        clickedTour.classList.add(classes.activeTour);
    }

    const handleQuestionClick = (event: React.SyntheticEvent) => {
        const activeQuestion = document.querySelector(`.${classes.activeQuestion}`) as HTMLDivElement;
        const clickedQuestion = event.target as HTMLDivElement;
        activeQuestion.classList.remove(classes.activeQuestion);
        clickedQuestion.classList.add(classes.activeQuestion);
    }

    const handlePlayClick = (event: React.SyntheticEvent) => {
        //TODO тут стопим или запускаем таймер текущего вопроса
        if (playOrPause === 'play') {
            setPlayOrPause('pause');
        } else {
            setPlayOrPause('play');
        }
    }

    const renderTours = () => {
        return Array.from(Array(toursCount).keys()).map(i => {
            return <div className={`${classes.tour} ${i === 0 ? classes.activeTour : ''}`} onClick={handleTourClick} key={i}>Тур {i + 1}</div>;
        });
    }

    const renderQuestions = () => {
        return Array.from(Array(questionsCount).keys()).map(i => {
            return (
                <div className={classes.questionWrapper}>
                    <div className={`${classes.question} ${i === 0 ? classes.activeQuestion : ''}`} onClick={handleQuestionClick} key={i}>
                        Вопрос {i + 1}
                    </div>

                    <button className={`${classes.button} ${classes.answersButton}`} key={i}>
                        Ответы
                        {
                            isOpposition
                                ?
                                <div className={classes.opposition}>
                                    <CircleOutlinedIcon sx={{fill: 'red', fontSize: '1.2vw', color: 'darkred', userSelect: 'none', pointerEvents: 'none'}} />
                                </div>
                                : null
                        }
                    </button>
                </div>
            );
        });
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <Link to='/admin/game' className={classes.menuLink}>Рейтинг</Link>

                <div className={classes.gameName}>{props.gameName}</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.buttonsWrapper}>
                    <button className={`${classes.button} ${classes.breakButton}`}>Перерыв</button>

                    <button className={`${classes.button} ${classes.playButton}`} onClick={handlePlayClick}>
                        {playOrPause === 'play'
                            ? <PlayArrowIcon sx={{fontSize: '2.5vw', color: 'black'}} />
                            : <PauseIcon sx={{fontSize: '2.5vw', color: 'black'}} />
                        }
                    </button>

                    <button className={`${classes.button} ${classes.stopButton}`}>
                        <StopIcon sx={{fontSize: '2.5vw', color: 'black'}} />
                    </button>

                    <button className={`${classes.button} ${classes.tenSecondsButton}`}>+ 10 сек.</button>

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