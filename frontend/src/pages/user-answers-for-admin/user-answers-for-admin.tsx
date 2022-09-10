import React, {FC, useEffect, useState} from 'react';
import classes from './user-answers-for-admin.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Link, useParams} from 'react-router-dom';
import Header from '../../components/header/header';
import {Answer, UserAnswersPageProps} from '../../entities/user-answers/user-answers.interfaces';
import UserAnswer from '../../components/user-answer/user-answer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import {getGame, getTeam} from '../../server-api/server-api';
import {getCookie, getUrlForSocket} from '../../commonFunctions';
import Loader from '../../components/loader/loader';
import MobileNavbar from '../../components/mobile-navbar/mobile-navbar';

let conn: WebSocket;
let ping: any;

const UserAnswersPageForAdmin = () => {
    const {gameId} = useParams<{ gameId: string }>();
    const {teamId} = useParams<{ teamId: string }>();
    const [gameName, setGameName] = useState<string>();
    const [teamName, setTeamName] = useState<string>();
    const [answers, setAnswers] = useState<{ [key: string]: Answer[] }>({matrix: [], chgk: []});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [gamePart, setGamePart] = useState<'chgk' | 'matrix'>('matrix');
    const [isBothPartsInGame, setIsBothPartsInGame] = useState<boolean>();
    const [mediaMatch, setMediaMatch] = useState<MediaQueryList>(window.matchMedia('(max-width: 600px)'));

    const requester = {
        startRequests: () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getTeamAnswersForAdmin',
                'teamId': teamId
            }));

            ping = setInterval(() => {
                conn.send(JSON.stringify({
                    'action': 'ping'
                }));
            }, 30000);
        }
    };

    const handler = {
        handleTeamAnswersMessage: (chgkAnswers: { answer: string; status: number; number: number }[],
                                   matrixAnswers: { answer: string; status: number; number: number }[],
                                   chgkQuestionsCount: number,
                                   matrixQuestionsCount: number) => {
            let dictionary: { [key: string]: Answer[] };
            dictionary = {};
            if (matrixAnswers) {
                dictionary['matrix'] = matrixAnswers.map((ans: { answer: string; status: number; number: number; }) => {
                    return {
                        answer: ans.answer,
                        status: ans.status === 0 ? 'success' : (ans.status === 1 ? 'error' : 'opposition'),
                        number: ans.number
                    };
                });
                let numbers = dictionary['matrix'].map(ans => ans.number);
                for (let i = 1; i <= matrixQuestionsCount; i++) {
                    if (!numbers.includes(i)) {
                        dictionary['matrix'].push({ status: 'no-answer', number: i, answer: '' });
                    }
                }
            }

            if (chgkAnswers) {
                dictionary['chgk'] = chgkAnswers.map((ans: { answer: string; status: number; number: number; }) => {
                    return {
                        answer: ans.answer,
                        status: ans.status === 0 ? 'success' : (ans.status === 1 ? 'error' : 'opposition'),
                        number: ans.number
                    };
                });

                let numbers = dictionary['chgk'].map(ans => ans.number);
                for (let i = 1; i <= chgkQuestionsCount; i++) {
                    if (!numbers.includes(i)) {
                        dictionary['chgk'].push({ status: 'no-answer', number: i, answer: '' });
                    }
                }
            }
            setAnswers(dictionary);
        }
    };

    useEffect(() => {
        if (isBothPartsInGame) {
            activateIndicator();
        }
    }, [isBothPartsInGame]);

    useEffect(() => {
        const resizeEventHandler = () => {
            setMediaMatch(window.matchMedia('(max-width: 600px)'));
            activateIndicator();
        };

        mediaMatch.addEventListener('change', resizeEventHandler);

        return () => {
            mediaMatch.removeEventListener('change', resizeEventHandler);
        };
    }, []);

    useEffect(() => {
        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({
                                     name,
                                     chgkSettings,
                                     matrixSettings
                                 }) => {
                    setGameName(name);
                    setGamePart(matrixSettings ? "matrix": "chgk");
                    setIsBothPartsInGame(() => {
                        if (chgkSettings && matrixSettings) {
                            activateIndicator();
                        }
                        return chgkSettings && matrixSettings;
                    });
                });
            }
        });

        getTeam(teamId).then((res) => {
           if (res.status === 200) {
               res.json().then(({ name }) => {
                   setTeamName(name);
               })
           }
        });

        conn = new WebSocket(getUrlForSocket());

        conn.onopen = () => requester.startRequests();

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);
            switch (jsonMessage.action) {
                case 'teamAnswersForAdmin':
                    handler.handleTeamAnswersMessage(jsonMessage.chgkAnswers, jsonMessage.matrixAnswers,
                        jsonMessage.chgkQuestionsCount, jsonMessage.matrixQuestionsCount);
                    break;
            }
        };

        return () => clearInterval(ping);
    }, []);

    useEffect(() => {
        if (isLoading && gameName && teamName && answers && (answers['chgk'].length > 0 || answers['matrix'].length > 0)) {
            setIsLoading(false)
        }
    }, [gameName, teamName, answers])

    const activateIndicator = () => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const activeItem = document.querySelector(`.${classes['is-active']}`) as HTMLElement;

        if (activeItem) {
            indicator.style.width = `${activeItem.offsetWidth}px`;
            indicator.style.left = `${activeItem.offsetLeft}px`;
            indicator.style.backgroundColor = 'white';
        }
    };

    const getTeamName = () => {
        const maxLength = mediaMatch.matches ? 25 : 55;
        if ((teamName as string)?.length > maxLength) {
            return (teamName as string).substring(0, maxLength + 1) + '\u2026';
        }
        return teamName;
    };

    const renderAnswers = () => {
        return answers[gamePart]?.sort((answer1, answer2) => answer1.number > answer2.number ? 1 : -1)
            .map((answer, index) => {
                return (
                    <UserAnswer key={`${answer.answer}_${index}`} answer={answer.answer} status={answer.status}
                                order={answer.number} gamePart={gamePart} isAdmin={true} teamId={teamId}/>
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
        setGamePart((e.target as HTMLElement).id as 'chgk' | 'matrix');
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
                            <Link to={`/admin/rating/${gameId}`}
                                  className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                            <Link to={`/admin/game/${gameId}`} className={`${classes.menuLink} ${classes.toGameLink}`}>В
                                игру</Link>
                        </>
                        : null
                }

                <div className={classes.gameName}>
                    {gameName}
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

export default UserAnswersPageForAdmin;
