import React, {FC} from 'react';
import {CustomInput} from "../components/custom-input/custom-input";
import {FormButton} from "../components/form-button/form-button";
import {Button} from "@mui/material";
import {cookie} from "express-validator";

const Socket: FC = props => {
    let answer:string;
    const conn = new WebSocket("ws://localhost:80/");

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        conn.send(getCookie("authorization") + "\n" + answer);
    }

    const getCookie = (name: string) => {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    const handleSocket = (event: React.ChangeEvent<HTMLInputElement>) => {
        answer = event.target.value;
    }

    const handleStart = async () => {
        conn.send(getCookie("authorization") + "\n" + "Start");
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