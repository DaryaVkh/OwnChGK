import React, {FC} from 'react';
import {Backdrop, CircularProgress} from '@mui/material';
import {createPortal} from 'react-dom';

const PageBackdrop: FC<{isOpen: boolean}> = props => {
    return createPortal(
        <Backdrop sx={{ color: 'var(--foreground-color)', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={props.isOpen}>
            <CircularProgress color="inherit" size='5vw' />
        </Backdrop>,
        document.getElementById('root') as HTMLElement
    );
};

export default PageBackdrop;