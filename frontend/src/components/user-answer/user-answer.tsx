import React, {FC, useState} from 'react';
import classes from './user-answer.module.scss';
import {TextareaAutosize} from '@mui/material';
import {UserAnswerProps} from '../../entities/user-answer/user-answer.interfaces';
import {getCookie, getUrlForSocket} from '../../commonFunctions';

const UserAnswer: FC<UserAnswerProps> = props => {
    const [isOppositionClicked, setIsOppositionClicked] = useState<boolean>(false);
    const [opposition, setOpposition] = useState<string>('');
    const [answerStatus, setAnswerStatus] = useState<'success' | 'error' | 'opposition' | 'no-answer'>(props.status);

    const requester = {
        sendAppeal: (ws: WebSocket, opposition: string) => {
            ws.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'appeal',
                'number': props.order,
                'appeal': opposition,
                'answer': props.answer,
                'gamePart': props.gamePart,
            }));
        },

        changeAnswer: (ws: WebSocket) => {
            ws.send(JSON.stringify({
                'cookie': getCookie('authorization'),
                'action': 'changeAnswer',
                'gamePart': props.gamePart,
                'teamId': props.teamId,
                'number': props.order,
            }));
        }
    };

    const handleButtonClick = () => {
        if (props.isAdmin) {
            let conn = new WebSocket(getUrlForSocket());
            conn.onopen = () => requester.changeAnswer(conn);
            setAnswerStatus(lastStatus => lastStatus === 'success' ? 'error' : 'success');
            return;
        }

        setIsOppositionClicked(!isOppositionClicked);
    };

    const handleOppositionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOpposition(event.target.value);
    };

    const handleSendOpposition = () => {
        if (opposition !== '') {
            setAnswerStatus('opposition');
            let conn = new WebSocket(getUrlForSocket());
            conn.onopen = () => requester.sendAppeal(conn, opposition);
        }
        setIsOppositionClicked(false);
    };

    const getInputClass = () => {
        switch (answerStatus) {
            case 'success':
                return classes.success;
            case 'error':
                return classes.invalid;
            case 'no-answer':
                return classes.noAnswer;
            default:
                return '';
        }
    };

    const getAnswer = () => {
        return answerStatus === 'no-answer' ? 'Нет ответа' : props.answer;
    };

    const getButtonText = () => {
        if (answerStatus === 'success') {
            return '-Отклонить';
        } else {
            return '+Засчитать';
        }
    };

    return (
        <div className={classes.userAnswerWrapper}>
            <div className={classes.answerWrapper}>
                <div className={classes.answerNumber}>{props.order}</div>
                <input readOnly className={`${classes.answer} ${getInputClass()}`} value={getAnswer()}/>
                {
                    answerStatus === 'error' && props.gamePart === 'chgk' || props.isAdmin
                        ? <button className={
                            `${classes.button} ${classes.oppositionButton} ${isOppositionClicked ? classes.clickedOppositionButton : ''}`}
                                  onClick={handleButtonClick}>{props.isAdmin ? getButtonText() : 'Апелляция'}</button>
                        : null
                }
            </div>
            {
                isOppositionClicked
                    ?
                    <div className={classes.oppositionWrapper}>
                        <TextareaAutosize className={classes.oppositionText} minRows={4} value={opposition}
                                          onChange={handleOppositionChange} placeholder="Текст апелляции"/>
                        <button className={`${classes.button} ${classes.sendOppositionButton}`}
                                onClick={handleSendOpposition}>Отправить
                        </button>
                    </div>
                    : null
            }
        </div>
    );
};

export default UserAnswer;
