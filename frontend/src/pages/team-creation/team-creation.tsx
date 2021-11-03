import React, {FC, useState} from 'react';
import classes from './team-creation.module.scss';
import Header from "../../components/header/header";
import {FormButton} from "../../components/form-button/form-button";
import {CommandCreatorProps} from "../../entities/command-creation/command-creation.interfaces";
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import {Autocomplete, TextField} from "@mui/material";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {CustomInput} from "../../components/custom-input/custom-input";
import {getAll} from '../../server-api/server-api';

const CommandCreator: FC<CommandCreatorProps> = props => {
    const [usersFromDB, setUsersFromDB] = useState([]);
    const [isUsersFound, setIsUsersFound] = useState(true);
    let teamName: string = '';
    let captain: string = '';

    if (!usersFromDB || usersFromDB.length < 1) {
        if (isUsersFound) {
            getAll('/users/').then(data => {
                if (data['users'].length > 0) {
                    setUsersFromDB(data['users']);
                } else {
                    setIsUsersFound(false);
                }
            });
        }
    }

    // получаем чет из бд (имейлы и/или имена всех зареганых пользователей (потенциальных капитанов) без команды)
    /*let usersFromDB = ["Даша", "Коля", "Саша", "Оля"];*/

    if (props.mode === 'edit') {
        // получаем из бд имя команды и капитана, выбранные ранее
        teamName = 'Сахара опять не будет';
        captain = 'Коля';
    }

    const handleAutocompleteChange = (event: React.SyntheticEvent, value: string | null) => {
        captain = value as string;
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        teamName = event.target.value;
    }

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        const request = await fetch('/teams/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                teamName,
                captain
            })
        });
    }

    return (
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
                    <CustomInput type='text' id='teamName' name='teamName' placeholder='Название' defaultValue={teamName}
                                 onChange={handleInputChange}/>

                    <Autocomplete
                        disablePortal
                        fullWidth
                        id="captain"
                        options={usersFromDB}
                        defaultValue={captain}
                        onChange={handleAutocompleteChange}
                        popupIcon={<ExpandMoreRoundedIcon fontSize={'medium'}
                            sx={{fontSize: "2.2vw",
                                color: 'var(--foreground-color)'}}
                        />}
                        sx={{
                            border: 'none',
                            fontSize: '1.5vw',
                            minHeight: '26px',
                            height: '7vh !important',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            boxShadow: "inset 0 4px 10px rgba(0, 0, 0, 0.5)",
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
                            }
                        }}
                        renderInput={(params) => <TextField {...params} placeholder="Капитан" />}
                    />
                </div>

                <FormButton text={props.mode === 'creation' ? "Создать" : "Сохранить"}
                            style={{
                                padding: "0 2vw", fontSize: "1.5vw", height: "7vh", marginBottom: "2.5vh",
                                filter: "drop-shadow(0 3px 3px rgba(255, 255, 255, 0.2))"
                            }}/>
            </form>
        </PageWrapper>
    );
};

export default CommandCreator;