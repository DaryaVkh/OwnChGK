import React, {FC, useEffect, useState} from 'react';
import classes from './user-answers.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Link, useParams} from 'react-router-dom';
import Header from '../../components/header/header';
import {Answer, UserAnswersPageProps} from '../../entities/user-answers/user-answers.interfaces';
import UserAnswer from '../../components/user-answer/user-answer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import {getGame} from '../../server-api/server-api';
import {getCookie, getUrlForSocket} from '../../commonFunctions';
import Loader from '../../components/loader/loader';
import {AppState} from '../../entities/app/app.interfaces';
import {connect} from 'react-redux';
import MobileNavbar from '../../components/mobile-navbar/mobile-navbar';

let conn: WebSocket;
let ping: any;

const UserAnswersPage: FC<UserAnswersPageProps> = props => {
    const {gameId} = useParams<{ gameId: string }>();
    const [gameName, setGameName] = useState<string>();
    const [answers, setAnswers] = useState<{ [key: string]: Answer[] }>({matrix: [], chgk: []});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [gamePart, setGamePart] = useState<string>('matrix');
    const [isBothPartsInGame, setIsBothPartsInGame] = useState<boolean>(true);
    const [mediaMatch, setMediaMatch] = useState<MediaQueryList>(window.matchMedia('(max-width: 600px)'));

    const requester = {
        startRequests: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getTeamAnswers'
            }));

            ping = setInterval(() => {
                conn.send(JSON.stringify({
                    'action': 'ping'
                }));
            }, 30000);
        }
    };

    const handler = {
        handleTeamAnswersMessage: (answers: { answer: string; status: number; number: number }[]) => {
            // TODO починить
            // setAnswers(answers.map((ans: { answer: string; status: number; number: number}) => {
            //     return {
            //         answer: ans.answer,
            //         status: ans.status === 0 ? 'success' : (ans.status === 1 ? 'error' : 'opposition'),
            //         number: ans.number
            //     };
            // }));

            setIsLoading(false);
        }
    };

    useEffect(() => {
        const resizeEventHandler = () => {
            setMediaMatch(window.matchMedia('(max-width: 600px)'));
            handleWindowResize();
        };

        window.addEventListener('resize', resizeEventHandler);

        return () => {
            window.removeEventListener('resize', resizeEventHandler);
        };
    }, []);

    const handleWindowResize = () => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const el = document.querySelector(`.${classes['is-active']}`) as HTMLElement;
        if (el) {
            indicator.style.width = `${el.offsetWidth}px`;
            indicator.style.left = `${el.offsetLeft}px`;
            indicator.style.backgroundColor = 'white';
        }
    };

    const activateIndicator = () => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const activeItem = document.querySelector(`.${classes['is-active']}`) as HTMLElement;

        if (activeItem) {
            indicator.style.width = `${activeItem.offsetWidth}px`;
            indicator.style.left = `${activeItem.offsetLeft}px`;
            indicator.style.backgroundColor = 'white';
        }
    };

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

        activateIndicator();

        conn = new WebSocket(getUrlForSocket());

        conn.onopen = () => requester.startRequests();

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);
            switch (jsonMessage.action) {
                case 'teamAnswers':
                    handler.handleTeamAnswersMessage(jsonMessage.answers);
                    break;
            }
        };

        return () => clearInterval(ping);
    }, []);

    const getGameName = () => {
        const maxLength = mediaMatch.matches ? 22 : 34;
        if ((gameName as string)?.length > maxLength) {
            return (gameName as string).substring(0, maxLength + 1) + '\u2026';
        } else {
            return gameName;
        }
    };

    const getTeamName = () => {
        const teamName = props.userTeam;
        const maxLength = mediaMatch.matches ? 25 : 55;
        if ((teamName as string)?.length > maxLength) {
            return (teamName as string).substring(0, maxLength + 1) + '\u2026';
        } else {
            return teamName;
        }
    };

    const renderAnswers = () => {
        return answers[gamePart].sort((answer1, answer2) => answer1.number > answer2.number ? 1 : -1)
            .map((answer, index) => {
                return (
                    <UserAnswer key={`${answer.answer}_${index}`} answer={answer.answer} status={answer.status}
                                order={answer.number}/>
                );
            });
    };

    const handleIndicator = (e: React.SyntheticEvent) => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const items = document.querySelectorAll(`.${classes['nav-item']}`);
        const el = e.target as HTMLElement;

        items.forEach(function (item) {
            item.classList.remove(classes['is-active']);
            item.removeAttribute('style');
        });

        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.left = `${el.offsetLeft}px`;
        indicator.style.backgroundColor = 'white';

        el.classList.add(classes['is-active']);
        setGamePart((e.target as HTMLElement).id);
    };

    if (!gameName || isLoading) {
        return <Loader/>;
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
                            <Link to={`/game/${gameId}`} className={`${classes.menuLink} ${classes.toGameLink}`}>В
                                игру</Link>
                        </>
                        : null
                }

                <div className={classes.gameName}>
                    <p>{getGameName()}</p>
                </div>
            </Header>

            {
                mediaMatch.matches
                    ? <MobileNavbar isGame={true} isAdmin={false} page='' toGame={true} gameId={gameId}/>
                    : null
            }
            <div className={classes.contentWrapper}>
                <div className={classes.teamWrapper}>
                    <div className={classes.team}>Команда</div>
                    <div className={classes.teamName}>{getTeamName()}</div>
                </div>

                <div className={classes.answersWrapper}>
                    {
                        isBothPartsInGame
                            ?
                            <nav className={classes.nav}>
                                <div id='matrix'
                                     className={`${classes['nav-item']} ${gamePart === 'matrix' ? classes['is-active'] : ''}`}
                                     onClick={handleIndicator}>
                                    Матрица
                                </div>
                                <div id='chgk'
                                     className={`${classes['nav-item']} ${gamePart === 'chgk' ? classes['is-active'] : ''}`}
                                     onClick={handleIndicator}>
                                    ЧГК
                                </div>
                                <span className={`${classes['nav-indicator']}`} id='indicator'/>
                            </nav>
                            : null
                    }
                    <Scrollbar>
                        {renderAnswers()}
                    </Scrollbar>
                </div>
            </div>
        </PageWrapper>
    );
};

function mapStateToProps(state: AppState) {
    return {
        userTeam: state.appReducer.user.team
    };
}

export default connect(mapStateToProps)(UserAnswersPage);