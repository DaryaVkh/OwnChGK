import React, {FC, useEffect, useState} from 'react';
import classes from './user-start-screen.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import NavBar from "../../components/nav-bar/nav-bar";
import Header from "../../components/header/header";
import {UserStartScreenProps} from "../../entities/user-start-screen/user-start-screen.interfaces";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import {Link, Redirect} from 'react-router-dom';
import {IconButton} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import {
    editTeamCaptainByCurrentUser,
    getAmIParticipateGames,
    getTeamByCurrentUser,
    getTeamsWithoutUser
} from '../../server-api/server-api';
import {Game, Team} from '../admin-start-screen/admin-start-screen';
import Scrollbar from "../../components/scrollbar/scrollbar";

const UserStartScreen: FC<UserStartScreenProps> = () => {
    const [page, setPage] = useState('teams');
    const [gamesFromDB, setGamesFromDB] = useState<Game[]>([]);
    const [teamsFromDB, setTeamsFromDB] = useState<Team[]>([]);
    const [userTeam, setUserTeam] = useState('');
    const [gameId, setGameId] = useState('');

    useEffect(() => {
        getTeamByCurrentUser().then(res => {
            if (res.status === 200) {
                res.json().then(({name, id}) => {
                    if (name !== undefined) {
                        setUserTeam(name);
                        setTeamsFromDB([{name, id}]);
                    } else {
                        getTeamsWithoutUser().then(res => {
                            if (res.status === 200) {
                                res.json().then(({teams}) => {
                                    setTeamsFromDB(teams);
                                });
                            } else {
                                // TODO: код не 200, мейби всплывашку, что что-то не так?
                            }
                        })
                    }
                })
            }
        })

        getAmIParticipateGames().then(res => { // TODO: игры, в которых я состою
            if (res.status === 200) {
                res.json().then(({games}) => {
                    setGamesFromDB(games);
                });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });
    }, []);

    const handleChooseTeam = (event: React.SyntheticEvent) => {
        if (userTeam === '') {
            setUserTeam((event.currentTarget as HTMLDivElement).innerText);
            editTeamCaptainByCurrentUser((event.currentTarget as HTMLDivElement).innerText)
                .then(res => {
                    // TODO: код не 200, что делать?
                });
            //TODO установили, отрисовали и отправляем в бд, что этот юзер теперь капитан этой команды
        }
    }

    const handleClick = (id: string) => {
        setPage('');
        fetch(`/users/${id}/changeToken`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json'
            }
        }).then((res) => {
            if (res.status === 200) {
                // setGameId(id); // TODO начинать начатую игру (setGameId(id)), ставить заглушку перед не начатой (setPage(''))
            }
        });
    }

    const renderGames = () => {
        return gamesFromDB.map((game, index) =>
            <div key={index} className={classes.gameOrTeam} onClick={() => handleClick(game.id)}>{game.name}</div>);
    }

    const renderTeams = () => {
        return userTeam !== ''
            ?
            <div key={userTeam} className={classes.gameOrTeam}>
                {userTeam}

                <CheckCircleOutlinedIcon color='success' sx={{fontSize: '1.5vw', cursor: 'default'}} />
            </div>
            :
            teamsFromDB.map((team, index) => <div key={index} className={classes.gameOrTeam} onClick={handleChooseTeam}>{team.name}</div>);
    }

    const renderPage = (page: string) => {
        switch (page) {
            case 'games':
                return (
                    <div className={classes.contentWrapper}>
                        <div className={classes.contentBox}>
                            <Scrollbar>
                                {renderGames()}
                            </Scrollbar>
                        </div>
                    </div>
                );
            case 'teams':
                return (
                    <div className={classes.contentWrapper}>
                            <div className={classes.box}>
                                <p className={classes.teamParagraph}>Выбери команду из списка или создай новую</p>

                                <div className={classes.contentBox} style={{height: '92%', padding: '5vh 0.5vw 3vh 2vw'}}>
                                    <div className={classes.teamsWrapper}>
                                        <Scrollbar>
                                            {renderTeams()}
                                        </Scrollbar>
                                    </div>

                                    <div className={classes.addButtonWrapper}>
                                        <Link to='/team-creation' style={{ pointerEvents: userTeam !== '' ? 'none' : 'auto' }}>
                                            <IconButton disabled={userTeam !== ''} sx={{padding: '13px'}}>
                                                <AddCircleOutlineOutlinedIcon sx={{
                                                    color: userTeam === '' ? 'white' : 'gray',
                                                    fontSize: '9vmin'
                                                }} />
                                            </IconButton>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                    </div>
                );
            case '':
                return (
                    <div className={classes.gameStartContentWrapper}>
                        <img className={classes.logo} src={require('../../images/Logo.svg').default} alt="logo"/>

                        <div className={classes.pageText}>Игра скоро начнется</div>
                        <div className={classes.pageText}>Подождите</div>
                    </div>
                );
        }
    }

    if (gameId) {
        return <Redirect to={`/game/${gameId}`}/>
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <NavBar isAdmin={false} page={page} onLinkChange={setPage}/>
            </Header>

            { renderPage(page) }
        </PageWrapper>
    );
}

export default UserStartScreen;