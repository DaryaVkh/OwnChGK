import React, {FC, useEffect, useState} from 'react';
import classes from './user-answers.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Link, useParams} from 'react-router-dom';
import Header from '../../components/header/header';
import {Answer, UserAnswersPageProps} from '../../entities/user-answers/user-answers.interfaces';
import UserAnswer from '../../components/user-answer/user-answer';
import Scrollbar from '../../components/scrollbar/scrollbar';
import {store} from '../../index';
import {getGame} from '../../server-api/server-api';
import {getCookie, getUrlForSocket} from '../../commonFunctions';

const UserAnswersPage: FC<UserAnswersPageProps> = () => {
    const [conn, setConn] = useState(new WebSocket(getUrlForSocket()));
    const {gameId} = useParams<{ gameId: string }>();
    const [gameName, setGameName] = useState<string>('');
    const [teamName, setTeamName] = useState<string>(store.getState().appReducer.user.team);
    const [answers, setAnswers] = useState<Answer[]>([]);

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

        conn.onopen = function () {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getTeamAnswers'
            }));
        };

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);
            if (jsonMessage.action === 'teamAnswers') {
                setAnswers(jsonMessage.answers.map((ans: { answer: string; status: number; number: number}) => {
                    return {
                        answer: ans.answer,
                        status: ans.status === 0 ? 'success' : (ans.status === 1 ? 'error' : 'opposition'),
                        number: ans.number
                    };
                }));
            }
        };
    }, []);

    const renderAnswers = () => {
        return answers.sort((answer1, answer2) => answer1.number > answer2.number ? 1 : -1)
            .map((answer, index) => {
            return (
                <UserAnswer key={`${answer.answer}_${index}`} answer={answer.answer} status={answer.status}
                            order={answer.number}/>
            );
        });
    };

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <Link to="#" className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                <Link to={`/game/${gameId}`} className={`${classes.menuLink} ${classes.toGameLink}`}>В
                    игру</Link> {/* TODO тут написать нормальный урлик, потому что я не помню, какой нормальный*/}

                <div className={classes.gameName}>{gameName}</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.teamWrapper}>
                    <div className={classes.team}>Команда</div>
                    <div className={classes.teamName}>{teamName}</div>
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

export default UserAnswersPage;