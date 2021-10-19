import React from 'react';
import classes from './FirstPageButton.module.scss';

export const Button = (props: { type: string, text: string }) => {
    const cls = [
        classes.Button,
        classes[props.type]
    ];

    // function authorize() {
    //     fetch('/insert', {
    //         method: 'POST', body: JSON.stringify({
    //             email: 'dashav1605@mail.ru', password: '12345'
    //         })
    //     })
    //         .then((res) => res.json())
    //         .then((res) => {console.log(res)})
    // }

    return (
        <div className={classes.buttonWrapper}>
            <button type='submit' className={cls.join(' ')}>
                {/*onClick={authorize}>*/}
                { props.text }
            </button>
        </div>
    );
}