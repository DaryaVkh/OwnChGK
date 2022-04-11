import {IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, {FC, useCallback, useState} from 'react';
import classes from './modal.module.scss';
import {ModalProps} from '../../entities/modal/modal.interfaces';
import {deleteGame, deleteTeam} from '../../server-api/server-api';
import {getCookie, getUrlForSocket} from '../../commonFunctions';
import {createPortal} from 'react-dom';

let conn: WebSocket;

const Modal: FC<ModalProps> = props => {
    const [minutes, setMinutes] = useState<number>(0);

    const handleMinutesCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (+event.target.value <= 99) {
            setMinutes(+event.target.value);
        }
    };

    const handleCloseModal = useCallback(e => {
        props.closeModal(false);
    }, [props]);

    const handleCloseModalClick = (e: React.SyntheticEvent) => {
        handleCloseModal(e);
    };

    const handleDelete = useCallback(e => {
        if (props.modalType === 'delete-game-part') {
            props.setGamePartUndefined?.(undefined);
        } else {
            props.deleteElement?.(arr => arr?.filter(el => el.name !== props.itemForDeleteName));
            if (props.type === 'game') {
                deleteGame(props.itemForDeleteId as string);
            } else {
                deleteTeam(props.itemForDeleteId as string);
            }
        }
    }, [props]);

    const handleDeleteClick = (e: React.SyntheticEvent) => {
        handleDelete(e);
        handleCloseModal(e);
    };

    const handleStartBreak = (e: React.SyntheticEvent) => {
        if (minutes !== 0) {
            props.setBreakTime?.(minutes * 60);
            props.startBreak?.(true);
            conn = new WebSocket(getUrlForSocket());
            conn.onopen = () => {
                conn.send(JSON.stringify({
                            'cookie': getCookie('authorization'),
                            'action': 'breakTime',
                            'time': minutes * 60
                        }
                    )
                )
            }
        }
        handleCloseModal(e);
    }

    return createPortal(
        <React.Fragment>
            <div className={classes.modal}>
                <div className={classes.closeButtonWrapper}>
                    <IconButton onClick={handleCloseModalClick}>
                        <CloseIcon sx={{
                            color: 'white',
                            fontSize: '5vmin'
                        }}/>
                    </IconButton>
                </div>

                {
                    props.modalType === 'delete'
                        ? <p className={classes.modalText}>Вы уверены, что хотите удалить «{props.itemForDeleteName}»?</p>
                        :
                        (
                            props.modalType === 'delete-game-part'
                                ?
                                <p className={classes.modalText}>Вы уверены, что хотите удалить {props.itemForDeleteName}?</p>
                                :
                                <p className={`${classes.modalText} ${classes.breakModalText}`}>
                                    Перерыв
                                    <input className={classes.minutesInput}
                                           type="text"
                                           id="minutes"
                                           name="minutes"
                                           value={minutes || ''}
                                           required={true}
                                           onChange={handleMinutesCountChange} />
                                    минут
                                </p>
                        )
                }
                <div className={classes.modalButtonWrapper}>
                    <button className={classes.modalButton} onClick={props.modalType === 'delete' || props.modalType === 'delete-game-part' ? handleDeleteClick : handleStartBreak}>
                        {props.modalType === 'delete' || props.modalType === 'delete-game-part' ? 'Да' : 'Запустить'}
                    </button>
                </div>
            </div>
            <div className={classes.overlay}/>
        </React.Fragment>,
        document.getElementById('root') as HTMLElement);
};

export default Modal;