import React, {FC} from 'react';
import classes from './team-creation.module.scss';
import Header from "../../components/header/header";
import {FormButton} from "../../components/form-button/form-button";
import {CommandCreatorProps} from "../../entities/command-creation/command-creation.interfaces";
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import {FormInput} from "../../components/form-input/form-input";
import {IconButton, MenuItem, OutlinedInput, Select, SelectChangeEvent} from "@mui/material";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';

const CommandCreator: FC<CommandCreatorProps> = props => {
    const [captain, setCaptain] = React.useState('');

    const handleChange = (event: SelectChangeEvent) => {
        setCaptain(event.target.value);
    };

    // получаем чет из бд (имейлы и/или имена всех зареганых пользователей (потенциальных капитанов) без команды)
    let names = ["Даша", "Коля", "Саша", "Оля"];

    const renderCaptains = () => {
        return names.map((name) => (
            <MenuItem key={name} value={name}>
                {name}
            </MenuItem>
        ));
    }

    const handleAddPlayerClick = () => {

    }

    return (
        <PageWrapper>
            <Header isAdmin={true}>
                {
                    props.mode === 'creation'
                        ? <div className={classes.pageTitle}>Создание команды</div>
                        : <div className={classes.pageTitle}>Редактирование</div>
                }
            </Header>

            <form className={classes.teamCreationForm} action="teams/" method="post">
                <div className={classes.contentWrapper}>
                    <FormInput type='text' id='team-name' name='team-name' placeholder='Название' />

                    <Select
                        fullWidth
                        displayEmpty
                        value={captain}
                        onChange={handleChange}
                        input={<OutlinedInput />}
                        renderValue={(selected) => {
                            if (selected.length === 0) {
                                return <p style={{color: '#7B7C80'}}>Капитан</p>;
                            }
                            return selected;
                        }}
                        inputProps={{ 'aria-label': 'Without label' }}
                        IconComponent={ExpandMoreRoundedIcon}
                        sx={{
                            '& .MuiSvgIcon-root': {
                                fontSize: "2.2vw",
                                color: 'var(--foreground-color)'
                            },
                            border: 'none',
                            fontSize: '1.5vw',
                            height: '7vh',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            boxShadow: "inset 0 4px 10px rgba(0, 0, 0, 0.5)",
                            marginBottom: '3%',
                            '& .MuiSelect-select': {
                                padding: '0 1.7vw',
                                border: 'none',
                                fontFamily: 'Roboto, sans-serif',
                                color: 'black'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: '2px solid var(--foreground-color) !important',
                                borderRadius: '8px'
                            }
                        }}
                    >
                        {renderCaptains()}
                    </Select>

                    <div className={classes.playerAdding}>
                        <FormInput type='text' id='playerName' name='playerName' placeholder='Участник' style={{width: '85%'}} />

                        <IconButton sx={{marginLeft: '0.5vw', marginBottom: '0.3vh'}} onClick={handleAddPlayerClick}>
                            <PersonAddAltOutlinedIcon sx={{color: 'var(--foreground-color)', fontSize: '2.2vw'}} />
                        </IconButton>
                    </div>
                </div>

                <FormButton text={props.mode === 'creation' ? "Создать" : "Сохранить"}
                            style={{
                                padding: "0 2vw", fontSize: "1.5vw", height: "7vh", marginBottom: "2.5vh",
                                filter: "drop-shadow(0 3px 3px rgba(255, 255, 255, 0.2))"
                            }} />
            </form>
        </PageWrapper>
    );
};

export default CommandCreator;