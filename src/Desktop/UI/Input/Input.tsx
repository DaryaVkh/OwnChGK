import React, {Component} from 'react';
import classes from './Input.module.css';

type InputPropsType = {
    type: string;
    id: string;
    name: string;
    placeholder: string;
};

export const Input = (props: InputPropsType) => {
    return (
        <input className={classes.Input} type={props.type} id={props.id} name={props.name} placeholder={props.placeholder} />
    );
}