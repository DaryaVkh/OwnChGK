import {Server} from './server';
import * as WebSocket from 'ws';
import jwt from "jsonwebtoken";
import {secret} from "./jwtToken";
import {Team} from "./logic/Team";
import { Game } from './logic/Game';

export const games:{ [id: string] : Game;} = {};
export const gamesCurrentAnswer:{ [id: string] : [number, number];} = {};
export const timers: { [id: string] : any; }= {};
const port = parseInt(process.env.PORT || '3000');
const wss = new WebSocket.Server({port: 80});
let isOpen = false;
const secondPerQuestion = 70000;
const extraSeconds = 10000;

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        console.log(message);
        message += "";
        const jsonMessage = JSON.parse(message);
        console.log(jsonMessage);
        if (jsonMessage.cookie === null) {
            console.log("не авторизован");
        }
        else {
            const {roles: userRoles, teamId: teamId, gameId: gameId} =
                jwt.verify(jsonMessage.cookie, secret) as jwt.JwtPayload;
            if (userRoles == "admin" || userRoles == "superadmin") {
                //если админ
                if (jsonMessage.action == "+10sec") {
                    const pastDelay = Math.ceil(process.uptime() * 1000 - timers[gameId]._idleStart);
                    const initialDelay = timers[gameId]._idleTimeout;
                    clearTimeout(timers[gameId]);
                    isOpen = true;
                    timers[gameId] = setTimeout(() => {
                        console.log("added time end")
                        isOpen = false;
                            for (let [key, value] of Object.entries(games[gameId].teams)) {
                                try {
                                    console.log(value.getAnswer(1, 1));
                                }
                                catch (e) {
                                    console.log("no answer for team" + games[gameId].teams[key].name);
                                }
                            }
                    }, initialDelay - pastDelay + extraSeconds); // может быть косяк с очисткой таймаута, но хз. пока не косячило
                } else if (jsonMessage.action == "Start") {
                    console.log("startuem")
                    isOpen = true;
                    timers[gameId] = setTimeout(() => {
                        isOpen = false;
                        console.log("stopim")
                    }, secondPerQuestion);
                }
            }
            //не админ
            else if (isOpen) {
                console.log('received: %s', jsonMessage.answer, teamId);
                games[gameId].rounds[0].questions[0].giveAnswer(games[gameId].teams[teamId], jsonMessage.answer);
            }
        }
    });
});


const starter = new Server().start(port)
    .then(port => console.log(`Running on port ${port}`))
    .catch(error => console.log(error));

export default starter;
