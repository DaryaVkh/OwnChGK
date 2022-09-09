import React, {FC, useEffect, useState} from 'react';
import {TableCell, TableRow} from '@mui/material';
import {TeamTableRowProps, TourHeaderCellProps} from '../../entities/table/table.interfaces';
import {Link} from 'react-router-dom';
import classes from "../../pages/user-game/user-game.module.scss";

export const TourHeaderCell: FC<TourHeaderCellProps> = props => {
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

    const tableCellStyles = {
        color: 'white',
        fontSize: mediaMatch.matches ? '2vmax' : '1.5vw',
        fontWeight: '700',
        minWidth: mediaMatch.matches ? '20vw' : '7vw',
        maxWidth: mediaMatch.matches ? '20vw' : '7vw',
    };

    const handleExpandClick = () => {
        props.setIsExpanded((arr: boolean[]) => arr.map((val: boolean, i: number) => i === props.tourNumber - 1 ? !val : val));
    };

    const renderQuestions = () => {
        return Array.from(Array(props.questionsCount).keys()).map(i => {
            return (
                <TableCell sx={tableCellStyles}
                           align='center'
                           variant='head'
                           key={`header_tour_${i}`}
                           style={{
                               minWidth: mediaMatch.matches ? '10vw' : '2.5vw',
                               maxWidth: mediaMatch.matches ? '10vw' : '2.5vw'
                           }}>
                    {i + 1}
                </TableCell>
            );
        });
    };

    return (
        <>
            <TableCell sx={tableCellStyles} align='center' variant='head' onClick={handleExpandClick} style={{
                width: mediaMatch.matches ? '20vw' : '7vw',
                cursor: 'pointer',
            }}>
                Тур {props.tourNumber} {props.isExpanded ? '←' : '→'}
            </TableCell>
            {props.isExpanded ? renderQuestions() : null}
        </>
    );
};

const TourCell: FC<{ tourResults: number[], isExpanded: boolean }> = props => {
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

    const styles = {
        color: 'white',
        fontSize: mediaMatch.matches ? '1.8vmax' : '1.3vw',
        fontWeight: '400',
        minWidth: mediaMatch.matches ? '20vw' : '7vw',
        maxWidth: mediaMatch.matches ? '20vw' : '7vw'
    };
    const successResult = {
        color: '#CDFFC9',
        fontSize: mediaMatch.matches ? '1.8vmax' : '1.3vw',
        fontWeight: '400',
        minWidth: mediaMatch.matches ? '10vw' : '2vw',
        maxWidth: mediaMatch.matches ? '10vw' : '2vw'
    };
    const errorResult = {
        color: '#FFC9C9',
        fontSize: mediaMatch.matches ? '1.8vmax' : '1.3vw',
        fontWeight: '400',
        minWidth: mediaMatch.matches ? '10vw' : '2vw',
        maxWidth: mediaMatch.matches ? '10vw' : '2vw'
    };

    const renderExpandedResults = () => {
        return props.tourResults.map((result) => {
            return (
                <TableCell key={`${props.tourResults.toString()}_${result}`}
                           sx={result <= 0 ? errorResult : successResult}
                           align='center' variant='body'>
                    {result <= 0 ? '\u2212' : '+'}
                </TableCell>
            );
        });
    };

    return (
        <>
            <TableCell sx={styles} align='center' variant='body'>{props.tourResults.reduce((a, b) => a + b)}</TableCell>
            {props.isExpanded ? renderExpandedResults() : null}
        </>
    );
};

export const TeamTableRow: FC<TeamTableRowProps> = props => {
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

    const bodyTableCellStyles = {
        color: 'white',
        fontSize: mediaMatch.matches ? '1.8vmax' : '1.3vw',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    };

    const countSums = () => {
        let sums = [];
        for (let tour of props.toursWithResults) {
            sums.push(tour.reduce((a, b) => a + b));
        }
        return sums;
    };

    const renderTourCells = () => {
        return props.toursWithResults.map((tour, i) => {
            return (
                <TourCell tourResults={props.toursWithResults[i]}
                          isExpanded={props.isExpanded[i]}
                          key={`${props.teamName}_${tour.toString()}`} />
            );
        });
    };

    return (
        <TableRow>
            <TableCell sx={bodyTableCellStyles} align='center' variant='body'
                       style={{
                           minWidth: mediaMatch.matches ? '20vw' : '8vw',
                           maxWidth: mediaMatch.matches ? '20vw' : '8vw',
                           fontWeight: 700}}>{props.place}</TableCell>
            <TableCell sx={bodyTableCellStyles} align='left' variant='body'
                       style={{
                           minWidth: mediaMatch.matches ? '40vw' : '16vw',
                           maxWidth: mediaMatch.matches ? '40vw' : '16vw',
                           whiteSpace: 'nowrap'}}> {props.isAdmin ? <Link to={`/game-answers/${props.gameId}/${props.teamName}`} className={`${classes.menuLink}`}> {props.teamName} </Link> : props.teamName} </TableCell>
            {props.matrixSum !== undefined
                ? <TableCell sx={bodyTableCellStyles} align='center' variant='body'
                             style={{
                                 minWidth: mediaMatch.matches ? '20vw' : '8vw',
                                 maxWidth: mediaMatch.matches ? '20vw' : '8vw',
                                 fontWeight: 700
                             }}>{props.matrixSum}</TableCell>
                : null}
            <TableCell sx={bodyTableCellStyles} align='center' variant='body'
                       style={{
                           minWidth: mediaMatch.matches ? '20vw' : '8vw',
                           maxWidth: mediaMatch.matches ? '20vw' : '8vw',
                           fontWeight: 700}}>{countSums().reduce((a, b) => a +
                b)}</TableCell>
            {renderTourCells()}
        </TableRow>
    );
};
