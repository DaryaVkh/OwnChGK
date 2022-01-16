import React, {FC} from 'react';
import classes from './form-button.module.scss';
import {ButtonProps} from '../../entities/form-button/form-button.interfaces';

export const FormButton: FC<ButtonProps> = props => {
    const cls = [
        classes.Button,
        props.type ? classes[props.type] : null,
        props.disabled ? classes.disabled : null,
    ];

    return (
        <div className={classes.buttonWrapper}>
            <button type="submit" className={cls.join(' ')} style={props.style} disabled={props.disabled}>
                {props.text}
            </button>
        </div>
    );
};