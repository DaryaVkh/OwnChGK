import React, {FC, useState} from 'react';
import classes from './game-creation.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import CustomCheckbox from '../../components/custom-checkbox/custom-checkbox';
import {Scrollbars} from 'rc-scrollbars';
import {GameCreatorProps} from '../../entities/game-creator/game-creator.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {CustomInput} from '../../components/custom-input/custom-input';
import {getAll} from '../../server-api/server-api';

const GameCreator: FC<GameCreatorProps> = props => {
    const [teamsFromDB, setTeamsFromDB] = useState([]);
    const [isTeamsFound, setIsTeamsFound] = useState(true);
    let gameName: string = '';
    let questionsCount: number = 0;
    let toursCount: number = 0;
    const teams: string[] = [];

    const chosenTeamsFromDB: string[] = [];

    if (!teamsFromDB || teamsFromDB.length < 1) {
        if (isTeamsFound) {
            getAll('/teams/').then(data => {
                if (data['teams'].length > 0) {
                    setTeamsFromDB(data['teams']);
                } else {
                    setIsTeamsFound(false);
                }
            });
        }
    }
    /*if (error) {
        error.message
    }*/ // TODO

    // получаем все команды из бд
    /*teamsFromDB.push(...['Команда 1', 'Команда 1', 'Команда 1', 'Сахара опять не будет', 'hdbfkjnakslkdsdlfnjkfvjkfdnklsnckjdsnvjkfdnjkfnv',
        'Команда 2', 'Не грози Южному автовокзалу', 'Ума палата №6', 'ЧКГ-шки ниндзя'])*/

    if (props.mode === 'edit') {
        // получаем все с бд: имя игры, которую редачим, количество туров, вопросов в туре
        // и ранее выбранные команды
        chosenTeamsFromDB.push(...['Команда 1', 'Сахара опять не будет']);
        gameName = 'ЧГК на конфУРе-2021';
        toursCount = 3;
        questionsCount = 10;
    }

    const handleCheckboxChange = (event: React.SyntheticEvent) => {
        let el = event.target as HTMLInputElement;
        if (el.checked) {
            teams.push(el.name);
        } else if (teams.includes(el.name)) {
            teams.splice(teams.indexOf(el.name), 1);
        }
    }

    const renderCommands = () => {
        return teamsFromDB.map((name, index) => {
            return chosenTeamsFromDB.includes(name)
                ? <CustomCheckbox name={name} key={index} checked={true} onChange={handleCheckboxChange}/>
                : <CustomCheckbox name={name} key={index} onChange={handleCheckboxChange}/>;
        })
    };

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        const request = await fetch('/games/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                gameName,
                toursCount,
                questionsCount,
                teams
            })
        });
    }

    const handleGameNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        gameName = event.target.value;
    }

    const handleToursCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        toursCount = +event.target.value;
    }

    const handleQuestionsCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        questionsCount = +event.target.value;
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                {
                    props.mode === 'creation'
                        ? <div className={classes.pageTitle}>Создание игры</div>
                        : <div className={classes.pageTitle}>Редактирование</div>
                }
            </Header>

            <form className={classes.gameCreationForm} onSubmit={handleSubmit}>
                <div className={classes.contentWrapper}>
                    <div className={classes.gameParametersWrapper}>
                        <CustomInput type="text" id="gameName"
                                     name="gameName"
                                     placeholder="Название игры"
                                     defaultValue={gameName}
                                     onChange={handleGameNameChange}/>

                        <div className={classes.toursCountWrapper}>
                            <label htmlFor="toursCount" className={classes.toursCountLabel}>Количество туров</label>
                            <input className={classes.toursCountInput}
                                   type="number"
                                   id="toursCount"
                                   name="toursCount"
                                   defaultValue={toursCount || ''}
                                   required={true}
                                   onChange={handleToursCountChange}/>
                        </div>

                        <div className={classes.questionsCountWrapper}>
                            <label htmlFor="questionsCount" className={classes.questionsCountLabel}>Вопросов в
                                туре</label>
                            <input className={classes.questionsCountInput}
                                   type="number"
                                   id="questionsCount"
                                   name="questionsCount"
                                   defaultValue={questionsCount || ''}
                                   required={true}
                                   onChange={handleQuestionsCountChange}/>
                        </div>
                    </div>

                    <div className={classes.commandsWrapper}>
                        <div className={classes.commandsLabel}>
                            Команды
                        </div>

                        <div className={classes.commandsDiv}>
                            <Scrollbars autoHide autoHideTimeout={500} autoHideDuration={200} renderThumbVertical={() =>
                                <div style={{backgroundColor: 'transparent'}}/>} renderTrackVertical={() =>
                                <div style={{backgroundColor: 'transparent'}}/>}>

                                {teamsFromDB ? renderCommands() : null}

                            </Scrollbars>
                        </div>
                    </div>
                </div>

                <FormButton text={props.mode === 'creation' ? 'Создать' : 'Сохранить'}
                            style={{
                                padding: '0 2vw', fontSize: '1.5vw', height: '7vh', marginBottom: '2.5vh',
                                filter: 'drop-shadow(0 3px 3px rgba(255, 255, 255, 0.2))'
                            }}/>
            </form>
        </PageWrapper>
    );
}

export default GameCreator;
