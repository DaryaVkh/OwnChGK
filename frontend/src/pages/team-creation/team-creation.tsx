import React, {FC, useEffect, useState} from 'react';
import classes from './team-creation.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {
    TeamCreatorDispatchProps,
    TeamCreatorProps,
    TeamCreatorStateProps
} from '../../entities/team-creation/team-creation.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Autocomplete, Skeleton, TextField} from '@mui/material';
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
import MobileNavbar from "../../components/mobile-navbar/mobile-navbar";
import Loader from "../../components/loader/loader";
import {User} from "../admin-start-screen/admin-start-screen";

const TeamCreator: FC<TeamCreatorProps> = props => {
    const [usersFromDB, setUsersFromDB] = useState<string[]>();
    const [isCreatedSuccessfully, setIsCreatedSuccessfully] = useState<boolean>(false);
    const [isNameInvalid, setIsNameInvalid] = useState<boolean>(false);
    const [oldCaptain, setOldCaptain] = useState<string | undefined>();
    const location = useLocation<{ id: string, name: string }>();
    const [teamName, setTeamName] = useState<string>(props.mode === 'edit' ? location.state.name : '');
    const [captain, setCaptain] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
    const mediaMatch = window.matchMedia('(max-width: 768px)');

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
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTeamName(event.target.value);
    };

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
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
                    setIsCreatedSuccessfully(true);
                } else {
                    setIsLoading(false);
                    setIsNameInvalid(true);
                }
            });
        }
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
                            ? <NavBar isAdmin={props.isAdmin} page=""/>
                            : null
                    }
                </Header>

                {
                    mediaMatch.matches
                        ? <MobileNavbar isAdmin={props.isAdmin} page="" isGame={false}/>
                        : null
                }
                <form className={classes.teamCreationForm} onSubmit={handleSubmit}>
                    <div className={classes.contentWrapper}>
                        {
                            props.mode === 'creation'
                                ? <div className={classes.pageTitle}>Создание команды</div>
                                : <div className={classes.pageTitle}>Редактирование</div>
                        }

                        {
                            usersFromDB
                                ? <CustomInput type='text' id='teamName'
                                               name='teamName'
                                               style={{marginBottom: '9%'}}
                                               placeholder='Название'
                                               value={teamName}
                                               defaultValue={teamName}
                                               onChange={handleInputChange}
                                               isInvalid={isNameInvalid}
                                               errorHelperText={'Такая команда уже существует'}/>
                                : <Skeleton variant='rectangular' width='100%' height={mediaMatch.matches ? '6vh' : '7vh'} sx={{marginBottom: '3%'}} />
                        }

                        {
                            usersFromDB
                                ? <Autocomplete disablePortal
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
                                                    marginBottom: '3%',
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
                                : <Skeleton variant='rectangular' width='100%' height={mediaMatch.matches ? '6vh' : '7vh'} sx={{marginBottom: '3%'}} />
                        }

                    </div>

                    <FormButton text={props.mode === 'creation' ? 'Создать' : 'Сохранить'} disabled={props.isAdmin && !(usersFromDB && (props.mode === 'edit' || props.mode === 'creation'))}
                                style={{
                                    padding: mediaMatch.matches ? '0 13vw' : '0 2vw', fontSize: mediaMatch.matches ? '6.5vw' : '1.5vw',
                                    height: mediaMatch.matches ? '13vw' : '7vh', marginBottom: '2.5vh',
                                    borderRadius: '7px',
                                    fontWeight: 700,
                                    filter: 'drop-shadow(0 3px 3px rgba(255, 255, 255, 0.2))'
                                }}/>
                </form>
                <PageBackdrop isOpen={isLoading} />
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