import React, {FC} from 'react';
import classes from './form-input.module.scss';
import {InputProps} from "../../entities/form-input/form-input.interfaces";

export const FormInput: FC<InputProps> = props => {
    const cls = [classes.Input];

    if (props.isInvalid && !cls.includes(classes.invalid)) {
        cls.push(classes.invalid);
    }

    if (!props.isInvalid && cls.includes(classes.invalid)) {
        cls.splice(1, 1);
    }

    return (
        <input className={cls.join(' ')}
               type={props.type}
               id={props.id}
               name={props.name}
               placeholder={props.placeholder}
               onBlur={props.onBlur}
               style={props.style}
               required={true}/>
    );
}