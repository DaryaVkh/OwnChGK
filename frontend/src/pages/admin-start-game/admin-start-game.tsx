import React, {FC, useEffect, useState} from 'react';
import classes from './admin-start-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Redirect, useParams} from 'react-router-dom';
import {changeToken, getGame, startGame} from '../../server-api/server-api';
import Header from '../../components/header/header';
import NavBar from '../../components/nav-bar/nav-bar';
import Loader from '../../components/loader/loader';

const StartGame: FC = () => {
    const [gameName, setGameName] = useState<string>();
    const {gameId} = useParams<{ gameId: string }>();
    const [isGameStart, setIsGameStart] = useState<boolean>(false);

    useEffect(() => {
        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({name, isStarted}) => {
                    setGameName(name);
                    if (isStarted) {
                        changeToken(gameId).then((res) => {
                            if (res.status === 200) {
                                setIsGameStart(true);
                            }
                        })
                    } else {
                        setIsGameStart(false);
                    }
                });
            }
        });
    }, []);

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

    if (!gameName) {
        return <Loader />;
    }

    return isGameStart ? <Redirect to={`/admin/game/${gameId}`}/> : (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <NavBar isAdmin={true} page=""/>
            </Header>

            <div className={classes.contentWrapper}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                <div className={classes.gameName}>{gameName}</div>

                <button className={classes.button} onClick={handleStart}>Запустить игру</button>
            </div>
        </PageWrapper>
    );
};

export default StartGame;