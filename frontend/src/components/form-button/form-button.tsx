import React, {FC} from 'react';
import classes from './form-button.module.scss';
import {ButtonProps} from "../../entities/form-button/form-button.interfaces";

export const FormButton: FC<ButtonProps> = props => {
    const cls = [
        classes.Button,
        props.type ? classes[props.type] : null
    ];

    /*function authorize() {
        fetch('/users/insert', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json;charset=utf-8',
            },
            body: JSON.stringify({
                email: 'asdkasdaksd@mail.ru', password: '123456'
            })
        })
            .then((res) => res.json())
            .then((res) => {console.log(res)})
    }*/

    return (
        <div className={classes.buttonWrapper}>
            <button type='submit' className={cls.join(' ')} style={props.style}>
                {/*onClick={authorize}*/}
                { props.text }
            </button>
        </div>
    );
}