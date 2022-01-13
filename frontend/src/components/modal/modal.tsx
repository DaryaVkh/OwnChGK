import {IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, {FC, useCallback, useState} from 'react';
import classes from './modal.module.scss';
import {ModalProps} from '../../entities/modal/modal.interfaces';
import {deleteGame, deleteTeam} from '../../server-api/server-api';
import {getCookie, getUrlForSocket} from "../../commonFunctions";

const Modal: FC<ModalProps> = props => {
    const [minutes, setMinutes] = useState<number>(0);
    const [conn, setConn] = useState(new WebSocket(getUrlForSocket()));

    const handleMinutesCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMinutes(+event.target.value);
    };

    const handleCloseModal = useCallback(e => {
        props.closeModal(false);
    }, [props]);

    const handleCloseModalClick = (e: React.SyntheticEvent) => {
        handleCloseModal(e);
    };

    const handleDelete = useCallback(e => {
        props.deleteElement?.(arr => arr?.filter(el => el.name !== props.itemForDeleteName));
        if (props.type === 'game') {
            deleteGame(props.itemForDeleteName as string);
        } else {
            deleteTeam(props.itemForDeleteName as string);
        }
        //TODO а если ответ не 200?
    }, [props]);

    const handleDeleteClick = (e: React.SyntheticEvent) => {
        handleDelete(e);
        handleCloseModal(e);
    };

    const handleStartBreak = (e: React.SyntheticEvent) => {
        if (minutes !== 0) {
            props.setBreakTime?.(minutes);
            props.startBreak?.(true);
            conn.send(JSON.stringify({
                        'cookie': getCookie('authorization'),
                        'action': 'breakTime',
                        'time': minutes * 60
                    }
                )
            )
        }
        handleCloseModal(e);
    }

    return (
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
                            <p className={`${classes.modalText} ${classes.breakModalText}`}>
                                Перерыв
                                <input className={classes.minutesInput}
                                       type="number"
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
                    <button className={classes.modalButton} onClick={props.modalType === 'delete' ? handleDeleteClick : handleStartBreak}>
                        {props.modalType === 'delete' ? 'Да' : 'Запустить'}
                    </button>
                </div>
            </div>
            <div className={classes.overlay}/>
        </React.Fragment>
    );
};

export default Modal;