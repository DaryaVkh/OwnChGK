import React, {FC} from 'react';
import {CustomInput} from "../components/custom-input/custom-input";
import {FormButton} from "../components/form-button/form-button";
import {Button} from "@mui/material";

const Socket: FC = props => {
    let answer: string;
    const conn = new WebSocket("ws://localhost:80/");

    fetch(`/users/1/changeToken`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Accept': 'application/json'
        }
    });

    const handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault();
        conn.send(JSON.stringify({
            'cookie': getCookie("authorization"),
            'action': 'Answer',
            'answer': answer
        }));
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
        conn.send(JSON.stringify({
            'cookie': getCookie("authorization"),
            'action': "Start"
        }));
    }

    const handleTimerMore = async () => {
        conn.send(JSON.stringify({
            'cookie': getCookie("authorization"),
            'action': "+10sec"
        }));
    }

    return (
        <form onSubmit={handleSubmit}>
            <CustomInput type="text" id="socket" name="socket" placeholder="answer"
                         onChange={handleSocket}/>

            <FormButton type="sendButton" text="Отправить"/>
            <Button onClick={handleStart}> "Старт"</Button>
            <Button onClick={handleTimerMore}> "+10sec"</Button>
        </form>
    );
}

export default Socket;
