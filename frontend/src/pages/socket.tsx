import React, {FC} from 'react';
import {CustomInput} from "../components/custom-input/custom-input";
import {FormButton} from "../components/form-button/form-button";
import {Button} from "@mui/material";

const Socket: FC = props => {
    let answer:string;
    const conn = new WebSocket("ws://localhost:80/");
    conn.onopen =  () => {
        conn.send("hello from me client!")
    };

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        conn.send(answer);
    }

    const handleSocket = (event: React.ChangeEvent<HTMLInputElement>) => {
        answer = event.target.value;
    }

    const handleStart = async () => {
        conn.send("Start");
    }

    return (
        <form onSubmit={handleSubmit}>
            <CustomInput type="text" id="socket" name="socket" placeholder="answer"
                         onChange={handleSocket}/>

            <FormButton type="sendButton" text="Отправить"/>
            <Button onClick={() => { handleStart() }}> "Старт"</Button>
        </form>
    );
}

export default Socket;