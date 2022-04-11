import React, {FC, useEffect, useRef, useState} from 'react';
import classes from './team-creation.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {
    TeamCreatorDispatchProps,
    TeamCreatorProps,
    TeamCreatorStateProps
} from '../../entities/team-creation/team-creation.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Autocomplete, Button, OutlinedInput, Skeleton, TextField} from '@mui/material';
import {CustomInput} from '../../components/custom-input/custom-input';
import {createTeam, editTeam, getTeam, getUsersWithoutTeam} from '../../server-api/server-api';
import {Redirect, useLocation} from 'react-router-dom';
import NavBar from '../../components/nav-bar/nav-bar';
import PageBackdrop from '../../components/backdrop/backdrop';
import {Dispatch} from 'redux';
import {AppAction} from '../../redux/reducers/app-reducer/app-reducer.interfaces';
import {addUserTeam} from '../../redux/actions/app-actions/app-actions';
import {connect} from 'react-redux';
import {AppState} from '../../entities/app/app.interfaces';
import MobileNavbar from '../../components/mobile-navbar/mobile-navbar';
import Loader from '../../components/loader/loader';
import CloseIcon from '@mui/icons-material/Close';
import {Scrollbars} from 'rc-scrollbars';
import {User} from '../admin-start-screen/admin-start-screen';

export interface TeamMember {
    name: string;
    email: string;
}

const TeamCreator: FC<TeamCreatorProps> = props => {
    const [usersFromDB, setUsersFromDB] = useState<string[]>();
    const [isCreatedSuccessfully, setIsCreatedSuccessfully] = useState<boolean>(false);
    const [isNameInvalid, setIsNameInvalid] = useState<boolean>(false);
    const [isCaptainEmpty, setIsCaptainEmpty] = useState<boolean>(false);
    const [oldCaptain, setOldCaptain] = useState<string | undefined>();
    const location = useLocation<{ id: string, name: string }>();
    const [teamName, setTeamName] = useState<string>(props.mode === 'edit' ? location.state.name : '');
    const [captain, setCaptain] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const scrollbars = useRef<Scrollbars>(null);
    const [mediaMatch, setMediaMatch] = useState<MediaQueryList>(window.matchMedia('(max-width: 600px)'));

    useEffect(() => {
        const resizeEventHandler = () => {
            setMediaMatch(window.matchMedia('(max-width: 600px)'));
        }

        window.addEventListener('resize', resizeEventHandler);

        return () => {
            window.removeEventListener('resize', resizeEventHandler);
        };
    }, []);

    useEffect(() => {
        if (!props.isAdmin) {
            setCaptain(props.userEmail);
            setOldCaptain(props.userEmail);
            setUsersFromDB([props.userEmail]);
            setIsPageLoading(false);
        } else {
            getUsersWithoutTeam().then(res => {
                if (res.status === 200) {
                    res.json().then(({users}) => {
                        const userObjects = users as User[]
                        setUsersFromDB([...userObjects.map(user => user.email)]);
                        if (props.mode === 'edit') {
                            getTeam(location.state.id).then(res => {
                                if (res.status === 200) {
                                    res.json().then(team => {
                                        setCaptain(team.captainEmail);
                                        setOldCaptain(team.captainEmail);
                                        if (team.captainEmail) {
                                            setUsersFromDB([...userObjects.map(user => user.email), team.captainEmail]);
                                        }
                                        setIsPageLoading(false);
                                    });
                                }
                            });
                        } else {
                            setIsPageLoading(false);
                        }
                    });
                } else {
                    // TODO: код не 200, мейби всплывашку, что что-то не так?
                }
            });
        }
    }, []);

    const handleAutocompleteChange = (event: React.SyntheticEvent, value: string | null) => {
        setCaptain(value as string);
        setIsCaptainEmpty(false);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamName(event.target.value);
        setIsNameInvalid(false);
    };

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (captain === '') {
            setIsCaptainEmpty(true);
            return;
        }
        setIsLoading(true);
        if (props.mode === 'creation') {
            createTeam(teamName, captain).then(res => {
                if (res.status === 200) {
                    setIsCreatedSuccessfully(true);
                    if (!props.isAdmin) {
                        props.onAddUserTeam(teamName);
                    }
                } else {
                    setIsLoading(false);
                    setIsNameInvalid(true);
                }
            });
        } else {
            editTeam(location.state.id, teamName, captain).then(res => {
                if (res.status === 200) {
                    if (!props.isAdmin) {
                        props.onAddUserTeam(teamName);
                    }

                    setIsCreatedSuccessfully(true);
                } else {
                    setIsLoading(false);
                    setIsNameInvalid(true);
                }
            });
        }
    };

    const addMember = () => {
        setMembers((prevMembers) => [...prevMembers, {name: '', email: ''}]);
        (scrollbars.current as Scrollbars).scrollToBottom();
    };

    const handleDeleteMemberClick = (index: number) => {
        setMembers((prevMembers) => prevMembers.filter((_, i) => i !== index));
    };

    const handleMemberNameChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setMembers((members) => {
            const newMembers = [...members];
            newMembers[index].name = event.target.value;
            return newMembers;
        });
    };

    const handleMemberEmailChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setMembers((members) => {
            const newMembers = [...members];
            newMembers[index].email = event.target.value;
            return newMembers;
        });
    };

    const renderMembers = () => {
        return members.map((member, index) => (
            <div className={classes.memberWrapper}>
                <OutlinedInput className={`${classes.adminName} ${classes.adminInput}`}
                               sx={{
                                   '& .MuiOutlinedInput-notchedOutline': {
                                       border: '2px solid var(--foreground-color) !important'
                                   }
                               }}
                               onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleMemberNameChange(event, index)}
                               value={member.name} placeholder='Имя'/>
                <OutlinedInput className={`${classes.adminEmail} ${classes.adminInput}`}
                               sx={{
                                   '& .MuiOutlinedInput-notchedOutline': {
                                       border: '2px solid var(--foreground-color) !important'
                                   }
                               }}
                               onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleMemberEmailChange(event, index)}
                               value={member.email} placeholder='Почта'/>
                <Button className={classes.adminButton} onClick={() => handleDeleteMemberClick(index)}>
                    <CloseIcon sx={{color: 'red', fontSize: '5vmin'}}/>
                </Button>
            </div>
        ));
    };

    if (isPageLoading) {
        return <Loader />;
    }

    return isCreatedSuccessfully
        ? <Redirect to={{pathname: props.isAdmin ? '/admin/start-screen' : '/start-screen', state: {page: 'teams'}}}/>
        :
        (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={true}>
                    {
                        !mediaMatch.matches
                            ? <NavBar isAdmin={props.isAdmin} page=''/>
                            : null
                    }
                </Header>

                {
                    mediaMatch.matches
                        ? <MobileNavbar isAdmin={props.isAdmin} page='' isGame={false}/>
                        : null
                }
                <form className={classes.teamCreationForm} onSubmit={handleSubmit}>
                    <div className={classes.contentWrapper}>
                        {
                            props.mode === 'creation'
                                ? <div className={classes.pageTitle}>Создание команды</div>
                                : <div className={classes.pageTitle}>Редактирование</div>
                        }

                        <div className={classes.settingsWrapper}>
                            {
                                (usersFromDB &&
                                    (props.mode === 'edit' && oldCaptain !== undefined || props.mode === 'creation')) ||
                                !props.isAdmin
                                    ? <CustomInput type='text' id='teamName'
                                                   name='teamName'
                                                   style={{width: '49%'}}
                                                   placeholder='Название команды'
                                                   value={teamName}
                                                   defaultValue={teamName}
                                                   onChange={handleInputChange}
                                                   isInvalid={isNameInvalid}
                                                   onFocus={() => setIsNameInvalid(false)}
                                                   errorHelperText={'Такая команда уже существует'}/>
                                    : <Skeleton variant='rectangular' width='100%'
                                                height={mediaMatch.matches ? '6vh' : '7vh'} sx={{marginBottom: '3%'}}/>
                            }

                            {
                                usersFromDB
                                    ?
                                    <div style={{position: 'relative', width: '49%'}}>
                                        <Autocomplete disablePortal
                                                        fullWidth
                                                        id="captain"
                                                        options={usersFromDB || []}
                                                        defaultValue={oldCaptain}
                                                        onChange={handleAutocompleteChange}
                                                        sx={{
                                                            border: 'none',
                                                            fontSize: '1.5vw',
                                                            minHeight: '26px',
                                                            height: '7vh !important',
                                                            borderRadius: '8px',
                                                            backgroundColor: 'white',
                                                            boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.5)',
                                                            '& .MuiOutlinedInput-input': {
                                                                padding: '0 0 0 1.5vw !important',
                                                                border: 'none',
                                                                fontFamily: 'Roboto, sans-serif',
                                                                color: 'black',
                                                                fontSize: '1.5vw',
                                                            },
                                                            '& .MuiOutlinedInput-root': {
                                                                height: '7vh !important',
                                                                minHeight: '26px',
                                                                padding: '0'
                                                            },
                                                            '& .MuiOutlinedInput-notchedOutline': {
                                                                border: '2px solid var(--foreground-color) !important',
                                                                borderRadius: '8px',
                                                                minHeight: '26px',
                                                            },
                                                            '& .MuiSvgIcon-root': {
                                                                color: 'var(--background-color)'
                                                            }
                                                        }}
                                                        renderInput={(params) => <TextField {...params} placeholder="Капитан"/>}
                                        />
                                        {
                                            isCaptainEmpty || true
                                                ?
                                                <small style={{position: 'absolute', color: '#FF0000', top: '7.5vh', fontSize: '1vmax'}}>Выберите
                                                    капитана</small>
                                                : null
                                        }
                                    </div>
                                    : <Skeleton variant='rectangular' width='100%' height={mediaMatch.matches ? '6vh' : '7vh'} sx={{marginBottom: '3%'}} />
                            }
                        </div>

                        <div className={classes.membersWrapper}>
                            <div className={classes.membersPanel}>
                                <div className={classes.membersLabel}>Участники</div>

                                <button className={classes.button}
                                        onClick={addMember}
                                        disabled={members.length === 9}
                                        type='button'
                                >Добавить участника
                                </button>
                            </div>

                            <div className={classes.members}>
                                <Scrollbars autoHide autoHideTimeout={500}
                                            ref={scrollbars}
                                            autoHideDuration={200}
                                            renderThumbVertical={() =>
                                                <div style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}/>
                                            }
                                            renderTrackHorizontal={props => <div {...props} style={{display: 'none'}}/>}
                                            classes={{
                                                view: classes.scrollbarView,
                                                trackVertical: classes.verticalTrack
                                            }}>
                                    {renderMembers()}
                                </Scrollbars>
                            </div>
                        </div>
                    </div>

                    <FormButton text={props.mode === 'creation' ? 'Создать' : 'Сохранить'} disabled={props.isAdmin && !(usersFromDB && (props.mode === 'edit' || props.mode === 'creation'))}
                                style={{
                                    padding: mediaMatch.matches ? '0 13vw' : '0 2vw',
                                    fontSize: mediaMatch.matches ? '6.5vw' : '1.5vw',
                                    height: mediaMatch.matches ? '13vw' : '7vh',
                                    marginBottom: '2vh',
                                    marginTop: '2vh',
                                    borderRadius: '7px',
                                    fontWeight: 700,
                                    filter: 'drop-shadow(0 3px 3px rgba(255, 255, 255, 0.2))'
                                }}/>
                </form>
                <PageBackdrop isOpen={isLoading}/>
            </PageWrapper>
        );
};

function mapStateToProps(state: AppState): TeamCreatorStateProps {
    return {
        userEmail: state.appReducer.user.email
    };
}

function mapDispatchToProps(dispatch: Dispatch<AppAction>): TeamCreatorDispatchProps {
    return {
        onAddUserTeam: (team: string) => dispatch(addUserTeam(team))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(TeamCreator);