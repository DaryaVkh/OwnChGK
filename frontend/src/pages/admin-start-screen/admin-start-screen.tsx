import React, {Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState} from 'react';
import classes from './admin-start-screen.module.scss';
import Header from "../../components/header/header";
import NavBar from "../../components/nav-bar/nav-bar";
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import {AdminStartScreenProps} from "../../entities/admin-start-screen/admin-start-screen.interfaces";
import {IconButton, OutlinedInput, Button} from "@mui/material";
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import {Scrollbars} from "rc-scrollbars";
import {Link} from 'react-router-dom';
import InputWithAdornment from "../../components/input-with-adornment/input-with-adornment";
import {getAll} from "../../server-api/server-api";
import Modal from "../../components/modal/modal";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from '@mui/icons-material/Add';

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
    deleteAdmin?: Dispatch<SetStateAction<Admin[]>>;
    isSuperAdmin: boolean;
}

const AdminComponent: FC<AdminProps> = props => {
    const handleDelete = useCallback(e => {
        //TODO вот тут удаляем админа из базы
        props.deleteAdmin?.(admins => admins.filter(a => a.email !== props.email));
    }, [props]);

    const handleDeleteClick = (e: React.SyntheticEvent) => {
        handleDelete(e);
    }

    return (
        <div className={props.isSuperAdmin ? classes.superAdminInfoWrapper : classes.adminInfoWrapper}>
            <OutlinedInput readOnly sx={inputStyles} className={`${classes.adminName} ${classes.adminInput}`} value={props.name} />
            <OutlinedInput readOnly sx={inputStyles} className={`${classes.adminEmail} ${classes.adminInput}`} value={props.email} />
            {
                props.isSuperAdmin
                    ? <Button className={classes.adminButton} onClick={handleDeleteClick}>
                        <CloseIcon sx={{color: 'red', fontSize: '5vmin'}}/>
                      </Button>
                    : null
            }
        </div>
    );
}

const AdminStartScreen: FC<AdminStartScreenProps> = props => {
    const [page, setPage] = useState("games");
    const [teams, setTeams] = useState<string[]>([]);
    const [games, setGames] = useState<string[]>([]);
    const [isTeamsFound, setIsTeamsFound] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deletedItemName, setDeletedItemName] = useState('');
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [newAdmin, setNewAdmin] = useState<Admin | null>(null);
    const [isEmailInvalid, setIsEmailInvalid] = useState(false);
    const scrollbars = useRef<Scrollbars>(null);

    // const [teams, setTeams] = useState<string[]>(['My Best Team', 'Meow', 'Hello', 'Sweet brioches','ChGK','BestTeam', 'Meow Meow', 'Elite', 'Family']);
    // const [admins, setAdmins] = useState<Admin[]>([{name: 'Павел Булгаков', email: 'parasite@comcast.net'}, {name: 'Владислав Сергеев', email: 'olaf.greenholt@larkin.com'}, {name: 'Василиса Суворова', email: 'cebileprei@yopmail.com'}, {name: 'Ульяна Королева', email: 'jeuquoutren@yopmail.com'}, {name: '', email: ''}, {name: '', email: ''}, {name: '', email: ''}, {name: '', email: ''}, {name: '', email: ''}, {name: '', email: ''}]);
    // const [games, setGames] = useState<string[]>(['Игра 1', 'Игра 2', 'Игра 3', 'Игра 4', 'Игра 5', 'Игра 6', 'Игра 7', 'Игра 8','Игра 9','Игра 10', 'Игра 11', 'Игра 12']);

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

    if (!teams || teams.length < 1) {
        if (isTeamsFound) {
            getAll('/teams/').then(data => {
                if (data['teams'].length > 0) {
                    setTeams(data['teams']);
                } else {
                    setIsTeamsFound(false);
                }
            });
        }
    }

    const renderTeams = () => {
        return teams.map((team, index) => <InputWithAdornment name={team} key={index} type='team' openModal={setIsModalVisible} setItemForDeleteName={setDeletedItemName}/>);
    }

    const renderGames = () => {
        return games.map((game, index) => <InputWithAdornment name={game} key={index} type='game' openModal={setIsModalVisible} setItemForDeleteName={setDeletedItemName}/>);
    }

    const renderAdmins = () => {
        let adminsForRender = [];
        for (let admin of admins) {
            adminsForRender.push(<AdminComponent key={admins.indexOf(admin)} name={admin.name} email={admin.email} deleteAdmin={setAdmins} isSuperAdmin={props.isSuperAdmin}/>);
        }
        return adminsForRender;
    }

    const handleAddAdminButton = () => {
        setNewAdmin({name: '', email: ''});
    }

    useEffect(() => {
        if (newAdmin !== null) {
            scrollToBottom();
        }
    }, [newAdmin]);

    const scrollToBottom = () => {
        (scrollbars.current as Scrollbars).scrollToBottom();
    }

    const handleAddNewAdmin = () => {
        let newAdminName = document.querySelector('#new-admin-name') as HTMLInputElement;
        let newAdminEmail = document.querySelector('#new-admin-email') as HTMLInputElement;
        if (newAdminEmail.value !== '') {
            setAdmins(admins => [...admins, {name: newAdminName.value, email: newAdminEmail.value}]);
            setNewAdmin(null);
            setIsEmailInvalid(false);
        } else {
            setIsEmailInvalid(true);
        }
    }

    const renderPage = (page: string) => {
        switch (page) {
            case 'games':
                return (
                    <div className={classes.containerWrapper}>
                        <div className={classes.box}>
                            <div className={classes.gamesWrapper}>
                                <Scrollbars className={classes.scrollbar} autoHide autoHideTimeout={500} autoHideDuration={200}
                                            renderThumbVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                            renderTrackVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                            classes={{view: classes.scrollbarView}}>

                                    {renderGames()}
                                </Scrollbars>
                            </div>

                            <div className={classes.addButtonWrapper}>
                                <Link to='/game-creation'>
                                    <IconButton sx={{padding: '13px'}}>
                                        <AddCircleOutlineOutlinedIcon sx={{
                                            color: 'white',
                                            fontSize: '9vmin'
                                        }} />
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
                                <Scrollbars className={classes.scrollbar} autoHide autoHideTimeout={500} autoHideDuration={200}
                                            renderThumbVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                            renderTrackVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                            classes={{view: classes.scrollbarView}}>

                                    {renderTeams()}
                                </Scrollbars>
                            </div>

                            <div className={classes.addButtonWrapper}>
                                <Link to='/team-creation'>
                                    <IconButton sx={{padding: '13px'}}>
                                        <AddCircleOutlineOutlinedIcon sx={{
                                            color: 'white',
                                            fontSize: '9vmin'
                                        }} />
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
                            <div className={props.isSuperAdmin ? classes.superAdminWrapper : classes.adminsWrapperWithScrollbar}>
                                <Scrollbars ref={scrollbars} className={classes.scrollbar} autoHide autoHideTimeout={500} autoHideDuration={200}
                                            renderThumbVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                            renderTrackVertical={() => <div style={{backgroundColor: 'transparent'}}/>}
                                            classes={{view: classes.scrollbarView}}>

                                    {renderAdmins()}

                                    {
                                        newAdmin !== null
                                            ?
                                            <div className={classes.superAdminInfoWrapper}>
                                                <OutlinedInput id='new-admin-name' sx={inputStyles} className={`${classes.adminName} ${classes.adminInput}`} placeholder='Имя' />
                                                <OutlinedInput id='new-admin-email' type='email' sx={emailStyles} className={`${classes.adminEmail} ${classes.adminInput}`} placeholder='Email*' />
                                                <Button className={classes.adminButton} onClick={handleAddNewAdmin}>
                                                    <AddIcon sx={{color: 'green', fontSize: '5vmin'}}/>
                                                </Button>
                                            </div>
                                            : null
                                    }
                                </Scrollbars>
                            </div>

                            {props.isSuperAdmin
                                ?
                                <IconButton sx={{padding: '13px'}} onClick={handleAddAdminButton}>
                                    <AddCircleOutlineOutlinedIcon sx={{
                                        color: 'white',
                                        fontSize: '9vmin'
                                    }} />
                                </IconButton>
                                : null
                            }
                        </div>
                    </div>
                );
        }
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <NavBar isAdmin={true} page={page} onLinkChange={setPage} />
            </Header>

            {isModalVisible ? <Modal deleteElement={page === 'teams' ? setTeams : setGames} closeModal={setIsModalVisible} itemForDeleteName={deletedItemName}/> : null}

            {renderPage(page)}
        </PageWrapper>
    );
}

export default AdminStartScreen;