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
import {IconButton, InputAdornment, OutlinedInput, Skeleton, TextareaAutosize} from '@mui/material';
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
    const [tempChgkRoundCount, setTempChgkRoundCount] = useState<number | undefined>();
    const [tempChgkQuestionsCount, setTempChgkQuestionsCount] = useState<number | undefined>();
    const [tempChgkQuestions, setTempChgkQuestions] = useState<Record<number, string[]> | undefined>();
    const [tempMatrixRoundCount, setTempMatrixRoundCount] = useState<number | undefined>();
    const [tempMatrixQuestionsCount, setTempMatrixQuestionsCount] = useState<number | undefined>();
    const [tempMatrixQuestions, setTempMatrixQuestions] = useState<Record<number, string[]> | undefined>();
    const [tempMatrixRoundNames, setTempMatrixRoundNames] = useState<string[] | undefined>();
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
            .filter(team => searchQuery.length < 1 || team.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((team, index) => {
                return chosenTeams?.includes(team.name)
                    ? <CustomCheckbox name={team.name} key={`${team.id}_${index}_chosen`} checked={true}
                                      onChange={handleCheckboxChange}/>
                    : <CustomCheckbox name={team.name} key={`${team.id}_${index}`} onChange={handleCheckboxChange}/>;
            });
    };

    const handleChgkQuestionChange = (event: React.ChangeEvent<HTMLTextAreaElement>, roundIndex: number, questionIndex: number) => {
        setTempChgkQuestions(prevState => {
            const newState = {...prevState};
            newState[roundIndex + 1][questionIndex] = event.target.value;
            return newState;
        });
    };

    const handleMatrixQuestionChange = (event: React.ChangeEvent<HTMLTextAreaElement>, roundIndex: number, questionIndex: number) => {
        setTempMatrixQuestions(prevState => {
            const newState = {...prevState};
            newState[roundIndex + 1][questionIndex] = event.target.value;
            return newState;
        });
    };

    const renderChgkQuestionInputs = () => {
        return Array.from(Array(tempChgkRoundCount).keys()).map((roundIndex) => {
            return (
                <div className={classes.tourQuestionInputsWrapper} key={`chgk_tour_${roundIndex + 1}`}>
                    <p className={classes.tourName}>{`Тур ${roundIndex + 1}`}</p>

                    {
                        Array.from(Array(tempChgkQuestionsCount).keys()).map((questionIndex) => (
                            <div className={classes.questionInputWrapper}
                                 key={`question_input_wrapper_${questionIndex + 1}`}>
                                <div className={classes.questionNumber}>{questionIndex + 1}</div>

                                <TextareaAutosize className={classes.questionInput} minRows={1}
                                                  value={tempChgkQuestions?.[roundIndex + 1]?.[questionIndex] || chgkSettings?.questions?.[roundIndex + 1]?.[questionIndex]}
                                                  onChange={(event) => handleChgkQuestionChange(event, roundIndex, questionIndex)}
                                />
                            </div>
                        ))
                    }
                </div>
            );
        });
    };

    const renderMatrixQuestionInputs = () => {
        return Array.from(Array(tempMatrixRoundCount).keys()).map((roundIndex) => {
            return (
                <div className={classes.tourQuestionInputsWrapper} key={`matrix_tour_${roundIndex + 1}`}>
                    <p className={classes.tourName}>{`Тур ${roundIndex + 1} — ${tempMatrixRoundNames?.[roundIndex]}`}</p>

                    {
                        Array.from(Array(tempMatrixQuestionsCount).keys()).map((questionIndex) => (
                            <div className={classes.questionInputWrapper}
                                 key={`question_input_wrapper_${questionIndex + 1}`}>
                                <div className={classes.questionNumber}>{questionIndex + 1}</div>

                                <TextareaAutosize className={classes.questionInput} minRows={1}
                                                  value={tempMatrixQuestions?.[roundIndex + 1][questionIndex] || matrixSettings?.questions?.[roundIndex + 1]?.[questionIndex]}
                                                  onChange={(event) => handleMatrixQuestionChange(event, roundIndex, questionIndex)}
                                />
                            </div>
                        ))
                    }
                </div>
            );
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
                setTempChgkRoundCount(+event.target.value);
            } else {
                setTempMatrixRoundCount(+event.target.value);
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
        setTempMatrixRoundNames(prevValue => prevValue?.map((tourName, i) => {
            if (i === index) {
                return event.target.value;
            } else {
                return tourName;
            }
        }));
    };

    const renderRoundNameInputs = () => {
        return Array.from(Array(tempMatrixRoundCount || matrixSettings?.roundCount || 0).keys()).map((index) => {
            return (
                <div className={classes.tourNameWrapper} key={`matrixTourName_${index}`}>
                    <div className={classes.tourNumber}>{index + 1}</div>
                    <CustomInput type='text' id='tour-name' name='tour-name' placeholder='Название тура'
                                 value={tempMatrixRoundNames?.[index]}
                                 onChange={(event) => setTourName(event, index)}
                                 isInvalid={submitted && !tempMatrixRoundNames?.[index]}/>
                </div>
            );
        });
    };

    const renderPage = () => {
        switch (page) {
            case 'main':
                return (
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
                                                                            setTempChgkRoundCount(chgkSettings?.roundCount);
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
                                                             src={require('../../images/IconSvoyak.svg').default}
                                                             alt='logo'/>
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
                                                                            setTempMatrixRoundCount(matrixSettings?.roundCount);
                                                                            setTempMatrixQuestionsCount(matrixSettings?.questionCount);
                                                                            setTempMatrixRoundNames(matrixSettings?.roundNames);
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
                                                            ? <small style={{
                                                                color: '#FF0000',
                                                                fontSize: '1vmax',
                                                                marginTop: '-1.5vh'
                                                            }}>Добавьте хотя бы один режим в игру</small>
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

                                <button type='button' className={classes.undoButton}
                                        onClick={() => setIsCancelled(true)}>
                                    Отменить
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'chgk-settings':
                return (
                    <div className={classes.pageWrapper}>
                        <p className={classes.gameSettingsPageTitle}>ЧГК</p>

                        <div className={classes.gameParamsWrapper}>
                            <div className={classes.toursCountWrapper}>
                                <label htmlFor="toursCount" className={classes.toursCountLabel}>Количество
                                    туров</label>
                                <input className={classes.toursCountInput}
                                       type="text"
                                       id="toursCount"
                                       name="toursCount"
                                       value={tempChgkRoundCount || ''}
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
                        <div className={classes.addButtonWrapper}>
                            <button className={classes.addQuestionsButton}
                                    disabled={!tempChgkQuestionsCount || !tempChgkRoundCount}
                                    onClick={() => {
                                        if (!tempChgkQuestions || !Object.values(tempChgkQuestions).length) {
                                            const questions: Record<number, string[]> = {};
                                            for (let i = 0; i < (tempChgkRoundCount || 0); i++) {
                                                questions[i + 1] = new Array(tempChgkQuestionsCount).fill('');
                                            }
                                            setTempChgkQuestions(questions);
                                        }
                                        setPage('chgk-questions');
                                    }}>
                                Добавить вопросы в игру
                            </button>
                        </div>

                        <div className={classes.gameParamsButtonsWrapper}>
                            <button type='submit' className={classes.createButton}
                                    disabled={(!tempChgkQuestionsCount || !tempChgkRoundCount)}
                                    onClick={() => {
                                        setChgkSettings(prevValue => {
                                            return {
                                                questionCount: tempChgkQuestionsCount || prevValue?.questionCount || 0,
                                                roundCount: tempChgkRoundCount || prevValue?.roundCount || 0,
                                                questions: tempChgkQuestions || prevValue?.questions || {}
                                            };
                                        });
                                        setTempChgkQuestionsCount(undefined);
                                        setTempChgkRoundCount(undefined);
                                        setTempChgkQuestions(undefined);
                                        setPage('main');
                                    }}>
                                {props.mode === 'edit' ? 'Сохранить' : 'Создать'}
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempChgkRoundCount(undefined);
                                setTempChgkQuestionsCount(undefined);
                                setPage('main');
                            }}>
                                Отменить
                            </button>
                        </div>
                    </div>
                );
            case 'chgk-questions':
                return (
                    <div className={classes.questionsWrapper}>
                        <p className={classes.gameSettingsPageTitle}>ЧГК</p>

                        <div className={classes.questionInputsWrapper}>
                            <Scrollbar>
                                {renderChgkQuestionInputs()}
                            </Scrollbar>
                        </div>

                        <div className={classes.buttonsWrapper}>
                            <button type='submit' className={classes.createButton} onClick={() => {
                                setPage('chgk-settings');
                            }}>
                                Сохранить
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempChgkQuestions(undefined);
                                setPage('chgk-settings');
                            }}>
                                Отменить
                            </button>
                        </div>
                    </div>
                );
            case 'matrix-settings':
                return (
                    <div className={classes.pageWrapper}>
                        <p className={classes.gameSettingsPageTitle}>Матрица</p>

                        <div className={classes.gameParamsWrapper}>
                            <div className={classes.toursCountWrapper}>
                                <label htmlFor="toursCount" className={classes.toursCountLabel}>Количество
                                    туров</label>
                                <input className={classes.toursCountInput}
                                       type="text"
                                       id="toursCount"
                                       name="toursCount"
                                       value={tempMatrixRoundCount || ''}
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
                            <button className={classes.createButton}
                                    disabled={!tempMatrixQuestionsCount || !tempMatrixRoundCount}
                                    onClick={() => {
                                        setTempMatrixRoundNames(prevValue => {
                                            return Array.from(Array(tempMatrixRoundCount).keys()).map((i) => prevValue?.[i] || matrixSettings?.roundNames?.[i] || '')
                                        });
                                        setPage('matrix-tours');
                                    }}>
                                Далее
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempMatrixQuestionsCount(undefined);
                                setTempMatrixRoundCount(undefined);
                                setTempMatrixRoundNames(undefined);
                                setPage('main');
                            }}>
                                Отменить
                            </button>
                        </div>
                    </div>
                );
            case 'matrix-tours':
                return (
                    <div className={classes.pageWrapper}>
                        <p className={classes.gameSettingsPageTitle}>Матрица</p>

                        <div className={classes.tourNamesWrapper}>
                            <Scrollbar>
                                {renderRoundNameInputs()}
                            </Scrollbar>

                            {
                                submitted && tempMatrixRoundNames?.filter(n => n === '').length
                                    ? <small style={{
                                        position: 'absolute',
                                        color: '#FF0000',
                                        bottom: '-7%',
                                        left: 0,
                                        fontSize: '1vmax'
                                    }}>Введите названия для всех туров</small>
                                    : null
                            }
                        </div>
                        <div className={classes.matrixQuestionsWrapper}>
                            <button className={classes.addQuestionsButton}
                                    disabled={!!(tempMatrixRoundNames?.filter(n => n === '').length)}
                                    onClick={() => {
                                        if (!tempMatrixQuestions || !Object.values(tempMatrixQuestions).length) {
                                            const questions: Record<number, string[]> = {};
                                            for (let i = 0; i < (tempMatrixRoundCount || 0); i++) {
                                                questions[i + 1] = new Array(tempMatrixQuestionsCount).fill('');
                                            }
                                            setTempMatrixQuestions(questions);
                                        }
                                        setPage('matrix-questions');
                                    }}>
                                Добавить вопросы в игру
                            </button>
                        </div>

                        <div className={classes.gameParamsButtonsWrapper}>
                            <button className={classes.createButton} onClick={() => {
                                if (!tempMatrixRoundNames?.filter(n => n === '').length) {
                                    setMatrixSettings(prevValue => {
                                        return {
                                            questionCount: tempMatrixQuestionsCount || 0,
                                            roundCount: tempMatrixRoundCount || 0,
                                            roundNames: tempMatrixRoundNames || prevValue?.roundNames || [],
                                            questions: tempMatrixQuestions || prevValue?.questions || {}
                                        };
                                    });
                                    setTempMatrixRoundCount(undefined);
                                    setTempMatrixQuestionsCount(undefined);
                                    setTempMatrixQuestions(undefined);
                                    setTempMatrixRoundNames(undefined);
                                    setPage('main');
                                    setSubmitted(false);
                                } else {
                                    setSubmitted(true);
                                }
                            }}>
                                {props.mode === 'edit' ? 'Сохранить' : 'Создать'}
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempMatrixRoundNames(undefined);
                                setPage('matrix-settings');
                            }}>
                                Назад
                            </button>
                        </div>
                    </div>
                );
            case 'matrix-questions':
                return (
                    <div className={classes.questionsWrapper}>
                        <p className={classes.gameSettingsPageTitle}>Матрица</p>

                        <div className={classes.questionInputsWrapper}>
                            <Scrollbar>
                                {renderMatrixQuestionInputs()}
                            </Scrollbar>
                        </div>

                        <div className={classes.buttonsWrapper}>
                            <button type='submit' className={classes.createButton} onClick={() => {
                                setPage('matrix-tours');
                            }}>
                                Сохранить
                            </button>

                            <button type='button' className={classes.undoButton} onClick={() => {
                                setTempMatrixQuestions(undefined);
                                setPage('matrix-tours');
                            }}>
                                Отменить
                            </button>
                        </div>
                    </div>
                );
        }
    }

    if (isPageLoading) {
        return <Loader/>;
    }

    if (isCancelled) {
        return <Redirect to={{pathname: '/admin/start-screen', state: {page: 'games'}}}/>
    }

    return isCreatedSuccessfully
        ? <Redirect to={{pathname: props.isAdmin ? '/admin/start-screen' : '/start-screen', state: {page: 'games'}}}/>
        :
        (
            <PageWrapper>
                <Header isAuthorized={true} isAdmin={true}>
                    <NavBar isAdmin={props.isAdmin} page=''/>
                </Header>

                {renderPage()}

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
