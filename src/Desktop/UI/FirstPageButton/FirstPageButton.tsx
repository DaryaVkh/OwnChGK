import React from 'react';
import classes from './FirstPageButton.module.css';

export const Button = (props: { type: string, text: string }) => {
    const cls = [
        classes.Button,
        classes[props.type]
    ];

    return (
        <div className={classes.buttonWrapper}>
            <button className={cls.join(' ')}>
                { props.text }
            </button>
        </div>
    );
}