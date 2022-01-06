import React, {FC, useState, useEffect} from 'react';
import classes from './team-creation.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {TeamCreatorProps} from '../../entities/team-creation/team-creation.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Alert, Autocomplete, TextField} from '@mui/material';
import {CustomInput} from '../../components/custom-input/custom-input';
import {createTeam, editTeam, getTeam, getUsersWithoutTeam} from '../../server-api/server-api';
import {useLocation, Redirect} from 'react-router-dom';
import NavBar from '../../components/nav-bar/nav-bar';
import {store} from '../../index';

const TeamCreator: FC<TeamCreatorProps> = props => {
    const [usersFromDB, setUsersFromDB] = useState<string[]>([]);
    const [isCreatedSuccessfully, setIsCreatedSuccessfully] = useState(false);
    const [isNameInvalid, setIsNameInvalid] = useState(false);
    const [oldCaptain, setOldCaptain] = useState<string | undefined>(undefined);
    const location = useLocation<{ name: string }>();
    const oldTeamName = props.mode === 'edit' ? location.state.name : '';
    const [teamName, setTeamName] = useState(props.mode === 'edit' ? location.state.name : '');
    const [captain, setCaptain] = useState('');

    useEffect(() => {
        if (!props.isAdmin) {
            setCaptain(store.getState().appReducer.user.email);
        } else {
            getUsersWithoutTeam().then(res => {
                if (res.status === 200) {
                    res.json().then(({users}) => {
                        setUsersFromDB([...users]);
                        if (props.mode === 'edit') {
                            getTeam(teamName).then(res => {
                                if (res.status === 200) {
                                    res.json().then(data => {
                                        setCaptain(data.captain);
                                        setOldCaptain(data.captain);
                                        if (data.captain) {
                                            setUsersFromDB([...users, data.captain]);
                                        }
                                    });
                                }
                            });
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
        if (props.mode === 'creation') {
            createTeam(teamName, captain).then(res => {
                if (res.status === 200) {
                    setIsCreatedSuccessfully(true);
                } else {
                    setIsNameInvalid(true);
                }
            });
        } else {
            editTeam(oldTeamName, teamName, captain).then(res => {
                if (res.status === 200) {
                    setIsCreatedSuccessfully(true);
                } else {
                    setIsNameInvalid(true);
                }
            });
        }
        //TODO если тут ошибка, меняем isNameInvalid на true и делаем return false, иначе все ок, устанавливаем isCreatedSuccessfully в true и редиректимся
    };

    return isCreatedSuccessfully
        ? <Redirect to={{pathname: props.isAdmin ? '/admin/start-screen' : '/start-screen', state: {page: 'teams'}}}/>
        :
        (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={true}>
                    <NavBar isAdmin={props.isAdmin} page=""/>
                </Header>

                <form className={classes.teamCreationForm} onSubmit={handleSubmit}>
                    <div className={classes.contentWrapper}>
                        {
                            props.mode === 'creation'
                                ? <div className={classes.pageTitle}>Создание команды</div>
                                : <div className={classes.pageTitle}>Редактирование</div>
                        }
                        {isNameInvalid ? <Alert severity="error" sx={{
                            width: '90%',
                            color: 'white',
                            backgroundColor: '#F44336',
                            marginBottom: '2vh',
                            '& .MuiAlert-icon': {
                                color: 'white'
                            }
                        }}>Такая команда уже существует</Alert> : null}
                        <CustomInput type="text" id="teamName" name="teamName" placeholder="Название"
                                     value={teamName}
                                     defaultValue={teamName}
                                     onChange={handleInputChange} isInvalid={isNameInvalid}/>

                        {
                            !props.isAdmin && captain !== undefined
                                ? <CustomInput type='text' id='captain' name='captain' placeholder='Капитан' value={captain} readonly={true} />
                                :
                                (
                                    props.mode === 'edit' && oldCaptain !== undefined
                                        ? <Autocomplete disablePortal
                                                        fullWidth
                                                        id="captain"
                                                        options={usersFromDB}
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
                                        : null
                                )
                        }

                    </div>

                    <FormButton text={props.mode === 'creation' ? 'Создать' : 'Сохранить'}
                                style={{
                                    padding: '0 2vw', fontSize: '1.5vw', height: '7vh', marginBottom: '2.5vh',
                                    filter: 'drop-shadow(0 3px 3px rgba(255, 255, 255, 0.2))'
                                }}/>
                </form>
            </PageWrapper>
        );
};

export default TeamCreator;