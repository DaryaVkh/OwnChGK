import React, {FC} from 'react';
import classes from './custom-input.module.scss';
import {InputProps} from "../../entities/custom-input/custom-input.interfaces";
import {OutlinedInput} from "@mui/material";

export const CustomInput: FC<InputProps> = props => {
    const cls = [classes.Input];
    const styles = {
        '& .MuiOutlinedInput-notchedOutline': {
            border: props.isInvalid ? '2px solid #FF0000 !important' : '2px solid var(--foreground-color) !important',
            borderRadius: '8px',
            minHeight: '26px',
            padding: '0 !important'
        },
        '& .MuiOutlinedInput-input': {
            padding: '0 0 0 1.5vw !important',
            color: 'black',
        }
    };

    if (props.isInvalid && !cls.includes(classes.invalid)) {
        cls.push(classes.invalid);
    }

    if (!props.isInvalid && cls.includes(classes.invalid)) {
        cls.splice(1, 1);
    }

    return (
        <OutlinedInput className={cls.join(' ')}
                       fullWidth={true}
                       type={props.type}
                       id={props.id}
                       error={props.isInvalid}
                       name={props.name}
                       placeholder={props.placeholder}
                       defaultValue={props.defaultValue}
                       onBlur={props.onBlur}
                       onChange={props.onChange}
                       style={props.style}
                       required={true}
                       sx={styles}
        />
    );
}