import {IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {FC, useCallback} from "react";
import classes from './modal.module.scss';
import {ModalProps} from "../../entities/modal/modal.interfaces";

const Modal: FC<ModalProps> = props => {
    const handleCloseModal = useCallback(e => {
        props.closeModal(false);
    }, [props]);

    const handleCloseModalClick = (e: React.SyntheticEvent) => {
        handleCloseModal(e);
    }

    const handleDelete = useCallback(e => {
        props.deleteElement(arr => arr.filter(el => el !== props.itemForDeleteName));
        //TODO вот здесь удаляем из базы тиму или игру, если нужно, пробросим пропсу, чтобы различать
    }, [props]);

    const handleDeleteClick = (e: React.SyntheticEvent) => {
        handleDelete(e);
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

                <p className={classes.modalText}>Вы уверены, что хотите удалить «{props.itemForDeleteName}»?</p>

                <div className={classes.modalButtonWrapper}>
                    <button className={classes.modalButton} onClick={handleDeleteClick}>Да</button>
                </div>
            </div>
            <div className={classes.overlay} />
        </React.Fragment>
    );
}

export default Modal;