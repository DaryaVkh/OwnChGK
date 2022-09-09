import React, {FC, useEffect, useState} from 'react';
import classes from './rating.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {GameParams, RatingProps, TeamResult, Tour} from '../../entities/rating/rating.interfaces';
import Header from '../../components/header/header';
import {Scrollbars} from 'rc-scrollbars';
import {Table, TableBody, TableCell, tableCellClasses, TableHead, TableRow} from '@mui/material';
import {TeamTableRow, TourHeaderCell} from '../../components/table/table';
import {Link, useParams} from 'react-router-dom';
import {
    changeIntrigueGameStatus,
    getResultTable,
    getResultTableFormat,
    getTeamsParticipantTable
} from '../../server-api/server-api';
import Loader from '../../components/loader/loader';
import MobileNavbar from '../../components/mobile-navbar/mobile-navbar';
import {createFileLink} from '../../fileWorker';

const Rating: FC<RatingProps> = props => {
    const {gameId} = useParams<{ gameId: string }>();
    const [gameParams, setGameParams] = useState<GameParams>();
    const [teams, setTeams] = useState<TeamResult[]>();
    const [expandedTours, setExpandedTours] = useState<boolean[]>([]);
    const [isIntrigue, setIsIntrigue] = useState(false);
    const [isFullGame, setIsFullGame] = useState(false);
    const [mediaMatch, setMediaMatch] = useState<MediaQueryList>(window.matchMedia('(max-width: 600px)'));

    useEffect(() => {
        const resizeEventHandler = () => {
            setMediaMatch(window.matchMedia('(max-width: 600px)'));
        }

        mediaMatch.addEventListener('change', resizeEventHandler);

        return () => {
            mediaMatch.removeEventListener('change', resizeEventHandler);
        };
    }, []);

    const headerTableCellStyles = {
        color: 'white',
        fontSize: '1.5vw',
        fontWeight: '700',
    };

    useEffect(() => {
        getResultTable(gameId).then(res => {
            if (res.status === 200) {
                res.json().then(({
                                     isIntrigue,
                                     roundsCount,
                                     questionsCount,
                                     totalScoreForAllTeams,
                                     matrixSums,
                                 }) => {
                    setIsIntrigue(isIntrigue);
                    setGameParams({toursCount: roundsCount, questionsCount: questionsCount});
                    setExpandedTours(new Array(roundsCount).fill(false));
                    if (matrixSums) {
                        setIsFullGame(true);
                    }

                    const result = [];
                    const teams = Object.keys(totalScoreForAllTeams);
                    for (const team of teams) {
                        result.push({
                            teamName: team,
                            matrixSum: matrixSums?.[team],
                            toursWithResults: totalScoreForAllTeams[team],
                        })
                    }
                    setTeams(result);
                });
            }
        })
    }, []);

    const renderTourHeaders = () => {
        if (!gameParams || !expandedTours) {
            return;
        }
        return Array.from(Array(gameParams.toursCount).keys()).map(i => <TourHeaderCell tourNumber={i + 1}
                                                                                        questionsCount={gameParams.questionsCount}
                                                                                        key={`tourTableCell_${i}`}
                                                                                        isExpanded={expandedTours[i]}
                                                                                        setIsExpanded={setExpandedTours}/>);
    };

    const countSums = (toursWithResults: Tour[]) => {
        let sums = [];
        for (let tour of toursWithResults) {
            sums.push(tour.reduce((a, b) => a + b));
        }
        return sums;
    };

    const renderTeams = () => {
        if (!teams) {
            return;
        }

        teams.sort((a, b) => {
            const firstSum = countSums(a.toursWithResults).reduce((x, y) => x + y);
            const secondSum = countSums(b.toursWithResults).reduce((x, y) => x + y);
            return firstSum < secondSum ? 1 : (firstSum > secondSum ? -1 : (a.matrixSum < b.matrixSum ? 1 : -1));
        });

        return teams.map((teamResult, i) => {
            return <TeamTableRow key={teamResult.teamName} place={isIntrigue && !props.isAdmin ? '-' : i + 1} teamName={teamResult.teamName}
                                 matrixSum={teamResult.matrixSum}
                                 toursWithResults={teamResult.toursWithResults} isExpanded={expandedTours}
                                 gameId={gameId}
                                 isAdmin={props.isAdmin}
            />
        });
    };

    const turnOnIntrigue = () => {
        if (!isIntrigue) {
            changeIntrigueGameStatus(gameId, true).then(res => {
                if (res.status === 200) {
                    setIsIntrigue(true);
                }
            })
        } else {
            changeIntrigueGameStatus(gameId, false).then(res => {
                if (res.status === 200) {
                    setIsIntrigue(false);
                }
            })
        }
    }

    const downloadResults = async () => {
        getResultTableFormat(gameId).then(res => {
            if (res.status === 200) {
                res.json().then(({totalTable}) => {
                    createFileLink(totalTable, `game-${gameId}-result.csv`);
                });
            }
        })
    }

    const downloadTeams = async () => {
        getTeamsParticipantTable(gameId).then(res => {
            if (res.status === 200) {
                res.json().then(({participants}) => {
                    createFileLink(participants, `game-${gameId}-participants.csv`);
                });
            }
        })
    }

    if (!teams || !expandedTours || !gameParams) {
        return <Loader />;
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={props.isAdmin}>
                {
                    !mediaMatch.matches
                        ? <Link to={props.isAdmin ? `/admin/game/${gameId}` : `/game/${gameId}`} className={classes.menuLink}>В игру</Link>
                        : null
                }

                <div className={classes.pageTitle}>Рейтинг</div>
            </Header>

            {
                mediaMatch.matches
                    ? <MobileNavbar isGame={true} isAdmin={false} page='' toGame={true} gameId={gameId} />
                    : null
            }
            <div className={classes.contentWrapper}>
                <div className={classes.buttonsWrapper}>
                    {
                        props.isAdmin
                            ? <button className={classes.button}
                                      onClick={turnOnIntrigue}>{isIntrigue ? 'Выключить «Интригу»' : 'Включить «Интригу»'}</button>
                            : null
                    }

                    <div>
                        <button className={`${classes.button} ${classes.downloadResultsButton}`} onClick={downloadResults}>Скачать результаты</button>
                        {
                            props.isAdmin
                                ? <button className={classes.button} onClick={downloadTeams}>Скачать список команд</button>
                                : null
                        }
                    </div>

                    {
                        isIntrigue && !props.isAdmin
                            ? <p className={classes.intrigueParagraph}>Включен режим «Интрига»</p>
                            : null
                    }
                </div>

                <div className={classes.tableWrapper}>
                    <Scrollbars autoHide autoHideTimeout={500}
                                autoHideDuration={200}
                                renderThumbVertical={() => <div style={{
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}/>}
                                renderThumbHorizontal={props => <div {...props} style={{
                                    backgroundColor: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    height: '5px'
                                }}/>}
                                classes={{view: classes.scrollbarView}}>
                        <Table
                            sx={{
                                width: 'unset',

                                [`& .${tableCellClasses.root}`]: {
                                    borderBottom: 'none',
                                    padding: 0
                                },

                                [`& .${tableCellClasses.head}`]: {
                                    paddingBottom: '2.5vh'
                                },

                                [`& .${tableCellClasses.body}`]: {
                                    paddingBottom: '1vh'
                                },
                            }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={headerTableCellStyles} align="center" variant="head"
                                               style={{
                                                   fontSize: mediaMatch.matches ? '2vmax' : '1.5vw',
                                                   minWidth: mediaMatch.matches ? '20vw' : '8vw',
                                                   maxWidth: mediaMatch.matches ? '20vw' : '8vw'
                                               }}>Место</TableCell>
                                    <TableCell sx={headerTableCellStyles} align="left" variant="head"
                                               style={{
                                                   fontSize: mediaMatch.matches ? '2vmax' : '1.5vw',
                                                   minWidth: mediaMatch.matches ? '40vw' : '16vw',
                                                   maxWidth: mediaMatch.matches ? '40vw' : '16vw'
                                               }}>Команда</TableCell>
                                    {isFullGame ? <TableCell sx={headerTableCellStyles} align="center" variant="head"
                                                             style={{
                                                                 fontSize: mediaMatch.matches ? '2vmax' : '1.5vw',
                                                                 minWidth: mediaMatch.matches ? '20vw' : '8vw',
                                                                 maxWidth: mediaMatch.matches ? '20vw' : '8vw'
                                                             }}>Матрица</TableCell> : null}
                                    <TableCell sx={headerTableCellStyles} align="center" variant="head"
                                               style={{
                                                   fontSize: mediaMatch.matches ? '2vmax' : '1.5vw',
                                                   minWidth: mediaMatch.matches ? '20vw' : '8vw',
                                                   maxWidth: mediaMatch.matches ? '20vw' : '8vw'
                                               }}>Сумма</TableCell>
                                    {renderTourHeaders()}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {renderTeams()}
                            </TableBody>
                        </Table>
                    </Scrollbars>
                </div>
            </div>
        </PageWrapper>
    );
};

export default Rating;
