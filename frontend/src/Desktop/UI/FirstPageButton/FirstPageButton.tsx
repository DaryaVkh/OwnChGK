import React from 'react';
import classes from './FirstPageButton.module.scss';

export const Button = (props: { type: string, text: string }) => {
    const cls = [
        classes.Button,
        classes[props.type]
    ];

    return (
        <div className={classes.buttonWrapper}>
            <button type='submit' className={cls.join(' ')}>
                { props.text }
            </button>
        </div>
    );
}