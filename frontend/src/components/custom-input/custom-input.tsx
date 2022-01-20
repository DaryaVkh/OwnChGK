import React, {FC, useState} from 'react';
import classes from './custom-input.module.scss';
import {InputProps} from '../../entities/custom-input/custom-input.interfaces';
import {FormControl, FormHelperText, IconButton, InputAdornment, OutlinedInput} from '@mui/material';
import {Visibility, VisibilityOff} from '@mui/icons-material';

export const CustomInput: FC<InputProps> = props => {
    const [values, setValues] = useState({
        password: '',
        showPassword: false
    });

    let required: boolean;
    if (props.required !== undefined) {
        required = props.required;
    } else {
        required = true;
    }

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

    const handleClickShowPassword = () => {
        setValues({
            ...values,
            showPassword: !values.showPassword,
        });
    };

    return (
        <FormControl variant='outlined' sx={{marginBottom: '3%'}} fullWidth={true} style={props.style}>
            <OutlinedInput className={cls.join(' ')}
                           fullWidth={true}
                           autoComplete={props.type === 'password' ? 'new-password' : 'off'}
                           type={values.showPassword && props.type === 'password' ? 'text' : props.type}
                           id={props.id}
                           error={props.isInvalid}
                           name={props.name}
                           placeholder={props.placeholder}
                           defaultValue={props.defaultValue}
                           value={props.value}
                           onBlur={props.onBlur}
                           onChange={props.onChange}
                           required={required}
                           onFocus={props.onFocus}
                           readOnly={props.readonly}
                           sx={styles}
                           endAdornment={
                               props.type === 'password'
                                   ?
                                   <InputAdornment position="end">
                                       <IconButton
                                           onClick={handleClickShowPassword}
                                           edge="end"
                                           sx={{
                                               '& .MuiSvgIcon-root': {
                                                   color: 'var(--background-color)'
                                               }
                                           }}
                                       >
                                           {values.showPassword ? <VisibilityOff/> : <Visibility/>}
                                       </IconButton>
                                   </InputAdornment>
                                   :
                                   null
                           }
            />
            {
                props.isInvalid && props.errorHelperText
                    ?
                    <FormHelperText sx={{marginLeft: '0 !important', fontSize: '1vmax', color: '#FF0000'}}>
                        {props.errorHelperText}
                    </FormHelperText>
                    : null
            }
        </FormControl>
    );
};