import React, {FC, useEffect, useState} from 'react';
import classes from './admin-start-game.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Redirect, useParams} from 'react-router-dom';
import {getGame} from '../../server-api/server-api';
import Header from '../../components/header/header';
import NavBar from '../../components/nav-bar/nav-bar';

const StartGame: FC = () => {
    const [gameName, setGameName] = useState('');
    const {gameId} = useParams<{ gameId: string }>();
    const [isGameStart, setIsGameStart] = useState(false);

    useEffect(() => {
        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({name}) => {
                    setGameName(name);
                });
            }
        });
    }, []);

    const handleStart = async () => {
        fetch(`/games/${gameId}/start`)
            .then((res) => {
                if (res.status === 200) {
                    fetch(`/users/${gameId}/changeToken`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                            'Accept': 'application/json'
                        }
                    }).then((res) => {
                        if (res.status === 200) {
                            setIsGameStart(true);
                        }
                    });
                }
            });
    };

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