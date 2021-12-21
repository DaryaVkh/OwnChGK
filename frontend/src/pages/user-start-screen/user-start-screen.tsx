import React, {FC, useEffect, useRef, useState} from 'react';
import classes from './user-start-screen.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import NavBar from "../../components/nav-bar/nav-bar";
import Header from "../../components/header/header";
import {Scrollbars} from 'rc-scrollbars';
import {UserStartScreenProps} from "../../entities/user-start-screen/user-start-screen.interfaces";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import {Link, Redirect} from 'react-router-dom';
import {IconButton} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import {editTeamCaptainByCurrentUser, getAll, getTeamByCurrentUser, getTeamsWithoutUser} from '../../server-api/server-api';
import {Game, Team} from '../admin-start-screen/admin-start-screen';

const UserStartScreen: FC<UserStartScreenProps> = () => {
    const [page, setPage] = useState('teams');
    const [gamesFromDB, setGamesFromDB] = useState<Game[]>([]);
    const [teamsFromDB, setTeamsFromDB] = useState<Team[]>([]);
    const [userTeam, setUserTeam] = useState('');
    const scrollbars = useRef<Scrollbars>(null);
    const [gameId, setGameId] = useState('');

    // TODO доставать команды, игры и команду юзера (если есть) из бд
    // gamesFromDB.push(...['Чгк на КонфУРе-2021', 'shjbdnklsd;dllknsjbckjsdlv;skdkvjbsjkla;sckmdashdbksldkvlkndfkjvbefj', 'Игра 1', 'Игра 2', 'Игра 3', 'Игра 4', 'Игра 5', 'Игра 6', 'Игра 7', 'Игра 8','Игра 9','Игра 10']);
    // teamsFromDB.push(...['My Best Team', 'Meow', 'Hello', 'Sweet brioches','ChGK','BestTeam', 'Meow Meow', 'Elite', 'Family']);

    useEffect(() => {
        getTeamByCurrentUser().then(res => {
            if (res.status === 200) {
                res.json().then(({name, id}) => {
                    getTeamsWithoutUser().then(res => {
                        if (res.status === 200) {
                            res.json().then(({teams}) => {
                                setTeamsFromDB(teams);
                            });
                        } else {
                            // TODO: код не 200, мейби всплывашку, что что-то не так?
                        }
                    })

                    if (name !== undefined) {
                        setUserTeam(name);
                        setTeamsFromDB([{name, id}, ...teamsFromDB]);
                    }
                })
            }
        })

        getAll('/games/').then(res => { // TODO: игры, в которых я состою
            if (res.status === 200) {
                res.json().then(({games}) => {
                    setGamesFromDB(games);
                });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });
    }, []);

    const handleChooseTeam = (e: React.SyntheticEvent) => {
        if (userTeam === '') {
            setUserTeam((e.currentTarget as HTMLDivElement).innerText);
            editTeamCaptainByCurrentUser((e.currentTarget as HTMLDivElement).innerText)
                .then(res => {
                    // TODO: код не 200, что делать?
                });
            //TODO установили, отрисовали и отправляем в бд, что этот юзер теперь капитан этой команды
        }
    }

    const handleClick = (id: string) => {
        setGameId(id);
    }

    const renderGames = () => {
        return gamesFromDB.map((game, index) =>
            <div key={index} className={classes.gameOrTeam} onClick={() => handleClick(game.id)}>{game.name}</div>);
    }

    const scrollToTop = () => {
        (scrollbars.current as Scrollbars).scrollToTop();
    }

    useEffect(() => {
        if (userTeam !== '') {
            scrollToTop();
        }
    }, [userTeam]);

    const renderTeams = () => {
        return [userTeam !== ''
            ? (
            <div key={userTeam} className={classes.gameOrTeam}>
                {userTeam}

                <CheckCircleOutlinedIcon color='success' sx={{fontSize: '1.5vw', cursor: 'default'}} />
            </div>)
            : null,
            ...teamsFromDB.map((team, index) => {
            return team.name !== userTeam
                ? <div key={index} className={classes.gameOrTeam} onClick={handleChooseTeam}>{team.name}</div>
                : null
        })];
    }

    const renderPage = (page: string) => {
        switch (page) {
            case 'games':
                return (
                    <div className={classes.contentWrapper}>
                        <div className={classes.contentBox}>
                            <Scrollbars className={classes.scrollbar} autoHide autoHideTimeout={500} autoHideDuration={200} renderThumbVertical={() =>
                                <div style={{backgroundColor: 'transparent'}}/>} renderTrackVertical={() =>
                                <div style={{backgroundColor: 'transparent'}}/>}>

                                {renderGames()}
                            </Scrollbars>
                        </div>
                    </div>
                );
            case 'teams':
                return (
                    <div className={classes.contentWrapper}>
                            <div className={classes.box}>
                                <p className={classes.teamParagraph}>Выбери команду из списка или создай новую</p>

                                <div className={classes.contentBox} style={{height: '92%', padding: '5vh 2vw 3vh 2vw'}}>
                                    <div className={classes.teamsWrapper}>
                                        <Scrollbars ref={scrollbars} className={classes.scrollbar} autoHide autoHideTimeout={500} autoHideDuration={200} renderThumbVertical={() =>
                                            <div style={{backgroundColor: 'transparent'}}/>} renderTrackVertical={() =>
                                            <div style={{backgroundColor: 'transparent'}}/>}>

                                            {renderTeams()}
                                        </Scrollbars>
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

            {renderPage(page)}

        </PageWrapper>
    );
}

export default UserStartScreen;