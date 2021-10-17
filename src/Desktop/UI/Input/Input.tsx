import React, {FC} from 'react';
import classes from './Input.module.scss';

type InputPropsType = {
    type: string;
    id: string;
    name: string;
    placeholder: string;
};

export const Input: FC<InputPropsType> = props => {
    return (
        <input className={classes.Input} type={props.type} id={props.id} name={props.name} placeholder={props.placeholder} />
    );
}