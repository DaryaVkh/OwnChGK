import React, {FC, useState} from 'react';
import classes from './team-creation.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import {TeamCreatorProps} from '../../entities/team-creation/team-creation.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {Alert, Autocomplete, TextField} from '@mui/material';
import {CustomInput} from '../../components/custom-input/custom-input';
import {createTeam, editTeam, getAll, getTeam, getUsersWithoutTeam} from '../../server-api/server-api';
import {useLocation, Redirect} from 'react-router-dom';

let teamName: string = '';
let oldTeamName: string = '';
let captain: string = '';

const TeamCreator: FC<TeamCreatorProps> = props => {
    const [usersFromDB, setUsersFromDB] = useState<string[]>([]);
    const [isUsersFound, setIsUsersFound] = useState(false);
    const [isCreatedSuccessfully, setIsCreatedSuccessfully] = useState(false);
    const [isNameInvalid, setIsNameInvalid] = useState(false);
    const [oldCaptain, setOldCaptain] = useState<string | undefined>(undefined);
    const [isOldCaptainFound, setOldCaptainFound] = useState(false);
    const location = useLocation<{ name: string }>();

    if (!isUsersFound && !isOldCaptainFound) {
        if (props.mode === 'edit') {
            teamName = location.state.name;
        }

        getUsersWithoutTeam().then(res => {
            if (res.status === 200) {
                res.json()
                    .then(({users}) => {
                        setIsUsersFound(true);
                        setUsersFromDB([...users]);
                        if (props.mode === 'edit') {
                            oldTeamName = location.state.name;
                            getTeam(teamName).then(res => {
                                if (res.status === 200) {
                                    res.json().then(data => {
                                        captain = data.captain;
                                        setOldCaptainFound(true);
                                        setOldCaptain(captain);
                                        setUsersFromDB([...users, captain]);
                                    })
                                }
                            })
                        }
                    });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });
    }

    const handleAutocompleteChange = (event: React.SyntheticEvent, value: string | null) => {
        captain = value as string;
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        teamName = event.target.value;
    }

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
    }

    return isCreatedSuccessfully
        ? <Redirect to={props.isAdmin ? '/admin/start-screen' : '/start-screen'}/>
        :
        (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={true}>
                    {
                        props.mode === 'creation'
                            ? <div className={classes.pageTitle}>Создание команды</div>
                            : <div className={classes.pageTitle}>Редактирование</div>
                    }
                </Header>

                <form className={classes.teamCreationForm} onSubmit={handleSubmit}>
                    <div className={classes.contentWrapper}>
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
                                     defaultValue={teamName}
                                     onChange={handleInputChange} isInvalid={isNameInvalid}/>

                        {props.mode === 'edit' && oldCaptain === undefined ?
                            null : <Autocomplete
                                disablePortal
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
                            />}

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