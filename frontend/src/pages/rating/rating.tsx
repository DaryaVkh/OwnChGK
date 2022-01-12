import React, {FC, useState} from 'react';
import classes from './rating.module.scss';
import PageWrapper from '../../components/page-wrapper/page-wrapper';
import {GameParams, RatingProps, TeamResult, Tour} from '../../entities/rating/rating.interfaces';
import Header from '../../components/header/header';
import {Scrollbars} from 'rc-scrollbars';
import {Table, TableBody, TableCell, tableCellClasses, TableHead, TableRow} from '@mui/material';
import {TeamTableRow, TourHeaderCell} from '../../components/table/table';
import {useParams} from 'react-router-dom';

const Rating: FC<RatingProps> = props => {
    const {gameId} = useParams<{ gameId: string }>();
    const [gameParams, setGameParams] = useState<GameParams>({toursCount: 3, questionsCount: 10}); // TODO получаем с сервака как то по gameId
    const [teams, setTeams] = useState<TeamResult[]>(
        [
            {
                teamName: 'Сахара опять не будет',
                toursWithResults: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
            },
            {
                teamName: 'Забаненные в гугле',
                toursWithResults: [[1, 1, 1, 0, 1, 1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 1, 1], [1, 1, 1, 1, 0, 0, 0, 1, 1, 1]]
            },
            {
                teamName: 'Не грози Южному автовокзалу',
                toursWithResults: [[1, 1, 1, 1, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 0, 1, 1, 0, 1, 0], [0, 0, 1, 1, 1, 1, 1, 1, 1, 0]]
            },
            {
                teamName: 'ГУ ЧГК-шки ниндзя',
                toursWithResults: [[1, 1, 1, 1, 1, 0, 1, 0, 1, 1], [1, 0, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]]
            },
            {
                teamName: 'Ума палата №6',
                toursWithResults: [[1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 0], [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]]
            }
        ]
    ); // TODO а тут наверное как то по сокетам
    const [expandedTours, setExpandedTours] = useState<boolean[]>([false, false, false]); // TODO когда пришли toursCount, нужно заполнять этот массив false-ами в количестве toursCount

    const headerTableCellStyles = {
        color: 'white',
        fontSize: '1.5vw',
        fontWeight: '700',
    };

    const renderTourHeaders = () => {
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
        teams.sort((a, b) => {
            const firstSum = countSums(a.toursWithResults).reduce((x, y) => x + y);
            const secondSum = countSums(b.toursWithResults).reduce((x, y) => x + y);
            return firstSum < secondSum ? 1 : (firstSum > secondSum ? -1 : 0);
        });

        return teams.map((teamResult, i) => {
            return <TeamTableRow key={teamResult.teamName} place={i + 1} teamName={teamResult.teamName}
                                 toursWithResults={teamResult.toursWithResults} isExpanded={expandedTours}/>;
        });
    };

    const turnOnIntrigue = () => {
        //TODO включайте интригу
    }

    const downloadResults = () => {
        // TODO скачивайте результаты
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={props.isAdmin}>
                <div className={classes.pageTitle}>Рейтинг</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.buttonsWrapper}>
                    {
                        props.isAdmin
                            ? <button className={`${classes.button} ${classes.intrigueButton}`} onClick={turnOnIntrigue}>Включить «Интригу»</button>
                            : null
                    }
                    <button className={classes.button} onClick={downloadResults}>Скачать результаты</button>
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
                                    <TableCell sx={headerTableCellStyles} align='center' variant='head'
                                               style={{minWidth: '8vw', maxWidth: '8vw'}}>Место</TableCell>
                                    <TableCell sx={headerTableCellStyles} align='left' variant='head'
                                               style={{minWidth: '16vw', maxWidth: '16vw'}}>Команда</TableCell>
                                    <TableCell sx={headerTableCellStyles} align='center' variant='head'
                                               style={{minWidth: '8vw', maxWidth: '8vw'}}>Сумма</TableCell>
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