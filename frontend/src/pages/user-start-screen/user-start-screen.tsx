import React, {FC, useEffect, useRef, useState} from 'react';
import classes from './user-start-screen.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import NavBar from "../../components/nav-bar/nav-bar";
import Header from "../../components/header/header";
import {Scrollbars} from 'rc-scrollbars';
import {UserStartScreenProps} from "../../entities/user-start-screen/user-start-screen.interfaces";
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import {Link} from "react-router-dom";
import {IconButton} from "@mui/material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import {editTeamCaptainByCurrentUser, getAll, getTeamByCurrentUser, getTeamsWithoutUser} from '../../server-api/server-api';

const UserStartScreen: FC<UserStartScreenProps> = () => {
    const [page, setPage] = useState('teams');
    const [gamesFromDB, setGamesFromDB] = useState<string[]>([]);
    const [teamsFromDB, setTeamsFromDB] = useState<string[]>([]);
    const [userTeam, setUserTeam] = useState('');
    const scrollbars = useRef<Scrollbars>(null);

    // TODO доставать команды, игры и команду юзера (если есть) из бд
    // gamesFromDB.push(...['Чгк на КонфУРе-2021', 'shjbdnklsd;dllknsjbckjsdlv;skdkvjbsjkla;sckmdashdbksldkvlkndfkjvbefj', 'Игра 1', 'Игра 2', 'Игра 3', 'Игра 4', 'Игра 5', 'Игра 6', 'Игра 7', 'Игра 8','Игра 9','Игра 10']);
    // teamsFromDB.push(...['My Best Team', 'Meow', 'Hello', 'Sweet brioches','ChGK','BestTeam', 'Meow Meow', 'Elite', 'Family']);

    useEffect(() => {
        getTeamByCurrentUser().then(res => {
            if (res.status === 200) {
                res.json().then(({name}) => {
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
                        setTeamsFromDB([name, ...teamsFromDB]);
                    }
                })
            }
        })

        getAll('/games/').then(res => {
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

    const renderGames = () => {
        return gamesFromDB.map((name, index) =>
            <div key={index} className={classes.gameOrTeam}>{name}</div>);
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
            <div key={teamsFromDB.indexOf(userTeam)} className={classes.gameOrTeam}>
                {userTeam}

                <CheckCircleOutlinedIcon color='success' sx={{fontSize: '1.5vw', cursor: 'default'}} />
            </div>)
            : null,
            ...teamsFromDB.map((name, index) => {
            return name !== userTeam
                ? <div key={index} className={classes.gameOrTeam} onClick={handleChooseTeam}>{name}</div>
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