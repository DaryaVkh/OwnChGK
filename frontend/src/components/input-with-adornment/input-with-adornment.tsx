import React, {FC, useCallback, useState} from 'react';
import classes from "./input-with-adornment.module.scss";
import {IconButton, InputAdornment, OutlinedInput} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import {InputWithAdornmentProps} from "../../entities/input-with-adornment/input-with-adornment.interfaces";
import {Redirect} from "react-router-dom";

const InputWithAdornment: FC<InputWithAdornmentProps> = props => {
    const [isRedirectedToEdit, setIsRedirectedToEdit] = useState(false);
    const pathToEdit = props.type === 'game' ? '/game-creation/edit' : '/team-creation/edit';

    const inputStyle = {
        '& .MuiOutlinedInput-notchedOutline': {
            border: 'none !important',
            borderRadius: '10px',
            minHeight: '26px',
            padding: '0 !important'
        },
        '& .MuiOutlinedInput-input': {
            padding: '0 0 0 1.5vw !important',
            color: 'black',
        }
    };

    const handleDeleteClick = (e: React.SyntheticEvent) => {
        setItemName(e);
        handleOpenModal(e);
    }

    const setItemName = useCallback(e => {
        props.setItemForDeleteName(props.name);
    }, [props]);


    const handleOpenModal = useCallback(e => {
        props.openModal(true);
    }, [props]);

    const handleEditClick = () => {
        setIsRedirectedToEdit(true);
    }

    return isRedirectedToEdit
        ? <Redirect to={{pathname: pathToEdit, state: {name: props.name}}} />
        : <OutlinedInput className={classes.InputWithAdornment} readOnly fullWidth name={props.name}
                         value={props.name} sx={inputStyle}
                         endAdornment={
                           <>
                               <InputAdornment position="end">
                                   <IconButton
                                       onClick={handleEditClick}
                                       edge="end"
                                       sx={{
                                           '& .MuiSvgIcon-root': {
                                               color: 'var(--background-color)',
                                               fontSize: '4vmin'
                                           }
                                       }}
                                   >
                                       <EditOutlinedIcon/>
                                   </IconButton>
                               </InputAdornment>

                               <InputAdornment position="end">
                                   <IconButton
                                       onClick={handleDeleteClick}
                                       edge="end"
                                       sx={{
                                           '& .MuiSvgIcon-root': {
                                               color: 'darkred',
                                               fontSize: '4vmin'
                                           }
                                       }}
                                   >
                                       <HighlightOffOutlinedIcon/>
                                   </IconButton>
                               </InputAdornment>
                           </>
                         }
            />
}

export default InputWithAdornment;