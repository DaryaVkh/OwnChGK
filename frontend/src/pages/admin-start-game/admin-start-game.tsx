import React, {FC, useEffect, useState} from 'react';
import classes from './admin-start-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Redirect, useParams} from 'react-router-dom';
import {
    changeToken,
    getGame,
    getTeamsParticipantTable,
    startGame
} from '../../server-api/server-api';
import Header from '../../components/header/header';
import NavBar from '../../components/nav-bar/nav-bar';
import Loader from '../../components/loader/loader';
import {createFileLink} from "../../fileWorker";

const StartGame: FC = () => {
    const [gameName, setGameName] = useState<string>();
    const {gameId} = useParams<{ gameId: string }>();
    const [isGameStart, setIsGameStart] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({name, isStarted}) => {
                    setGameName(name);
                    if (isStarted) {
                        changeToken(gameId).then((res) => {
                            if (res.status === 200) {
                                setIsGameStart(true);
                                setIsLoading(false);
                            }
                        })
                    } else {
                        setIsGameStart(false);
                        setIsLoading(false);
                    }
                });
            }
        });
    }, []);

    const getGameName = () => {
        if ((gameName as string).length > 55) {
            return (gameName as string).slice(0, 55) + '\u2026';
        } else {
            return gameName;
        }
    }

    const handleStart = async () => {
        startGame(gameId).then((res) => {
                if (res.status === 200) {
                    changeToken(gameId).then((res) => {
                        if (res.status === 200) {
                            setIsGameStart(true);
                        }
                    });
                }
            });
    };

    const downloadResults = async () => {
        getTeamsParticipantTable(gameId).then(res => {
            if (res.status === 200) {
                res.json().then(({participants}) => {
                    createFileLink(participants, `game-${gameId}-participants.csv`);
                });
            }
        })
    }

    if (isLoading) {
        return <Loader />;
    }

    return isGameStart ? <Redirect to={`/admin/game/${gameId}`}/> : (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <NavBar isAdmin={true} page=""/>
            </Header>

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                <div className={classes.gameName}>{getGameName()}</div>

                <button className={classes.button} onClick={downloadResults}>Скачать список команд</button>

                <button className={classes.button} onClick={handleStart}>Запустить игру</button>
            </div>
        </PageWrapper>
    );
};

export default StartGame;