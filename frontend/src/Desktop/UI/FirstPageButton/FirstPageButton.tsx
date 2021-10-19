import React from 'react';
import classes from './FirstPageButton.module.scss';

export const Button = (props: { type: string, text: string }) => {
    const cls = [
        classes.Button,
        classes[props.type]
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
            <button type='submit' className={cls.join(' ')}>
                {/*onClick={authorize}*/}
                { props.text }
            </button>
        </div>
    );
}