import React, {FC, useState, useEffect} from 'react';
import classes from './game-creation.module.scss';
import Header from '../../components/header/header';
import {FormButton} from '../../components/form-button/form-button';
import CustomCheckbox from '../../components/custom-checkbox/custom-checkbox';
import {Scrollbars} from 'rc-scrollbars';
import {GameCreatorProps} from '../../entities/game-creator/game-creator.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {CustomInput} from '../../components/custom-input/custom-input';
import {getAll, getGame, createGame, editGame} from '../../server-api/server-api';
import {Redirect, useLocation} from 'react-router-dom';
import NavBar from "../../components/nav-bar/nav-bar";

let gameName: string = '';
let oldGameName: string = '';
let questionsCount: number = 0;
let toursCount: number = 0;
const teams: string[] = [];

const GameCreator: FC<GameCreatorProps> = props => {
    const [teamsFromDB, setTeamsFromDB] = useState([]);
    const [isCreatedSuccessfully, setIsCreatedSuccessfully] = useState(false);
    const location = useLocation<{ name: string }>();
    const [editingGameParams, setEditingGameParams] = useState<{
        toursCount: number,
        questionsCount: number,
        chosenTeams: string[] | undefined
    }>({
        toursCount: 0,
        questionsCount: 0,
        chosenTeams: undefined
    });

    if (props.mode === 'edit') {
        gameName = location.state.name;
        oldGameName = location.state.name;
    }

    useEffect(() => {
        getAll('/teams/').then(res => {
            if (res.status === 200) {
                res.json().then(({teams}) => {
                    setTeamsFromDB(teams);
                });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });

        if (props.mode === 'edit') {
            getGame(oldGameName).then(res => {
                if (res.status === 200) {
                    res.json().then(({
                                         teams,
                                         roundCount,
                                         questionCount
                                     }) => {
                        toursCount = roundCount;
                        questionsCount = questionCount;
                        setEditingGameParams({
                            toursCount: roundCount,
                            questionsCount: questionCount,
                            chosenTeams: teams
                        });
                    })
                }
            })
        }
    }, []);

    const handleCheckboxChange = (event: React.SyntheticEvent) => {
        let el = event.target as HTMLInputElement;
        if (el.checked) {
            teams.push(el.name);
        } else if (teams.includes(el.name)) {
            teams.splice(teams.indexOf(el.name), 1);
        }
    }

    const renderTeams = () => {
        if (props.mode === 'edit' && editingGameParams.chosenTeams === undefined) {
            return;
        }

        return teamsFromDB.map((name, index) => {
            return editingGameParams.chosenTeams?.includes(name)
                ? <CustomCheckbox name={name} key={index} checked={true} onChange={handleCheckboxChange}/>
                : <CustomCheckbox name={name} key={index} onChange={handleCheckboxChange}/>;
        })
    };

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (props.mode === 'creation') {
            await createGame(gameName, toursCount, questionsCount, teams)
                .then(res => {
                    if (res.status === 200) {
                        setIsCreatedSuccessfully(true);
                    }
                });
        } else {
            await editGame(oldGameName, gameName, toursCount, questionsCount, teams)
                .then(res => {
                    if (res.status === 200) {
                        setIsCreatedSuccessfully(true);
                    }
                });
        }
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

    return isCreatedSuccessfully
        ? <Redirect to={{pathname: props.isAdmin ? '/admin/start-screen' : '/start-screen', state: {page: 'games'}}}/>
        :
        (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={true}>
                    <NavBar isAdmin={props.isAdmin} page='' />
                </Header>

                <div className={classes.pageWrapper}>
                    {
                        props.mode === 'creation'
                            ? <p className={classes.pageTitle}>Создание игры</p>
                            : <p className={classes.pageTitle}>Редактирование</p>
                    }
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
                                           defaultValue={editingGameParams.toursCount || ''}
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
                                           defaultValue={editingGameParams.questionsCount || ''}
                                           required={true}
                                           onChange={handleQuestionsCountChange}/>
                                </div>
                            </div>

                            <div className={classes.teamsWrapper}>
                                <div className={classes.teamsLabel}>
                                    Команды
                                </div>

                                <div className={classes.teamsDiv}>
                                    <Scrollbars className={classes.scrollbar} autoHide autoHideTimeout={500}
                                                autoHideDuration={200} renderThumbVertical={() =>
                                        <div style={{backgroundColor: 'transparent'}}/>} renderTrackVertical={() =>
                                        <div style={{backgroundColor: 'transparent'}}/>}>

                                        {renderTeams()}

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
                </div>
            </PageWrapper>
        );
}

export default GameCreator;