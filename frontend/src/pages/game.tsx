import React, {FC, useState} from 'react';
import {Button} from "@mui/material";
import {Redirect, useParams} from 'react-router-dom';

const Game: FC = props => {
    const [isGameStart, setIsGameStart] = useState(false);
    const {gameId} = useParams<{gameId: string}>();
    const handleStart = async () => {
        fetch(`/games/${gameId}/start`)
            .then((res) => {
                if (res.status === 200) {
                    setIsGameStart(true);
                }
            });
    }

    return isGameStart ? <Redirect to={`/admin/game/${gameId}`}/> : (
        <form>
            <Button onClick={handleStart}> "Старт"</Button>
        </form>
    );
}

export default Game;