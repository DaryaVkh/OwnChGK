import React, {FC} from 'react';
import {Button} from "@mui/material";

const Game: FC = props => {
    const handleStart = async () => {
        fetch('/games/newGame/start');
    }

    return (
        <form>
            <Button onClick={handleStart}> "Старт"</Button>
        </form>
    );
}

export default Game;