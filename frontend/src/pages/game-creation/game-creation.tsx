import React, {FC, useEffect, useState} from 'react';
import classes from './game-creation.module.scss';
import Header from '../../components/header/header';
import CustomCheckbox from '../../components/custom-checkbox/custom-checkbox';
import {Scrollbars} from 'rc-scrollbars';
import {GameCreatorProps} from '../../entities/game-creator/game-creator.interfaces';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {CustomInput} from '../../components/custom-input/custom-input';
import {createGame, editGame, GamePartSettings, getAll, getGame} from '../../server-api/server-api';
import {Redirect, useLocation} from 'react-router-dom';
import NavBar from '../../components/nav-bar/nav-bar';
import {Team} from '../admin-start-screen/admin-start-screen';
import {IconButton, InputAdornment, OutlinedInput, Skeleton} from '@mui/material';
import PageBackdrop from '../../components/backdrop/backdrop';
import Loader from '../../components/loader/loader';
import SearchIcon from '@mui/icons-material/Search';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import Modal from '../../components/modal/modal';
import Scrollbar from '../../components/scrollbar/scrollbar';

const GameCreator: FC<GameCreatorProps> = props => {
    const [teamsFromDB, setTeamsFromDB] = useState<Team[]>();
    const [isCreatedSuccessfully, setIsCreatedSuccessfully] = useState<boolean>(false);
    const location = useLocation<{ id: string, name: string }>();
    const [gameName, setGameName] = useState<string>(props.mode === 'edit' ? location.state.name : '');
    const [chosenTeams, setChosenTeams] = useState<string[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isGameNameInvalid, setIsGameNameInvalid] = useState<boolean>(false);
    const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isCancelled, setIsCancelled] = useState<boolean>(false);
    const [page, setPage] = useState<'main' | 'chgk-settings' | 'chgk-questions' | 'matrix-settings' | 'matrix-tours' | 'matrix-questions'>('main');
    const [chgkSettings, setChgkSettings] = useState<GamePartSettings | undefined>();
    const [tempChgkToursCount, setTempChgkToursCount] = useState<number | undefined>();
    const [tempChgkQuestionsCount, setTempChgkQuestionsCount] = useState<number | undefined>();
    const [tempChgkQuestions, setTempChgkQuestions] = useState<string[] | undefined>();
    const [tempMatrixToursCount, setTempMatrixToursCount] = useState<number | undefined>();
    const [tempMatrixQuestionsCount, setTempMatrixQuestionsCount] = useState<number | undefined>();
    const [tempMatrixQuestions, setTempMatrixQuestions] = useState<string[] | undefined>();
    const [tempMatrixTourNames, setTempMatrixTourNames] = useState<string[] | undefined>();
    const [matrixSettings, setMatrixSettings] = useState<GamePartSettings | undefined>();
    const [isDeleteChgkModalVisible, setIsDeleteChgkModalVisible] = useState<boolean>(false);
    const [isDeleteMatrixModalVisible, setIsDeleteMatrixModalVisible] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const oldGameId = props.mode === 'edit' ? location.state.id : '';

    if (teamsFromDB && (props.mode != 'edit' || chosenTeams) && isPageLoading) {
        teamsFromDB
            .sort((a: Team, b: Team) => chosenTeams?.includes(a.name) && chosenTeams?.includes(b.name) && a.name.toLowerCase() < b.name.toLowerCase()
            || chosenTeams?.includes(a.name) && !chosenTeams?.includes(b.name)
            || !chosenTeams?.includes(a.name) && !chosenTeams?.includes(b.name) && a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1);
        setIsPageLoading(false);
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
            getGame(oldGameId).then(res => {
                if (res.status === 200) {
                    res.json().then(({
                                         teams,
                                         chgkSettings,
                                         matrixSettings
                                     }) => {
                        setChgkSettings(chgkSettings);
                        setMatrixSettings(matrixSettings);
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
            return Array.from(Array(5).keys()).map(i => <Skeleton key={`team_skeleton_${i}`} variant='rectangular'
                                                                  width='90%' height='5vh'
                                                                  sx={{margin: '0 0.4vw 1.3vh 1.4vw'}}/>);
        }

        return teamsFromDB
            .map((team, index) => {
                return chosenTeams?.includes(team.name)
                    ? <CustomCheckbox name={team.name} key={team.id} checked={true} onChange={handleCheckboxChange}/>
                    : <CustomCheckbox name={team.name} key={team.id} onChange={handleCheckboxChange}/>;
            });
    };

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        if (!chgkSettings && !matrixSettings) {
            setSubmitted(true);
            return;
        }
        setIsLoading(true);
        if (props.mode === 'creation') {
            await createGame(gameName, chosenTeams ?? [], chgkSettings, matrixSettings)
                .then(res => {
                    if (res.status === 200) {
                        setIsCreatedSuccessfully(true);
                    } else {
                        setIsGameNameInvalid(true);
                        setIsLoading(false);
                    }
                });
        } else {
            await editGame(oldGameId, gameName, chosenTeams ?? [], chgkSettings, matrixSettings)
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

    const handleToursCountChange = (event: React.ChangeEvent<HTMLInputElement>, mode: 'chgk' | 'matrix') => {
        if (+event.target.value <= 99) {
            if (mode === 'chgk') {
                setTempChgkToursCount(+event.target.value);
            } else {
                setTempMatrixToursCount(+event.target.value);
            }
        }
    };

    const handleQuestionsCountChange = (event: React.ChangeEvent<HTMLInputElement>, mode: 'chgk' | 'matrix') => {
        if (+event.target.value <= 99) {
            if (mode === 'chgk') {
                setTempChgkQuestionsCount(+event.target.value);
            } else {
                setTempMatrixQuestionsCount(+event.target.value);
            }
        }
    };

    const setTourName = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        setTempMatrixTourNames(prevValue => prevValue?.map((tourName, i) => {
            if (i === index) {
                return event.target.value;
            } else {
                return tourName;
            }
        }));
    };

    const renderTourNameInputs = () => {
        return Array.from(Array(tempMatrixToursCount || matrixSettings?.roundCount || 0).keys()).map((index) => {
            return (
                <div className={classes.tourNameWrapper} key={`tourName_${index}`}>
                    <div className={classes.tourNumber}>{index + 1}</div>
                    <CustomInput type='text' id='tour-name' name='tour-name' placeholder='Название тура'
                                 value={tempMatrixTourNames?.[index]}
                                 onChange={(event) => setTourName(event, index)}
                                 isInvalid={submitted && !tempMatrixTourNames?.[index]}
                    />
                </div>
            );
        });
    };

    const renderPage = () => {
        switch (page) {
            case 'main':
                return (
                    <>
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
                                                                 style={{marginBottom: '10vh'}}
                                                                 isInvalid={isGameNameInvalid}
                                                                 errorHelperText='Игра с таким названием уже существует'
                                                                 onChange={handleGameNameChange}
                                                                 onFocus={() => setIsGameNameInvalid(false)}/>


                                                    <div className={classes.chgkWrapper}>
                                                        <img className={classes.chgkIcon}
                                                             src={require('../../images/IconChGK.svg').default} alt='logo'/>
                                                        <div className={classes.modeName}>ЧГК</div>
                                                        {
                                                            !chgkSettings
                                                                ?
                                                                <div className={classes.addModeButton} onClick={() => {
                                                                    setSubmitted(false);
                                                                    setPage('chgk-settings');
                                                                }}>+</div>
                                                                :
                                                                <div className={classes.iconsWrapper}>
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            setTempChgkQuestionsCount(chgkSettings?.questionCount);
                                                                            setTempChgkToursCount(chgkSettings?.roundCount);
                                                                            setTempChgkQuestions(chgkSettings?.questions);
                                                                            setPage('chgk-settings');
                                                                        }}
                                                                        edge="end"
                                                                        sx={{
                                                                            '& .MuiSvgIcon-root': {
                                                                                color: 'var(--background-color)',
                                                                                fontSize: '3.5vmin'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <EditOutlinedIcon/>
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={() => setIsDeleteChgkModalVisible(true)}
                                                                        edge="end"
                                                                        sx={{
                                                                            '& .MuiSvgIcon-root': {
                                                                                color: 'darkred',
                                                                                fontSize: '3.5vmin'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <HighlightOffOutlinedIcon/>
                                                                    </IconButton>
                                                                </div>
                                                        }
                                                    </div>

                                                    <div className={classes.matrixWrapper}>
                                                        <img className={classes.svoyakIcon}
                                                             src={require('../../images/IconSvoyak.svg').default} alt='logo'/>
                                                        <div className={classes.modeName}>Матрица</div>
                                                        {
                                                            !matrixSettings
                                                                ?
                                                                <div className={classes.addModeButton} onClick={() => {
                                                                    setSubmitted(false);
                                                                    setPage('matrix-settings');
                                                                }}>+</div>
                                                                :
                                                                <div className={classes.iconsWrapper}>
                                                                    <IconButton
                                                                        onClick={() => {
                                                                            setTempMatrixToursCount(matrixSettings?.roundCount);
                                                                            setTempMatrixQuestionsCount(matrixSettings?.questionCount);
                                                                            setTempMatrixTourNames(matrixSettings?.roundNames);
                                                                            setTempMatrixQuestions(matrixSettings?.questions);
                                                                            setPage('matrix-settings');
                                                                        }}
                                                                        edge="end"
                                                                        sx={{
                                                                            '& .MuiSvgIcon-root': {
                                                                                color: 'var(--background-color)',
                                                                                fontSize: '3.5vmin'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <EditOutlinedIcon/>
                                                                    </IconButton>
                                                                    <IconButton
                                                                        onClick={() => setIsDeleteMatrixModalVisible(true)}
                                                                        edge="end"
                                                                        sx={{
                                                                            '& .MuiSvgIcon-root': {
                                                                                color: 'darkred',
                                                                                fontSize: '3.5vmin'
                                                                            }
                                                                        }}
                                                                    >
                                                                        <HighlightOffOutlinedIcon/>
                                                                    </IconButton>
                                                                </div>
                                                        }
                                                    </div>
                                                    {
                                                        submitted && !matrixSettings && !chgkSettings
                                                            ? <small style={{color: '#FF0000', fontSize: '1vmax', marginTop: '-1.5vh'}}>Добавьте хотя бы один режим в игру</small>
                                                            : null
                                                    }
                                                </>
                                            )
                                            : (
                                                <>
                                                    <Skeleton variant='rectangular' width='100%' height='7vh'
                                                              style={{marginBottom: '3%'}}/>
                                                    <Skeleton variant='rectangular' width='100%' height='7vh'
                                                              style={{marginBottom: '3%'}}/>
                                                    <Skeleton variant='rectangular' width='100%' height='7vh'
                                                              style={{marginBottom: '3%'}}/>
                                                </>
                                            )
                                    }
                                </div>

                                <div className={classes.teamsWrapper}>
                                    <div className={classes.teamsLabel}>
                                        Команды
                                    </div>
                                    <div className={classes.searchWrapper}>
                                        <OutlinedInput className={classes.searchInput} value={searchQuery}
                                                       placeholder='Поиск'
                                                       onChange={(searchQuery: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(searchQuery.target.value)}
                                                       startAdornment={
                                                           <InputAdornment position='start'>
                                                               <SearchIcon sx={{
                                                                   fontSize: '3.5vmin'
                                                               }}/>
                                                           </InputAdornment>
                                                       } sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: '2px solid var(--foreground-color) !important',
                                                borderRadius: '9px',
                                                minHeight: '26px',
                                            }
                                        }}/>
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

                            <div className={classes.buttonsWrapper}>
                                <button type='submit' className={classes.createButton}>
                                    {props.mode === 'edit' ? 'Сохранить' : 'Создать'}
                                </button>

                                <button type='button' className={classes.undoButton} onClick={() => setIsCancelled(true)}>
                                    Отменить
                                </button>
                            </div>
                        </form>
                    </>
                );
            case 'chgk-settings':
                return (
                    <>
                        <p className={classes.gameSettingsPageTitle}>ЧГК</p>

                        <div className={classes.gameParamsWrapper}>
                            <div className={classes.toursCountWrapper}>
                                <label htmlFor="toursCount" className={classes.toursCountLabel}>Количество
                                    туров</label>
                                <input className={classes.toursCountInput}
                                       type="text"
                                       id="toursCount"
                                       name="toursCount"
                                       value={tempChgkToursCount || ''}
                                       placeholder='99'
                                       required={true}
                                       onChange={(event) => handleToursCountChange(event, 'chgk')}/>
                            </div>

                            <div className={classes.questionsCountWrapper}>
                                <label htmlFor="questionsCount" className={classes.questionsCountLabel}>Вопросов в
                                    туре</label>
                                <input className={classes.questionsCountInput}
                                       type="text"
                                       id="questionsCount"
                                       name="questionsCount"
                                       value={tempChgkQuestionsCount || ''}
                                       placeholder='99'
                                       required={true}
                                       onChange={(event) => handleQuestionsCountChange(event, 'chgk')}/>
                            </div>
                        </div>
                        {/*// TODO: добавление вопросов*/}
                        {/*<div className={classes.addButtonWrapper}>*/}
                        {/*    <button className={classes.addQuestionsButton} disabled={!chgkSettings?.questionsCount || !chgkSettings?.toursCount}*/}
                        {/*            onClick={() => setPage('chgk-questions')}>*/}
                        {/*        Добавить вопросы в игру*/}
                        {/*    </button>*/}
                        {/*</div>*/}

                        <div className={classes.gameParamsButtonsWrapper}>
                            <button type='submit' className={classes.createButton}
                                    disabled={(!tempChgkQuestionsCount || !tempChgkToursCount)}
                                    onClick={() => {
                                setChgkSettings(prevValue => {
                                    return {
                                        questionCount: tempChgkQuestionsCount || prevValue?.questionCount || 0,
                                        roundCount: tempChgkToursCount || prevValue?.roundCount || 0,
                                        questions: tempChgkQuestions || prevValue?.questions || []
                                    };
                                });
                                setTempChgkQuestionsCount(undefined);
                                setTempChgkToursCount(undefined);
                                setTempChgkQuestions(undefined);
                                setPage('main');
                            }}>
                                {props.mode === 'edit' ? 'Сохранить' : 'Создать'}
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempChgkToursCount(undefined);
                                setTempChgkQuestionsCount(undefined);
                                // setChgkSettings(undefined);
                                setPage('main');
                            }}>
                                Отменить
                            </button>
                        </div>
                    </>
                );
            case 'chgk-questions':
                return (
                    <>
                        <p className={classes.gameSettingsPageTitle}>ЧГК</p>

                        <div className={classes.gameParamsButtonsWrapper}>
                            <button type='submit' className={classes.createButton} onClick={() => setPage('main')}>
                                Сохранить
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempChgkToursCount(undefined);
                                setTempChgkQuestionsCount(undefined);
                                setTempChgkQuestions(undefined);
                                setPage('main');
                            }}>
                                Отменить
                            </button>
                        </div>
                    </>
                );
            case 'matrix-settings':
                return (
                    <>
                        <p className={classes.gameSettingsPageTitle}>Матрица</p>

                        <div className={classes.gameParamsWrapper}>
                            <div className={classes.toursCountWrapper}>
                                <label htmlFor="toursCount" className={classes.toursCountLabel}>Количество
                                    туров</label>
                                <input className={classes.toursCountInput}
                                       type="text"
                                       id="toursCount"
                                       name="toursCount"
                                       value={tempMatrixToursCount || ''}
                                       placeholder='99'
                                       required={true}
                                       onChange={(event) => handleToursCountChange(event, 'matrix')}/>
                            </div>

                            <div className={classes.questionsCountWrapper}>
                                <label htmlFor="questionsCount" className={classes.questionsCountLabel}>Вопросов в
                                    туре</label>
                                <input className={classes.questionsCountInput}
                                       type="text"
                                       id="questionsCount"
                                       name="questionsCount"
                                       value={tempMatrixQuestionsCount || ''}
                                       placeholder='99'
                                       required={true}
                                       onChange={(event) => handleQuestionsCountChange(event, 'matrix')}/>
                            </div>
                        </div>

                        <div className={classes.gameParamsButtonsWrapper}>
                            <button className={classes.createButton} disabled={!tempMatrixQuestionsCount || !tempMatrixToursCount}
                                    onClick={() => {
                                        setTempMatrixTourNames(prevValue => {
                                            return Array.from(Array(tempMatrixToursCount).keys()).map((i) => prevValue?.[i] || '')
                                        });
                                        setPage('matrix-tours');
                                    }}>
                                Далее
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempMatrixQuestionsCount(undefined);
                                setTempMatrixToursCount(undefined);
                                setPage('main');
                            }}>
                                Отменить
                            </button>
                        </div>
                    </>
                );
            case 'matrix-tours':
                return (
                    <>
                        <p className={classes.gameSettingsPageTitle}>Матрица</p>

                        <div className={classes.tourNamesWrapper}>
                            <Scrollbar>
                                {renderTourNameInputs()}
                            </Scrollbar>

                            {
                                submitted && tempMatrixTourNames?.filter(n => n === '').length
                                    ? <small style={{position: 'absolute', color: '#FF0000', bottom: '-7%', left: 0, fontSize: '1vmax'}}>Введите названия для всех туров</small>
                                    : null
                            }
                        </div>
                        {/*// TODO: добавление вопросов*/}
                        {/*<div className={classes.matrixQuestionsWrapper}>*/}
                        {/*    <button className={classes.addQuestionsButton} onClick={() => setPage('matrix-questions')}>*/}
                        {/*        Добавить вопросы в игру*/}
                        {/*    </button>*/}
                        {/*</div>*/}

                        <div className={classes.gameParamsButtonsWrapper}>
                            <button className={classes.createButton} onClick={() => {
                                if (!tempMatrixTourNames?.filter(n => n === '').length) {
                                    setMatrixSettings(prevValue => {
                                        return {
                                            questionCount: tempMatrixQuestionsCount || 0,
                                            roundCount: tempMatrixToursCount || 0,
                                            roundNames: tempMatrixTourNames || prevValue?.roundNames || [],
                                            questions: tempMatrixQuestions || prevValue?.questions || []
                                        };
                                    });
                                    setTempMatrixToursCount(undefined);
                                    setTempMatrixQuestionsCount(undefined);
                                    setTempMatrixQuestions(undefined);
                                    setTempMatrixTourNames(undefined);
                                    setPage('main');
                                    setSubmitted(false);
                                } else {
                                    setSubmitted(true);
                                }
                            }}>
                                {props.mode === 'edit' ? 'Сохранить' : 'Создать'}
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempMatrixTourNames(undefined);
                                setPage('matrix-settings');
                            }}>
                                Назад
                            </button>
                        </div>
                    </>
                );
            case 'matrix-questions':
                return (
                    <>
                    </>
                );
        }
    }

    if (isPageLoading) {
        return <Loader />;
    }

    if (isCancelled) {
        return <Redirect to={{pathname: '/admin/start-screen', state: {page: 'games'}}} />
    }

    return isCreatedSuccessfully
        ? <Redirect to={{pathname: props.isAdmin ? '/admin/start-screen' : '/start-screen', state: {page: 'games'}}}/>
        :
        (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={true}>
                    <NavBar isAdmin={props.isAdmin} page=''/>
                </Header>

                <div className={classes.pageWrapper}>
                    {renderPage()}
                </div>
                <PageBackdrop isOpen={isLoading}/>
                {
                    isDeleteChgkModalVisible
                        ? <Modal
                            modalType='delete-game-part'
                            itemForDeleteName='ЧГК из игры'
                            setGamePartUndefined={setChgkSettings}
                            closeModal={setIsDeleteChgkModalVisible}
                        />
                        : null
                }
                {
                    isDeleteMatrixModalVisible
                        ? <Modal
                            modalType='delete-game-part'
                            itemForDeleteName='матрицу из игры'
                            setGamePartUndefined={setMatrixSettings}
                            closeModal={setIsDeleteMatrixModalVisible}
                        />
                        : null
                }
            </PageWrapper>
        );
};

export default GameCreator;