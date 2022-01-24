import React, {FC} from 'react';
import classes from './page-wrapper.module.scss';

const PageWrapper: FC = props => {
    return (
        <div className={classes.PageWrapper}>
            {props.children}
        </div>
    );
};

export default PageWrapper;