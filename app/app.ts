import {Server} from './server';
import * as WebSocket from 'ws';
import jwt from "jsonwebtoken";
import {secret} from "./jwtToken";
import {Game} from './logic/Game';
import {CreateTransporter} from "./email";

export const games: { [id: string]: Game; } = {};
export const transporter = CreateTransporter("ownchgk@gmail.com", "6ownchgkgoogle");
export const gamesCurrentAnswer: { [id: string]: [number, number]; } = {};
export const timers: { [id: string]: any; } = {};
export const gameAdmins: { [id: string]: any; } = {};
export const timesWhenPauseClick: { [id: string]: number; } = {};
export const timesIsOnPause: { [id: string]: boolean; } = {};
const port = parseInt(process.env.PORT || '3000');
const wss = new WebSocket.Server({port: 80});
let isOpen = false;
const seconds70PerQuestion = 70000;
const extra10Seconds = 10000;

function GiveAddedTime(gameId: number) {
    if (timesIsOnPause[gameId]) {
        timesWhenPauseClick[gameId] -= extra10Seconds;
        return;
    }
    const pastDelay = Math.ceil(process.uptime() * 1000 - timers[gameId]._idleStart);
    const initialDelay = timers[gameId]._idleTimeout;
    clearTimeout(timers[gameId]);
    isOpen = true;
    let t;
    if (initialDelay - pastDelay < 0) {
        t = extra10Seconds;
    } else t = initialDelay - pastDelay + extra10Seconds;
    timers[gameId] = setTimeout(() => {
        console.log("added time end")
        isOpen = false;

        for (let [key, value] of Object.entries(games[gameId].teams)) {
            try {
                console.log(value.getAnswer(1, 1));
                console.log(games[gameId].teams[key].name);
            } catch (e) {
                console.log("no answer for team" + games[gameId].teams[key].name);
            }
        }
    }, t); // может быть косяк с очисткой таймаута, но хз. пока не косячило
}

function StartTimer(gameId: number) {
    if (!timesIsOnPause[gameId]) {
        console.log("start")
        isOpen = true;
        timers[gameId] = setTimeout(() => {
            isOpen = false;
            console.log("stop")
        }, seconds70PerQuestion);
    } else {
        console.log("startFromPause")
        isOpen = true;
        timesIsOnPause[gameId] = false;
        const t = seconds70PerQuestion - timesWhenPauseClick[gameId];
        timesWhenPauseClick[gameId] = 0;
        timers[gameId] = setTimeout(() => {
            isOpen = false;
            console.log("stop after pause")
        }, t);
    }
}

function StopTimer(gameId: number) {
    console.log("stop")
    isOpen = false;
    clearTimeout(timers[gameId]);
    timesIsOnPause[gameId] = false;
    timesWhenPauseClick[gameId] = 0;
}

function PauseTimer(gameId: number) {
    if (isOpen) {
        console.log("pause")
        isOpen = false;
        timesIsOnPause[gameId] = true;
        timesWhenPauseClick[gameId] = Math.ceil(process.uptime() * 1000 - timers[gameId]._idleStart);
        clearTimeout(timers[gameId]);
    }
}

function GetAnswer(answer: string, teamId: number, gameId: number) {
    console.log('received: %s', answer, teamId);
    const roundNumber = gamesCurrentAnswer[gameId][0];
    const questionNumber = gamesCurrentAnswer[gameId][1];
    games[gameId].rounds[roundNumber].questions[questionNumber].giveAnswer(games[gameId].teams[teamId], answer);
}

function GetAppeal(appeal: string, teamId: number, gameId: number) {
    console.log('received: %s', appeal, teamId);
    const roundNumber = gamesCurrentAnswer[gameId][0];
    const questionNumber = gamesCurrentAnswer[gameId][1];
    games[gameId].rounds[roundNumber].questions[questionNumber].giveAppeal(teamId, appeal);
}

function AcceptAnswer(gameId: number, roundNumber: number, questionNumber: number, answers: string[]) {
    for (const answer in answers) {
        games[gameId].rounds[roundNumber].questions[questionNumber].acceptAnswers(answer);
    }
}

function AcceptAppeal(gameId: number, roundNumber: number, questionNumber: number, teamName: string, answers: string[]) {
    for (const answer in answers) {
        let team;
        //todo: тут либо запрос к бд, либо идем по всем командам, ищем по названию
        for (let [key, value] of Object.entries(games[gameId].teams)) {
            if (value.name == teamName) {
                team = value;
                games[gameId].rounds[roundNumber].questions[questionNumber].acceptAppeal(team, answer);
            }
        }
    }
}

function RejectAppeal(gameId: number, roundNumber: number, questionNumber: number, teamName: string, answers: string[]) {
    for (const answer in answers) {
        let team;
        //todo: тут либо запрос к бд, либо идем по всем командам, ищем по названию
        for (let [key, value] of Object.entries(games[gameId].teams)) {
            if (value.name == teamName) {
                team = value;
                games[gameId].rounds[roundNumber].questions[questionNumber].rejectAppeal(team, answer);
            }
        }
    }
}

function RejectAnswer(gameId: number, roundNumber: number, questionNumber: number, answers: string[]) {
    for (const answer in answers) {
        games[gameId].rounds[roundNumber].questions[questionNumber].rejectAnswers(answer);
    }
}

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        message += "";
        const jsonMessage = JSON.parse(message);

        if (jsonMessage.cookie === null) {
            console.log("не авторизован");
        } else {
            const {roles: userRoles, teamId: teamId, gameId: gameId} =
                jwt.verify(jsonMessage.cookie, secret) as jwt.JwtPayload;
            if (userRoles == "admin" || userRoles == "superadmin") {
                gameAdmins[gameId].add(ws);
                if (jsonMessage.action == "+10sec") {
                    GiveAddedTime(gameId);
                } else if (jsonMessage.action == "Start") {
                    StartTimer(gameId);
                } else if (jsonMessage.action == "Pause") {
                    PauseTimer(gameId);
                } else if (jsonMessage.action == "Stop") {
                    StopTimer(gameId);
                } else if (jsonMessage.action == "AcceptAnswer") {
                    AcceptAnswer(gameId, jsonMessage.roundNumber, jsonMessage.qustionNumber, jsonMessage.answers);
                } else if (jsonMessage.action == "AcceptAppeal") {
                    AcceptAppeal(gameId, jsonMessage.roundNumber, jsonMessage.qustionNumber, jsonMessage.teamName, jsonMessage.answers);
                } else if (jsonMessage.action == "RejectAnswer") {
                    RejectAnswer(gameId, jsonMessage.roundNumber, jsonMessage.qustionNumber, jsonMessage.answers);
                } else if (jsonMessage.action == "RejectAppeal") {
                    RejectAppeal(gameId, jsonMessage.roundNumber, jsonMessage.qustionNumber, jsonMessage.teamName, jsonMessage.answers);
                }
            } else {
                if (isOpen && jsonMessage.action == "Answer") {
                    gamesCurrentAnswer[gameId] = [0, 0];
                    GetAnswer(jsonMessage.answer, teamId, gameId);
                } else if (jsonMessage.action == "Appeal") {
                    for (let ws of gameAdmins[gameId])
                        ws.send("Appeal");
                    GetAppeal(jsonMessage.appeal, teamId, gameId);
                }
            }
        }
    });
});


const starter = new Server().start(port)
    .then(port => console.log(`Running on port ${port}`))
    .catch(error => console.log(error));

export default starter;
