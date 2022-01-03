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
import NavBar from '../../components/nav-bar/nav-bar';
import {Team} from '../admin-start-screen/admin-start-screen';

const GameCreator: FC<GameCreatorProps> = props => {
    const [teamsFromDB, setTeamsFromDB] = useState<Team[]>([]);
    const [isCreatedSuccessfully, setIsCreatedSuccessfully] = useState(false);
    const location = useLocation<{ id: string, name: string }>();
    const oldGameId = props.mode === 'edit' ? location.state.id : '';
    const [gameName, setGameName] = useState(props.mode === 'edit' ? location.state.name : '');
    const [questionsCount, setQuestionsCount] = useState(0);
    const [toursCount, setToursCount] = useState(0);
    const [chosenTeams, setChosenTeams] = useState<string[] | undefined>(undefined);

    useEffect(() => {
        getAll('/teams/').then(res => {
            if (res.status === 200) {
                res.json().then(({teams: t}) => {
                    setTeamsFromDB(t);
                });
            } else {
                // TODO: код не 200, мейби всплывашку, что что-то не так?
            }
        });

        if (props.mode === 'edit') {
            getGame(oldGameId).then(res => {
                if (res.status === 200) {
                    res.json().then(({
                                         teams,
                                         roundCount,
                                         questionCount
                                     }) => {
                        setToursCount(roundCount);
                        setQuestionsCount(questionCount);
                        setChosenTeams(teams);
                    })
                }
            })
        }
    }, []);

    const handleCheckboxChange = (event: React.SyntheticEvent) => {
        const element = event.target as HTMLInputElement;
        if (chosenTeams) {
            if (element.checked) {
                chosenTeams.push(element.name);
            } else if (chosenTeams.includes(element.name)) {
                chosenTeams.splice(chosenTeams.indexOf(element.name), 1);
            }
        }
    }

    const renderTeams = () => {
        if (props.mode === 'edit' && chosenTeams === undefined) {
            return;
        }

        return teamsFromDB.map((team, index) => {
            return chosenTeams?.includes(team.name)
                ? <CustomCheckbox name={team.name} key={index} checked={true} onChange={handleCheckboxChange}/>
                : <CustomCheckbox name={team.name} key={index} onChange={handleCheckboxChange}/>;
        })
    };
    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (props.mode === 'creation') {
            await createGame(gameName, toursCount, questionsCount, chosenTeams ?? [])
                .then(res => {
                    if (res.status === 200) {
                        setIsCreatedSuccessfully(true);
                    }
                });
        } else {
            await editGame(oldGameId, gameName, toursCount, questionsCount, chosenTeams ?? [])
                .then(res => {
                    if (res.status === 200) {
                        setIsCreatedSuccessfully(true);
                    }
                });
        }
    }

    const handleGameNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGameName(event.target.value);
    }

    const handleToursCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setToursCount(+event.target.value);
    }

    const handleQuestionsCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuestionsCount(+event.target.value);
    }

    return isCreatedSuccessfully
        ? <Redirect to={{pathname: props.isAdmin ? '/admin/start-screen' : '/start-screen', state: {page: 'games'}}}/>
        :
        (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={true}>
                    <NavBar isAdmin={props.isAdmin} page=""/>
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
                                             value={gameName}
                                             defaultValue={gameName}
                                             onChange={handleGameNameChange}/>

                                <div className={classes.toursCountWrapper}>
                                    <label htmlFor="toursCount" className={classes.toursCountLabel}>Количество
                                        туров</label>
                                    <input className={classes.toursCountInput}
                                           type="number"
                                           id="toursCount"
                                           name="toursCount"
                                           value={toursCount || ''}
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
                                           value={questionsCount || ''}
                                           defaultValue={questionsCount || ''}
                                           required={true}
                                           onChange={handleQuestionsCountChange}/>
                                </div>
                            </div>

                            <div className={classes.teamsWrapper}>
                                <div className={classes.teamsLabel}>
                                    Команды
                                </div>
                                <div className={classes.teamsDiv}>
                                    <Scrollbars autoHide autoHideTimeout={500}
                                                autoHideDuration={200}
                                                renderThumbVertical={() => <div style={{backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer'}}/>}
                                                renderTrackHorizontal={props => <div {...props} style={{display: 'none'}} />}
                                                classes={{view: classes.scrollbarView}}>
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