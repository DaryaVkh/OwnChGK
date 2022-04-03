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
            return (gameName as string).substr(0, 55) + '\u2026';
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

    const downloadResults = () => {
        getTeamsParticipantTable(gameId).then(res => {
            if (res.status === 200) {
                res.json().then(({participants}) => {
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=cp1251,' + encodeCP1251(participants));
                    element.setAttribute('download', `game-${gameId}-participants.csv`);

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                });
            }
        })
    }

    const encodeCP1251 = function (text: string) {
        function encodeChar(c: string) {
            const isKyr = function (str: string) {
                return /[а-я]/i.test(str);
            }
            const cp1251 = 'ЂЃ‚ѓ„…†‡€‰Љ‹ЊЌЋЏђ‘’“”•–—�™љ›њќћџ ЎўЈ¤Ґ¦§Ё©Є«¬*®Ї°±Ііґµ¶·\
ё№є»јЅѕїАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюя';
            const p = isKyr(c) ? (cp1251.indexOf(c) + 128) : c.charCodeAt(0);
            let h = p.toString(16);
            if (h == 'a') {
                h = '0A';
            }
            return '%' + h;
        }

        let res = '';
        for (let i = 0; i < text.length; i++) {
            console.log(text)
            res += encodeChar(text.charAt(i))
        }
        return res;
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