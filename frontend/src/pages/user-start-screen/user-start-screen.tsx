import React, {FC, useEffect, useState} from 'react';
import classes from './user-start-screen.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import NavBar from '../../components/nav-bar/nav-bar';
import Header from '../../components/header/header';
import {
    UserStartScreenDispatchProps,
    UserStartScreenProps
} from '../../entities/user-start-screen/user-start-screen.interfaces';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import {Link, Redirect, useLocation} from 'react-router-dom';
import {Alert, IconButton, Skeleton, Snackbar} from '@mui/material';
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
import {Dispatch} from 'redux';
import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';
import {addUserTeam} from '../../redux/actions/app-actions/app-actions';
import {connect} from 'react-redux';
import MobileNavbar from '../../components/mobile-navbar/mobile-navbar';
import Loader from "../../components/loader/loader";

const UserStartScreen: FC<UserStartScreenProps> = props => {
    const [page, setPage] = useState<string>('teams');
    const [gamesFromDB, setGamesFromDB] = useState<Game[]>();
    const [teamsFromDB, setTeamsFromDB] = useState<Team[]>();
    const [userTeam, setUserTeam] = useState<string>('');
    const [gameId, setGameId] = useState<string>('');
    const [isTeamNotFree, setIsTeamNotFree] = useState<boolean>(false);
    const [numberLoading, setNumberLoading] = useState<number>(0);
    let location = useLocation<{ page: string }>();
    const mediaMatch = window.matchMedia('(max-width: 768px)');

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
                        setNumberLoading(prev => Math.min(prev + 1, 2));
                    } else {
                        getTeamsWithoutUser().then(res => {
                            if (res.status === 200) {
                                res.json().then(({teams}) => {
                                    setTeamsFromDB(teams.sort((team1: Team, team2: Team) => team1.name.toLowerCase() > team2.name.toLowerCase() ? 1 : -1));
                                    setNumberLoading(prev => Math.min(prev + 1, 2));
                                });
                            } else {
                                // TODO: код не 200, мейби всплывашку, что что-то не так?
                            }
                        });
                    }
                });
            }
        });

        getAmIParticipateGames().then(res => {
            if (res.status === 200) {
                res.json().then(({games}) => {
                    setGamesFromDB(games.sort((game1: Game, game2: Game) => game1.name.toLowerCase() > game2.name.toLowerCase() ? 1 : -1));
                    setNumberLoading(prev => Math.min(prev + 1, 2));
                });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });
    }, []);

    const handleChooseTeam = (event: React.SyntheticEvent) => {
        if (userTeam === '') {
            const element = event.currentTarget as HTMLDivElement;
            const dataset = element.dataset as {teamName: string, teamId: string};
            editTeamCaptainByCurrentUser(dataset.teamId)
                .then(res => {
                    if (res.status === 200) {
                        setUserTeam(dataset.teamName);
                        setIsTeamNotFree(false);
                        props.onAddUserTeam(dataset.teamName);
                    } else {
                        setTeamsFromDB(arr => arr?.filter(x => x.id != dataset.teamId));
                        setIsTeamNotFree(true);
                        setTimeout(() => setIsTeamNotFree(false), 5000);
                    }
                });
        }
    };

    const handleClickOnGame = (id: string) => {
        changeToken(id).then((res) => {
            if (res.status === 200) {
                setGameId(id);
            }
        });
    };

    const renderGames = () => {
        if (!gamesFromDB) {
            return Array.from(Array(5).keys()).map(i => <Skeleton key={`game_skeleton_${i}`} variant='rectangular' width='100%' height={mediaMatch.matches ? '5vh' : '7vh'} sx={{marginBottom: '2.5vh'}} />);
        }
        return gamesFromDB.map((game, index) =>
            <div key={index} className={classes.gameOrTeam} onClick={() => handleClickOnGame(game.id)}>
                <p className={classes.gameName}>{game.name}</p>
            </div>);
    };

    const renderTeams = () => {
        if (!teamsFromDB) {
            return Array.from(Array(5).keys()).map(i => <Skeleton key={`team_skeleton_${i}`} variant='rectangular' width='100%' height={mediaMatch.matches ? '5vh' : '7vh'} sx={{marginBottom: '2.5vh'}} />);
        }
        return userTeam !== ''
            ?
            <div key={userTeam} className={classes.gameOrTeam} style={{cursor: 'default'}}>
                <div className={classes.userTeamNameWrapper}>
                    <p className={classes.teamName}>{userTeam}</p>
                </div>

                <div className={classes.selectedIconWrapper}>
                    <CheckCircleOutlinedIcon color="success" sx={{fontSize: mediaMatch.matches ? '3vmax' : '1.5vw', cursor: 'default'}}/>
                </div>
            </div>
            :
            teamsFromDB.map((team, index) =>
                <div key={index} data-team-id={team.id} data-team-name={team.name} className={classes.gameOrTeam} onClick={handleChooseTeam}>
                    <div className={classes.teamNameWrapper}>
                        <p className={classes.teamName}>{team.name}</p>
                    </div>
                </div>);
    };

    const renderPage = (page: string) => {
        switch (page) {
            case 'games':
                return (
                    <div className={classes.contentWrapper}>
                        <div className={classes.contentBox} style={{padding: mediaMatch.matches ? '3vh 9vw' : '5vh 0.5vw 5vh 2vw'}}>
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

                            <div className={classes.contentBox} style={{height: '92%', padding: mediaMatch.matches ? '3vh 9vw 0.5vh' : '5vh 0.5vw 3vh 2vw'}}>
                                <div className={classes.teamsWrapper}>
                                    <Scrollbar>
                                        {renderTeams()}
                                    </Scrollbar>
                                </div>

                                <div className={classes.addButtonWrapper}>
                                    <Link to="/team-creation"
                                          style={{pointerEvents: userTeam !== '' ? 'none' : 'auto'}}>
                                        <IconButton disabled={userTeam !== ''} sx={{padding: mediaMatch.matches ? '0' : '13px'}}>
                                            <AddCircleOutlineOutlinedIcon sx={{
                                                color: userTeam === '' ? 'white' : 'gray',
                                                fontSize: mediaMatch.matches ? '17vmin' : '9vmin'
                                            }}/>
                                        </IconButton>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <Snackbar sx={{marginTop: '8vh'}} open={isTeamNotFree} anchorOrigin={{vertical: 'top', horizontal: 'right'}} autoHideDuration={5000}>
                            <Alert severity='error' sx={{width: '100%'}}>
                                Кто-то уже занял эту команду
                            </Alert>
                        </Snackbar>
                    </div>
                );
        }
    };

    if (numberLoading < 2) {
        return <Loader />;
    }

    if (gameId) {
        return <Redirect to={`/game/${gameId}`}/>;
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                {
                    !mediaMatch.matches
                        ? <NavBar isAdmin={false} page={location.state !== undefined ? location.state.page : page}
                         onLinkChange={setPage}/>
                        : null
                }
            </Header>

            {
                mediaMatch.matches
                    ? <MobileNavbar isAdmin={false} page={page} onLinkChange={setPage} isGame={false} />
                    : null
            }
            {renderPage(page)}
        </PageWrapper>
    );
};

function mapDispatchToProps(dispatch: Dispatch<AppAction>): UserStartScreenDispatchProps {
    return {
        onAddUserTeam: (team: string) => dispatch(addUserTeam(team))
    };
}

export default connect(null, mapDispatchToProps)(UserStartScreen);