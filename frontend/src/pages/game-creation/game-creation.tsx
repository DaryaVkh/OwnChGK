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
import {Skeleton} from '@mui/material';
import PageBackdrop from '../../components/backdrop/backdrop';
import Loader from "../../components/loader/loader";

const GameCreator: FC<GameCreatorProps> = props => {
    const [teamsFromDB, setTeamsFromDB] = useState<Team[]>();
    const [isCreatedSuccessfully, setIsCreatedSuccessfully] = useState<boolean>(false);
    const location = useLocation<{ id: string, name: string }>();
    const [gameName, setGameName] = useState<string>(props.mode === 'edit' ? location.state.name : '');
    const [questionsCount, setQuestionsCount] = useState<number>(0);
    const [toursCount, setToursCount] = useState<number>(0);
    const [chosenTeams, setChosenTeams] = useState<string[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGameNameInvalid, setIsGameNameInvalid] = useState<boolean>(false);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
    const oldGameId = props.mode === 'edit' ? location.state.id : '';

    if (teamsFromDB && (props.mode != 'edit' || chosenTeams) && isPageLoading) {
        setIsPageLoading(false);
    }

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
                    });
                }
            });
        }
    }, []);

    const handleCheckboxChange = (event: React.SyntheticEvent) => {
        const element = event.target as HTMLInputElement;
        if (element.checked) {
            setChosenTeams(teams => {
                if (teams) {
                    teams.push(element.name);
                } else {
                    teams = [element.name];
                }
                return teams;
            });
        } else if (chosenTeams?.includes(element.name)) {
            setChosenTeams(teams => {
                if (teams) {
                    teams.splice(teams.indexOf(element.name), 1);
                }
                return teams;
            });
        }
    };

    const renderTeams = () => {
        if (props.mode === 'edit' && !chosenTeams || !teamsFromDB) {
            return Array.from(Array(5).keys()).map(i => <Skeleton key={`team_skeleton_${i}`} variant='rectangular' width='90%' height='5vh' sx={{margin: '0 0.4vw 1.3vh 1.4vw'}} />);
        }

        return teamsFromDB
            .sort((a: Team, b: Team) => chosenTeams?.includes(a.name) && chosenTeams?.includes(b.name) && a.name.toLowerCase() < b.name.toLowerCase()
                || chosenTeams?.includes(a.name) && !chosenTeams?.includes(b.name)
                || !chosenTeams?.includes(a.name) && !chosenTeams?.includes(b.name) && a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)
            .map((team, index) => {
                return chosenTeams?.includes(team.name)
                    ? <CustomCheckbox name={team.name} key={index} checked={true} onChange={handleCheckboxChange}/>
                    : <CustomCheckbox name={team.name} key={index} onChange={handleCheckboxChange}/>;
            });
    };

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        setIsLoading(true);
        if (props.mode === 'creation') {
            await createGame(gameName, toursCount, questionsCount, chosenTeams ?? [])
                .then(res => {
                    if (res.status === 200) {
                        setIsCreatedSuccessfully(true);
                    } else {
                        setIsGameNameInvalid(true);
                        setIsLoading(false);
                    }
                });
        } else {
            await editGame(oldGameId, gameName, toursCount, questionsCount, chosenTeams ?? [])
                .then(res => {
                    if (res.status === 200) {
                        setIsCreatedSuccessfully(true);
                    } else {
                        setIsGameNameInvalid(true);
                        setIsLoading(false);
                    }
                });
        }
    };

    const handleGameNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGameName(event.target.value);
    };

    const handleToursCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (+event.target.value <= 99) {
            setToursCount(+event.target.value);
        }
    };

    const handleQuestionsCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (+event.target.value <= 99) {
            setQuestionsCount(+event.target.value);
        }
    };

    if (isPageLoading) {
        return <Loader />;
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

                                {
                                    (props.mode !== 'edit' || (props.mode === 'edit' && chosenTeams)) && teamsFromDB
                                        ? (
                                            <>
                                                <CustomInput type='text' id='gameName'
                                                             name='gameName'
                                                             placeholder='Название игры'
                                                             value={gameName}
                                                             defaultValue={gameName}
                                                             isInvalid={isGameNameInvalid}
                                                             errorHelperText='Игра с таким названием уже существует'
                                                             onChange={handleGameNameChange} />

                                                <div className={classes.toursCountWrapper}>
                                                    <label htmlFor="toursCount" className={classes.toursCountLabel}>Количество
                                                        туров</label>
                                                    <input className={classes.toursCountInput}
                                                           type="text"
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
                                                           type="text"
                                                           id="questionsCount"
                                                           name="questionsCount"
                                                           value={questionsCount || ''}
                                                           defaultValue={questionsCount || ''}
                                                           required={true}
                                                           onChange={handleQuestionsCountChange}/>
                                                </div>
                                            </>
                                        )
                                        : (
                                            <>
                                                <Skeleton variant='rectangular' width='100%' height='7vh' style={{marginBottom: '3%'}} />
                                                <Skeleton variant='rectangular' width='100%' height='7vh' style={{marginBottom: '3%'}} />
                                                <Skeleton variant='rectangular' width='100%' height='7vh' style={{marginBottom: '3%'}} />
                                            </>
                                        )
                                }
                            </div>

                            <div className={classes.teamsWrapper}>
                                <div className={classes.teamsLabel}>
                                    Команды
                                </div>
                                <div className={classes.teamsDiv}>
                                    <Scrollbars autoHide autoHideTimeout={500}
                                                autoHideDuration={200}
                                                renderThumbVertical={() => <div style={{
                                                    backgroundColor: 'white',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}/>}
                                                renderTrackHorizontal={props => <div {...props}
                                                                                     style={{display: 'none'}}/>}
                                                classes={{view: classes.scrollbarView}}>
                                        {renderTeams()}
                                    </Scrollbars>
                                </div>
                            </div>
                        </div>

                        <FormButton text={props.mode === 'creation' ? 'Создать' : 'Сохранить'} disabled={teamsFromDB === undefined}
                                    style={{
                                        padding: '0 2vw', fontSize: '1.5vw', height: '7vh', marginBottom: '2.5vh',
                                        filter: 'drop-shadow(0 3px 3px rgba(255, 255, 255, 0.2))'
                                    }}/>
                    </form>
                </div>
                <PageBackdrop isOpen={isLoading} />
            </PageWrapper>
        );
};

export default GameCreator;