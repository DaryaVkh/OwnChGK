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
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
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
        handleTeamAnswersMessage: (answers: { answer: string; status: number; number: number}[]) => {
            setAnswers(answers.map((ans: { answer: string; status: number; number: number}) => {
                return {
                    answer: ans.answer,
                    status: ans.status === 0 ? 'success' : (ans.status === 1 ? 'error' : 'opposition'),
                    number: ans.number
                };
            }));

            setIsLoading(false);
        }
    };

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
            return (gameName as string).substr(0, maxLength) + '\u2026';
        } else {
            return gameName;
        }
    }

    const renderAnswers = () => {
        return answers.sort((answer1, answer2) => answer1.number > answer2.number ? 1 : -1)
            .map((answer, index) => {
            return (
                <UserAnswer key={`${answer.answer}_${index}`} answer={answer.answer} status={answer.status} order={answer.number}/>
            );
        });
    };

    if (!gameName || isLoading) {
        return <Loader />;
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                {
                    !mediaMatch.matches
                        ?
                        <>
                            <Link to={`/rating/${gameId}`} className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                            <Link to={`/game/${gameId}`} className={`${classes.menuLink} ${classes.toGameLink}`}>В игру</Link>
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
                    <div className={classes.teamName}>{props.userTeam}</div>
                </div>

                <div className={classes.answersWrapper}>
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