import React, {Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState} from 'react';
import classes from './admin-start-screen.module.scss';
import Header from '../../components/header/header';
import NavBar from '../../components/nav-bar/nav-bar';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {AdminStartScreenProps} from '../../entities/admin-start-screen/admin-start-screen.interfaces';
import {IconButton, OutlinedInput, Button, Skeleton} from '@mui/material';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import {Scrollbars} from 'rc-scrollbars';
import {Link, useLocation} from 'react-router-dom';
import InputWithAdornment from '../../components/input-with-adornment/input-with-adornment';
import {addAdmin, deleteAdmin, getAll} from '../../server-api/server-api';
import Modal from '../../components/modal/modal';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import Scrollbar from '../../components/scrollbar/scrollbar';

const inputStyles = {
    '& .MuiOutlinedInput-notchedOutline': {
        border: '2px solid var(--foreground-color) !important',
        borderRadius: '8px',
        minHeight: '26px',
        padding: '0 !important'
    },
    '& .MuiOutlinedInput-input': {
        padding: '0 0 0 1.5vw !important',
        color: 'black',
    }
};

interface Admin {
    name: string;
    email: string;
}

interface AdminProps {
    name: string;
    email: string;
    deleteAdmin?: Dispatch<SetStateAction<Admin[] | undefined>>;
    isSuperAdmin: boolean;
}

const AdminComponent: FC<AdminProps> = props => {
    const handleDelete = useCallback(e => {
        deleteAdmin(props.email)
            .then(res => {
                if (res.status === 200) {
                    props.deleteAdmin?.(admins => admins?.filter(a => a.email !== props.email));
                } else {
                    // TODO: код не 200, мейби всплывашку, что что-то не так?
                }
            });
    }, [props]);

    const handleDeleteClick = (e: React.SyntheticEvent) => {
        handleDelete(e);
    };

    return (
        <div className={props.isSuperAdmin ? classes.superAdminInfoWrapper : classes.adminInfoWrapper}>
            <OutlinedInput readOnly sx={inputStyles} className={`${classes.adminName} ${classes.adminInput}`}
                           value={props.name}/>
            <OutlinedInput readOnly sx={inputStyles} className={`${classes.adminEmail} ${classes.adminInput}`}
                           value={props.email}/>
            {
                props.isSuperAdmin
                    ? <Button className={classes.adminButton} onClick={handleDeleteClick}>
                        <CloseIcon sx={{color: 'red', fontSize: '5vmin'}}/>
                    </Button>
                    : null
            }
        </div>
    );
};

export interface Game {
    name: string,
    id: string
}

export interface Team {
    name: string,
    id: string
}

const AdminStartScreen: FC<AdminStartScreenProps> = props => {
    const [page, setPage] = useState<string>('games');
    const [teams, setTeams] = useState<Team[]>();
    const [games, setGames] = useState<Game[]>();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [deletedItemName, setDeletedItemName] = useState<string>('');
    const [deletedItemId, setDeletedItemId] = useState<string>('');
    const [admins, setAdmins] = useState<Admin[]>();
    const [newAdmin, setNewAdmin] = useState<Admin | null>(null);
    const [isEmailInvalid, setIsEmailInvalid] = useState<boolean>(false);
    const scrollbars = useRef<Scrollbars>(null);
    let location = useLocation<{ page: string }>();

    const emailStyles = {
        '& .MuiOutlinedInput-notchedOutline': {
            border: isEmailInvalid ? '2px solid #FF0000 !important' : '2px solid var(--foreground-color) !important',
            borderRadius: '8px',
            minHeight: '26px',
            padding: '0 !important'
        },
        '& .MuiOutlinedInput-input': {
            padding: '0 0 0 1.5vw !important',
            color: 'black',
        }
    };

    useEffect(() => {
        if (location.state !== undefined) {
            setPage(location.state.page);
        }
    }, [location]);

    useEffect(() => {
        getAll('/teams/').then(res => {
            if (res.status === 200) {
                res.json().then(({teams}) => {
                    setTeams(teams.sort((team1: Team, team2: Team) => team1.name.toLowerCase() > team2.name.toLowerCase() ? 1 : -1));
                });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });

        getAll('/games/').then(res => {
            if (res.status === 200) {
                res.json().then(({games}) => {
                    setGames(games.sort((game1: Game, game2: Game) => game1.name.toLowerCase() > game2.name.toLowerCase() ? 1 : -1));
                });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });

        getAll('/admins/').then(res => {
            if (res.status === 200) {
                res.json().then(({admins}) => {
                    setAdmins(admins.sort((admin1: Admin, admin2: Admin) => admin1.email.toLowerCase() > admin2.email.toLowerCase() ? 1 : -1));
                });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });
    }, []);

    const renderTeams = () => {
        if (!teams) {
            return Array.from(Array(5).keys()).map(i => <Skeleton key={`team_skeleton_${i}`} variant="rectangular"
                                                                  width="100%" height="7vh"
                                                                  sx={{marginBottom: '2.5vh'}}/>);
        }
        return teams.map((team, index) => <InputWithAdornment name={team.name} id={team.id} key={index} type="team"
                                                              openModal={setIsModalVisible}
                                                              setItemForDeleteName={setDeletedItemName}
                                                              setItemForDeleteId={setDeletedItemId}/>);
    };

    const renderGames = () => {
        if (!games) {
            return Array.from(Array(5).keys()).map(i => <Skeleton key={`game_skeleton_${i}`} variant="rectangular"
                                                                  width="100%" height="7vh"
                                                                  sx={{marginBottom: '2.5vh'}}/>);
        }
        return games.map((game, index) => <InputWithAdornment name={game.name} id={game.id} key={index} type="game"
                                                              openModal={setIsModalVisible}
                                                              setItemForDeleteName={setDeletedItemName}
                                                              setItemForDeleteId={setDeletedItemId}/>);
    };

    const renderAdmins = () => {
        if (!admins) {
            return Array.from(Array(5).keys()).map(i =>
                (
                    <div key={`admin_skeleton_${i}`}
                         className={props.isSuperAdmin ? classes.superAdminInfoWrapper : classes.adminInfoWrapper}>
                        <Skeleton variant="rectangular" width="38%" height="7vh" sx={{marginBottom: '2vh', marginRight: !props.isSuperAdmin ? '2%' : 0}}/>
                        <Skeleton variant="rectangular" width="52%" height="7vh" sx={{marginBottom: '2vh', marginRight: !props.isSuperAdmin ? '2%' : 0}}/>
                        {
                            props.isSuperAdmin
                                ? <Skeleton variant="rectangular" width="7%" height="7vh" sx={{marginBottom: '2vh'}}/>
                                : null
                        }
                    </div>
                ));
        }
        let adminsForRender = [];
        for (let admin of admins) {
            adminsForRender.push(<AdminComponent key={admin.email + admin.name} name={admin.name} email={admin.email}
                                                 deleteAdmin={setAdmins} isSuperAdmin={props.isSuperAdmin}/>);
        }
        return adminsForRender;
    };

    const handleAddAdminButton = () => {
        setNewAdmin({name: '', email: ''});
    };

    useEffect(() => {
        if (newAdmin !== null) {
            scrollToBottom();
        }
    }, [newAdmin]);

    const scrollToBottom = () => {
        (scrollbars.current as Scrollbars).scrollToBottom();
    };

    const handleAddNewAdmin = () => {
        let newAdminName = document.querySelector('#new-admin-name') as HTMLInputElement;
        let newAdminEmail = document.querySelector('#new-admin-email') as HTMLInputElement;
        if (newAdminEmail.value !== '') {
            addAdmin(newAdminEmail.value, newAdminName.value)
                .then(res => {
                    if (res.status === 200) {
                        setAdmins(admins => [...(admins ? admins : []), {
                            name: newAdminName.value,
                            email: newAdminEmail.value
                        }]);
                        setNewAdmin(null);
                        setIsEmailInvalid(false);
                    } else {
                        setIsEmailInvalid(true);
                    }
                })
        } else {
            setIsEmailInvalid(true);
        }
    };

    const renderPage = (page: string) => {
        switch (page) {
            case 'games':
                return (
                    <div className={classes.containerWrapper}>
                        <div className={classes.box}>
                            <div className={classes.gamesWrapper}>
                                <Scrollbar>
                                    {renderGames()}
                                </Scrollbar>
                            </div>

                            <div className={classes.addButtonWrapper}>
                                <Link to="/admin/game-creation">
                                    <IconButton sx={{padding: '13px'}} id="addGameButton">
                                        <AddCircleOutlineOutlinedIcon sx={{
                                            color: 'white',
                                            fontSize: '9vmin'
                                        }}/>
                                    </IconButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            case 'teams':
                return (
                    <div className={classes.containerWrapper}>
                        <div className={classes.box}>
                            <div className={classes.teamsWrapper}>
                                <Scrollbar>
                                    {renderTeams()}
                                </Scrollbar>
                            </div>

                            <div className={classes.addButtonWrapper}>
                                <Link to="/admin/team-creation">
                                    <IconButton sx={{padding: '13px'}} id="addTeamButton">
                                        <AddCircleOutlineOutlinedIcon sx={{
                                            color: 'white',
                                            fontSize: '9vmin'
                                        }}/>
                                    </IconButton>
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            case 'admins':
                return (
                    <div className={classes.adminsWrapper}>
                        <div className={props.isSuperAdmin ? classes.box : `${classes.box} ${classes.adminBox}`}>
                            <div
                                className={props.isSuperAdmin ? classes.superAdminWrapper : classes.adminsWrapperWithScrollbar}>
                                <Scrollbars ref={scrollbars} className={classes.scrollbar} autoHide
                                            autoHideTimeout={500} autoHideDuration={200}
                                            renderThumbVertical={() => <div style={{
                                                backgroundColor: 'white',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}/>}
                                            renderTrackHorizontal={props => <div {...props} style={{display: 'none'}}/>}
                                            classes={{view: classes.scrollbarView}}>

                                    {renderAdmins()}

                                    {
                                        newAdmin !== null
                                            ?
                                            <div className={classes.superAdminNewAdminInfoWrapper}>
                                                <OutlinedInput id="new-admin-name" sx={inputStyles}
                                                               className={`${classes.adminName} ${classes.adminInput} ${classes.newAdmin}`}
                                                               placeholder="Имя"/>
                                                <OutlinedInput id="new-admin-email" type="email" sx={emailStyles}
                                                               className={`${classes.adminEmail} ${classes.adminInput} ${classes.newAdmin}`}
                                                               placeholder="Email*"/>
                                                <Button className={classes.adminButton} onClick={handleAddNewAdmin} id="addAdminButton">
                                                    <AddIcon sx={{color: 'green', fontSize: '5vmin'}}/>
                                                </Button>
                                            </div>
                                            : null
                                    }
                                </Scrollbars>
                            </div>

                            {props.isSuperAdmin
                                ?
                                <IconButton sx={{padding: '13px'}} id='addAdmin' onClick={handleAddAdminButton}>
                                    <AddCircleOutlineOutlinedIcon sx={{
                                        color: 'white',
                                        fontSize: '9vmin'
                                    }}/>
                                </IconButton>
                                : null
                            }
                        </div>
                    </div>
                );
        }
    };

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <NavBar isAdmin={true} page={location.state !== undefined ? location.state.page : page}
                        onLinkChange={setPage}/>
            </Header>

            {
                isModalVisible
                    ? <Modal modalType="delete"
                             deleteElement={page === 'teams' ? setTeams : setGames}
                             closeModal={setIsModalVisible}
                             itemForDeleteName={deletedItemName}
                             itemForDeleteId={deletedItemId}
                             type={page === 'teams' ? 'team' : 'game'}/>
                    : null
            }

            {renderPage(page)}
        </PageWrapper>
    );
};

export default AdminStartScreen;