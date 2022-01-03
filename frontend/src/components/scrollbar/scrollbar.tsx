import React, {FC} from 'react';
import classes from './scrollbar.module.scss';
import {Scrollbars} from "rc-scrollbars";

const Scrollbar: FC = props => {
    return (
        <Scrollbars autoHide autoHideTimeout={500}
                    autoHideDuration={200}
                    renderThumbVertical={() => <div style={{backgroundColor: 'white', borderRadius: '4px', cursor: 'pointer'}}/>}
                    renderTrackHorizontal={props => <div {...props} style={{display: 'none'}} />}
                    classes={{view: classes.scrollbarView}}>
            {props.children}
        </Scrollbars>
    );
}

export default Scrollbar;