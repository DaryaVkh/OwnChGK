import React, {FC, useCallback, useEffect, useState} from 'react';
import classes from './input-with-adornment.module.scss';
import {IconButton, InputAdornment, OutlinedInput} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import {InputWithAdornmentProps} from '../../entities/input-with-adornment/input-with-adornment.interfaces';
import {Redirect} from 'react-router-dom';

const InputWithAdornment: FC<InputWithAdornmentProps> = props => {
    const [isRedirectedToEdit, setIsRedirectedToEdit] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const pathToEdit = props.type === 'game' ? '/admin/game-creation/edit' : '/admin/team-creation/edit';

    useEffect(() => {
        function goToGame(event: MouseEvent) {
            const clickedElement = event.target as HTMLElement;
            if (clickedElement.id === props.name && props.type === 'game') {
                setIsClicked(true);
            }
        }

        window.addEventListener('click', goToGame, true);

        return () => {
            window.removeEventListener('click', goToGame, true);
        };
    });

    const inputStyle = {
        cursor: props.type === 'game' ? 'pointer !important' : 'auto',
        '& .MuiOutlinedInput-notchedOutline': {
            border: 'none !important',
            borderRadius: '10px',
            minHeight: '26px',
            padding: '0 !important'
        },
        '& .MuiOutlinedInput-input': {
            padding: '0 0 0 1.5vw !important',
            color: 'black',
            cursor: props.type === 'game' ? 'pointer' : 'auto',
        }
    };

    const handleDeleteClick = (event: React.SyntheticEvent) => {
        setItemName(event);
        handleOpenModal(event);
    };

    const setItemName = useCallback(e => {
        props.setItemForDeleteName(props.name);
        props.setItemForDeleteId(props.id as string);
    }, [props]);

    const handleOpenModal = useCallback(e => {
        props.openModal(true);
    }, [props]);

    const handleEditClick = (event: React.SyntheticEvent) => {
        setIsRedirectedToEdit(true);
    };

    if (isClicked) {
        return <Redirect to={`/admin/start-game/${props.id}`}/>;
    }

    return isRedirectedToEdit
        ? <Redirect to={{pathname: pathToEdit, state: {id: props.id, name: props.name}}}/>
        : <OutlinedInput className={classes.InputWithAdornment} readOnly fullWidth name={props.name}
                         value={props.name} sx={inputStyle} id={`${props.name}`}
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
        />;
};

export default InputWithAdornment;