import React, {FC, useEffect, useState} from 'react';
import classes from './admin-answers.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import Header from '../../components/header/header';
import {Link, useParams} from 'react-router-dom';
import CustomCheckbox from '../../components/custom-checkbox/custom-checkbox';
import {Scrollbars} from 'rc-scrollbars';
import _ from 'lodash';
import {AnswerType, Opposition, Page} from '../../entities/admin-answers-page/admin-answers-page.interfaces';
import Scrollbar from '../../components/scrollbar/scrollbar';
import {getCookie, getUrlForSocket} from '../../commonFunctions';
import Loader from "../../components/loader/loader";

let conn: WebSocket;
let ping: any;

const AdminAnswersPage: FC = () => {
    const {gameId} = useParams<{ gameId: string }>();
    const {tour, question} = useParams<{ tour: string, question: string }>();
    const [page, setPage] = useState<Page>('answers');
    const [answersType, setAnswersType] = useState<AnswerType>('unchecked');
    const [gameAnswers, setGameAnswers] = useState<string[]>([]); // Это accept + unchecked + rejected, нужно, чтобы считать
    const [acceptedAnswers, setAcceptedAnswers] = useState<string[]>([]);
    const [uncheckedAnswers, setUncheckedAnswers] = useState<string[]>([]);
    const [rejectedAnswers, setRejectedAnswers] = useState<string[]>([]);
    const [currentHandledAnswers, setCurrentHandledAnswers] = useState<string[]>([]);
    const [appeals, setAppeals] = useState<Opposition[]>([]);
    const [currentHandledAppeals, setCurrentHandledAppeals] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        function handleWindowResize() {
            const indicator = document.querySelector('#indicator') as HTMLSpanElement;
            const element = document.querySelector(`.${classes['is-active']}`) as HTMLElement;
            if (element) {
                indicator.style.width = `${element.offsetWidth}px`;
                indicator.style.left = `${element.offsetLeft}px`;
                indicator.style.backgroundColor = 'white';
            }
        }

        window.addEventListener('resize', handleWindowResize);

        conn = new WebSocket(getUrlForSocket());

        conn.onopen = () => {
            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getAnswers',
                'roundNumber': +tour,
                'questionNumber': +question,
            }));

            conn.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'getAppealsByNumber',
                'roundNumber': +tour,
                'questionNumber': +question,
            }));

            ping = setInterval(() => {
                conn.send(JSON.stringify({
                    'action': 'ping'
                }));
            }, 30000);
        }

        conn.onmessage = function (event) {
            const jsonMessage = JSON.parse(event.data);
            if (jsonMessage.action === 'answers') {
                setAcceptedAnswers(jsonMessage.acceptedAnswers);
                setRejectedAnswers(jsonMessage.rejectedAnswers);
                setUncheckedAnswers(jsonMessage.uncheckedAnswers);
                setGameAnswers([...jsonMessage.acceptedAnswers, ...jsonMessage.rejectedAnswers, ...jsonMessage.uncheckedAnswers]);
                setIsLoading(false);
            } else if (jsonMessage.action === 'appealsByNumber') {
                setAppeals(jsonMessage.appeals);
            }
        };

        return () => {
            clearInterval(ping);
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);

    useEffect(() => {
        if (!isLoading) {
            const indicator = document.querySelector('#indicator') as HTMLSpanElement;
            const activeItem = document.querySelector(`.${classes['is-active']}`) as HTMLElement;

            indicator.style.width = `${activeItem.offsetWidth}px`;
            indicator.style.left = `${activeItem.offsetLeft}px`;
            indicator.style.backgroundColor = 'white';
        }
    }, [isLoading])

    const handleCheckboxChange = (event: React.SyntheticEvent) => {
        const element = event.target as HTMLInputElement;
        if (currentHandledAnswers.includes(element.name)) {
            setCurrentHandledAnswers(prev => {
                prev.splice(prev.indexOf(element.name), 1);
                return prev;
            });
        } else {
            setCurrentHandledAnswers(prev => [...prev, element.name]);
        }
    };

    const handleAppealCheckboxChange = (event: React.SyntheticEvent) => {
        const element = event.target as HTMLInputElement;
        if (currentHandledAppeals.includes(element.name)) {
            setCurrentHandledAppeals(prev => {
                prev.splice(prev.indexOf(element.name), 1);
                return prev;
            });
        } else {
            setCurrentHandledAppeals(prev => [...prev, element.name]);
        }
    };

    const handleIndicator = (event: React.SyntheticEvent) => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const items = document.querySelectorAll(`.${classes['nav-item']}`);
        const el = event.target as HTMLElement;

        items.forEach(function (item) {
            item.classList.remove(classes['is-active']);
            item.removeAttribute('style');
        });

        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.left = `${el.offsetLeft}px`;
        indicator.style.backgroundColor = 'white';

        el.classList.add(classes['is-active']);
    };

    const changePageToAnswers = (event: React.SyntheticEvent) => {
        handleIndicator(event);
        setPage('answers');
    };

    const changePageToOppositions = (event: React.SyntheticEvent) => {
        handleIndicator(event);
        setPage('oppositions');
    };

    const getAnswers = (answers: string[], checked: boolean) => {
        const countedAnswers = _.countBy(gameAnswers);
        const answersForRender = Object.entries(countedAnswers).filter(el => answers.includes(el[0]));
        return answersForRender.map(([answer, count]: [string, number]) => {
            return (
                <div className={classes.answerWrapper} key={`${answersType}_${answer}`}>
                    <CustomCheckbox name={answer} checked={checked} onChange={handleCheckboxChange}
                                    style={{marginLeft: 0, marginBottom: 0, height: '6vh'}}/>
                    <div className={classes.answerCountWrapper}>{count}</div>
                </div>
            );
        });
    };

    const renderAnswers = () => {
        switch (answersType) {
            case 'accepted':
                return getAnswers(acceptedAnswers, true);
            case 'unchecked':
                return getAnswers(uncheckedAnswers, false);
            case 'rejected':
                return getAnswers(rejectedAnswers, false);
        }
    };

    const handleAnswerTypeChange = (event: React.SyntheticEvent) => {
        const clickedAnswerTypeElement = event.target as HTMLDivElement;
        setAnswersType(clickedAnswerTypeElement.id as AnswerType);
    };

    const handleSaveButtonClick = () => {
        switch (answersType) {
            case 'accepted':
                conn.send(JSON.stringify({
                    'cookie': getCookie('authorization'),
                    'action': 'RejectAnswer',
                    'roundNumber': tour,
                    'questionNumber': question,
                    'answers': currentHandledAnswers
                }));
                setRejectedAnswers(prev => [...prev, ...currentHandledAnswers]);
                setAcceptedAnswers(prev => prev.filter(el => !currentHandledAnswers.includes(el)));
                break;
            case 'unchecked':
                conn.send(JSON.stringify({
                    'cookie': getCookie('authorization'),
                    'action': 'AcceptAnswer',
                    'roundNumber': tour,
                    'questionNumber': question,
                    'answers': currentHandledAnswers
                }));
                conn.send(JSON.stringify({
                    'cookie': getCookie('authorization'),
                    'action': 'RejectAnswer',
                    'roundNumber': tour,
                    'questionNumber': question,
                    'answers': [...uncheckedAnswers.filter(el => !currentHandledAnswers.includes(el))]
                }));
                setAcceptedAnswers(prev => [...prev, ...currentHandledAnswers]);
                setRejectedAnswers(prev => [...prev, ...uncheckedAnswers.filter(el => !currentHandledAnswers.includes(el))]);
                setUncheckedAnswers([]);
                break;
            case 'rejected':
                conn.send(JSON.stringify({
                    'cookie': getCookie('authorization'),
                    'action': 'AcceptAnswer',
                    'roundNumber': tour,
                    'questionNumber': question,
                    'answers': currentHandledAnswers
                }));
                setAcceptedAnswers(prev => [...prev, ...currentHandledAnswers]);
                setRejectedAnswers(prev => prev.filter(el => !currentHandledAnswers.includes(el)));
                break;
        }
        setCurrentHandledAnswers([]);
    };

    const renderOppositions = () => {
        return appeals.map(op => {
            return (
                <div className={classes.oppositionWrapper} key={op.teamName}>
                    <p className={classes.teamName}>{op.teamName}</p>
                    <CustomCheckbox name={op.answer} style={{marginLeft: 0, marginBottom: 0, width: '100%'}}
                                    onChange={handleAppealCheckboxChange}/>
                    <div className={classes.explanation}>
                        <Scrollbars autoHide autoHideTimeout={500}
                                    autoHideDuration={200}
                                    renderThumbVertical={() => <div style={{
                                        backgroundColor: 'var(--background-color)',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}/>}
                                    renderTrackHorizontal={props => <div {...props} style={{display: 'none'}}/>}
                                    classes={{view: classes.scrollbarView}}>
                            {op.text}
                        </Scrollbars>
                    </div>
                </div>
            );
        });
    };

    const handleSaveOppositionButtonClick = () => {
        setAppeals([]);
        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'AcceptAppeals',
            'appeals': currentHandledAppeals,
            'roundNumber': tour,
            'questionNumber': question,
        }));

        conn.send(JSON.stringify({
            'cookie': getCookie('authorization'),
            'action': 'RejectAppeals',
            'appeals': [...appeals.map(el => el.answer).filter(el => !currentHandledAppeals.includes(el))],
            'roundNumber': tour,
            'questionNumber': question,
        }));
    };

    const renderPage = () => {
        switch (page) {
            case 'answers':
                return (
                    <div className={classes.sectionWrapper}>
                        <div className={classes.answersPageWrapper}>
                            <div className={classes.answerTypesWrapper}>
                                <div className={`${classes.answerType} ${answersType ===
                                'accepted' ? classes.activeAnswerType : ''}`} id="accepted"
                                     onClick={handleAnswerTypeChange}>принятые
                                </div>
                                <div className={`${classes.answerType} ${answersType ===
                                'unchecked' ? classes.activeAnswerType : ''}`} id="unchecked"
                                     onClick={handleAnswerTypeChange}>непроверенные
                                </div>
                                <div className={`${classes.answerType} ${answersType ===
                                'rejected' ? classes.activeAnswerType : ''}`} id="rejected"
                                     onClick={handleAnswerTypeChange}>отклоненные
                                </div>
                            </div>

                            <div className={classes.answersWrapper}>
                                <Scrollbar>
                                    {renderAnswers()}
                                </Scrollbar>
                            </div>

                            <div className={classes.saveButtonWrapper}>
                                <button className={classes.saveButton} onClick={handleSaveButtonClick}>Сохранить
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'oppositions':
                return (
                    <div className={classes.oppositionsPageWrapper}>
                        <div className={classes.oppositionsWrapper}>
                            <Scrollbars className={classes.scrollbar} autoHide autoHideTimeout={500}
                                        autoHideDuration={200}
                                        renderThumbVertical={() => <div style={{
                                            backgroundColor: 'white',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}/>}
                                        renderTrackHorizontal={props => <div {...props} style={{display: 'none'}}/>}
                                        classes={{view: classes.oppositionsScrollbarView}}>
                                {renderOppositions()}
                            </Scrollbars>
                        </div>

                        <div className={classes.saveOppositionButtonWrapper}>
                            <button className={classes.saveButton} onClick={handleSaveOppositionButtonClick}>Сохранить
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return isLoading ? <Loader /> : (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <Link to={`/admin/game/${gameId}`} className={classes.toGameLink}>В игру</Link>

                <div className={classes.tourNumber}>Тур {tour}</div>
                <div className={classes.questionNumber}>Вопрос {question}</div>

                <nav className={classes.nav}>
                    <Link to={{}}
                          className={`${classes['nav-item']} ${page === 'answers' ? classes['is-active'] : null}`}
                          onClick={changePageToAnswers}>Ответы</Link>
                    <Link to={{}}
                          className={`${classes['nav-item']} ${page === 'oppositions' ? classes['is-active'] : null}`}
                          onClick={changePageToOppositions}>
                        Апелляции {appeals.length !== 0 ? <b className={classes.opposition}>&#9679;</b> : ''}
                    </Link>
                    <span className={`${classes['nav-indicator']}`} id="indicator"/>
                </nav>
            </Header>

            {renderPage()}
        </PageWrapper>
    );
};

export default AdminAnswersPage;
