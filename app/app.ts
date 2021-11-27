import {Server} from './server';
import * as WebSocket from 'ws';
import jwt from "jsonwebtoken";
import {secret} from "./jwtToken";

const port = parseInt(process.env.PORT || '3000');
let timeout;
const wss = new WebSocket.Server({port: 80});
let isOpen = false;
const secondPerQuestion = 70000;
const extraSeconds = 10000;

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        message += ""; // преобразовали в строку
        const words = message.split('\n');
        if (words.length != 2) {
            console.log("не авторизован");
        }
        else {
            const {roles: userRoles, teamId: teamId} = jwt.verify(words[0], secret) as jwt.JwtPayload;
            if (userRoles == "admin" || userRoles == "superadmin") {
                //если админ
                if (words[1] == "+10sec") {
                    const pastDelay = Math.ceil(process.uptime() * 1000 - timeout._idleStart);
                    const initialDelay = timeout._idleTimeout;
                    clearTimeout(timeout);
                    isOpen = true;
                    timeout = setTimeout(() => {
                        console.log("added time end")
                        isOpen = false;
                    }, initialDelay - pastDelay + extraSeconds); // может быть косяк с очисткой таймаута, но хз. пока не косячило
                } else if (words[1] == "Start") {
                    console.log("startuem")//надо ли запрещать стартовать, если таймер уже работает
                    isOpen = true;
                    timeout = setTimeout(() => {
                        isOpen = false;
                        console.log("stopim")
                    }, secondPerQuestion);
                }
            }
            //не админ
            else if (isOpen) {
                console.log('received: %s', words[1], teamId);
            }
        }
    });
});


const starter = new Server().start(port)
    .then(port => console.log(`Running on port ${port}`))
    .catch(error => console.log(error));

export default starter;
