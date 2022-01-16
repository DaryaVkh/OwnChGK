import React, {FC, useState} from 'react';
import classes from './user-answer.module.scss';
import {TextareaAutosize} from '@mui/material';
import {UserAnswerProps} from '../../entities/user-answer/user-answer.interfaces';
import {getCookie, getUrlForSocket} from '../../commonFunctions';

let conn: WebSocket;

const UserAnswer: FC<UserAnswerProps> = props => {
    const [isOppositionClicked, setIsOppositionClicked] = useState<boolean>(false);
    const [opposition, setOpposition] = useState<string>('');
    const [answerStatus, setAnswerStatus] = useState<'success' | 'error' | 'opposition'>(props.status);

    const handleOppositionButtonClick = () => {
        setIsOppositionClicked(!isOppositionClicked);
    };

    const handleOppositionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOpposition(event.target.value);
    };

    const handleSendOpposition = () => {
        if (opposition !== '') {
            setAnswerStatus('opposition');
            conn = new WebSocket(getUrlForSocket());
            conn.onopen = () => {
                conn.send(JSON.stringify({
                    'cookie': getCookie('authorization'),
                    'action': 'appeal',
                    'number': props.order,
                    'appeal': opposition,
                    'answer': props.answer
                }));
            }
            // TODO тут отправляем апелляцию на сервак или куда там
        }
        setIsOppositionClicked(false);
    };

    return (
        <div className={classes.userAnswerWrapper}>
            <div className={classes.answerWrapper}>
                <div className={classes.answerNumber}>{props.order}</div>
                <input readOnly className={`${classes.answer} ${answerStatus === 'success'
                    ? classes.success
                    : (answerStatus === 'error' ? classes.invalid : '')}`} value={props.answer}/>
                {
                    answerStatus === 'error'
                        ? <button className={
                            `${classes.button} ${classes.oppositionButton} ${isOppositionClicked ? classes.clickedOppositionButton : ''}`}
                                  onClick={handleOppositionButtonClick}>Апелляция</button>
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