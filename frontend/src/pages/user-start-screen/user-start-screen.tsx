import React, {FC, useEffect, useState} from 'react';
import classes from './user-start-screen.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import NavBar from '../../components/nav-bar/nav-bar';
import Header from '../../components/header/header';
import {UserStartScreenProps} from '../../entities/user-start-screen/user-start-screen.interfaces';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import {Link, Redirect, useLocation} from 'react-router-dom';
import {IconButton, Skeleton} from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import {
    changeToken,
    editTeamCaptainByCurrentUser,
    getAmIParticipateGames,
    getTeamByCurrentUser,
    getTeamsWithoutUser
} from '../../server-api/server-api';
import {Game, Team} from '../admin-start-screen/admin-start-screen';
import Scrollbar from '../../components/scrollbar/scrollbar';

const UserStartScreen: FC<UserStartScreenProps> = () => {
    const [page, setPage] = useState<string>('teams');
    const [gamesFromDB, setGamesFromDB] = useState<Game[]>();
    const [teamsFromDB, setTeamsFromDB] = useState<Team[]>();
    const [userTeam, setUserTeam] = useState<string>('');
    const [gameId, setGameId] = useState<string>('');
    let location = useLocation<{ page: string }>();

    useEffect(() => {
        if (location.state !== undefined) {
            setPage(location.state.page);
        }
    }, [location]);

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
                                    setTeamsFromDB(teams.sort((team1: Team, team2: Team) => team1.name > team2.name ? 1 : -1));
                                });
                            } else {
                                // TODO: код не 200, мейби всплывашку, что что-то не так?
                            }
                        });
                    }
                });
            }
        });

        getAmIParticipateGames().then(res => { // TODO: игры, в которых я состою
            if (res.status === 200) {
                res.json().then(({games}) => {
                    setGamesFromDB(games.sort((game1: Game, game2: Game) => game1.name > game2.name ? 1 : -1));
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
    };

    const handleClick = (id: string) => {
        changeToken(id).then((res) => {
            if (res.status === 200) {
                setGameId(id);
            }
        });
    };

    const renderGames = () => {
        if (!gamesFromDB) {
            return Array.from(Array(5).keys()).map(i => <Skeleton key={`game_skeleton_${i}`} variant='rectangular' width='100%' height='7vh' sx={{marginBottom: '2.5vh'}} />);
        }
        return gamesFromDB.map((game, index) =>
            <div key={index} className={classes.gameOrTeam} onClick={() => handleClick(game.id)}>{game.name}</div>);
    };

    const renderTeams = () => {
        if (!teamsFromDB) {
            return Array.from(Array(5).keys()).map(i => <Skeleton key={`team_skeleton_${i}`} variant='rectangular' width='100%' height='7vh' sx={{marginBottom: '2.5vh'}} />);
        }
        return userTeam !== ''
            ?
            <div key={userTeam} className={classes.gameOrTeam}>
                {userTeam}

                <CheckCircleOutlinedIcon color="success" sx={{fontSize: '1.5vw', cursor: 'default'}}/>
            </div>
            :
            teamsFromDB.map((team, index) => <div key={index} className={classes.gameOrTeam}
                                                  onClick={handleChooseTeam}>{team.name}</div>);
    };

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
                                    <Link to="/team-creation"
                                          style={{pointerEvents: userTeam !== '' ? 'none' : 'auto'}}>
                                        <IconButton disabled={userTeam !== ''} sx={{padding: '13px'}}>
                                            <AddCircleOutlineOutlinedIcon sx={{
                                                color: userTeam === '' ? 'white' : 'gray',
                                                fontSize: '9vmin'
                                            }}/>
                                        </IconButton>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    if (gameId) {
        return <Redirect to={`/game/${gameId}`}/>;
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <NavBar isAdmin={false} page={location.state !== undefined ? location.state.page : page} onLinkChange={setPage}/>
            </Header>

            {renderPage(page)}
        </PageWrapper>
    );
};

export default UserStartScreen;