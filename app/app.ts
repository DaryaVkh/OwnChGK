import {Server} from './server';
import * as WebSocket from 'ws';
import jwt from "jsonwebtoken";
import {secret} from "./jwtToken";
import {Game} from './logic/Game';
import {CreateTransporter} from "./email";

export const games: { [id: string]: Game; } = {};
export const gamesCurrentAnswer: { [id: string]: [number, number]; } = {};
export const gameAdmins: { [id: string]: any; } = {};
export const gameUsers: { [id: string]: any; } = {};
export const gameIsTimerStart: { [id: string]: boolean; } = {};

export const transporter = CreateTransporter("ownchgk@gmail.com", "6ownchgkgoogle");

export const timers: { [id: string]: any; } = {};
export const timesWhenPauseClick: { [id: string]: number; } = {};
export const timesIsOnPause: { [id: string]: boolean; } = {};

const port = parseInt(process.env.PORT || '3000');

const wss = new WebSocket.Server({port: 80});
const seconds70PerQuestion = 70000;
const extra10Seconds = 10000;

function testFunction(gameId:number) {
    for (let [key, value] of Object.entries(games[gameId].teams)) {
        try {
            console.log(value.getAnswer(1, 1));
            console.log(games[gameId].teams[key].name);
        } catch (e) {
            console.log("no answer for team" + games[gameId].teams[key].name);
        }
    }
}

function GiveAddedTime(gameId: number) {
    if (timesIsOnPause[gameId]) {
        timesWhenPauseClick[gameId] += extra10Seconds;
        console.log('added time is' + timesWhenPauseClick[gameId]);
    }
    else {
        const pastDelay = Math.floor(process.uptime() * 1000 - timers[gameId]._idleStart);
        const initialDelay = timers[gameId]._idleTimeout;
        clearTimeout(timers[gameId]);
        gameIsTimerStart[gameId] = true;
        let t;
        if (initialDelay - pastDelay < 0) {
            t = extra10Seconds;
        } else t = initialDelay - pastDelay + extra10Seconds;
        timers[gameId] = setTimeout(() => {
            console.log("added time end");
            gameIsTimerStart[gameId] = false;
        }, t); // может быть косяк с очисткой таймаута, но хз. пока не косячило
        console.log('t' + t);
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'addTime',
                'time': t,
                'isStarted': true,
            }));
        }
    }
}

function ChangeQuestionNumber(gameId:number, questionNumber:number, roundNumber:number) {
    for (let user of gameUsers[gameId]) {
        user.send(JSON.stringify({
            'action': 'changeQuestionNumber',
            'number': games[gameId].rounds[0].questionsCount * (roundNumber - 1) + questionNumber,
        }));
    }
}

function StartTimer(gameId: number) {
    if (!timesIsOnPause[gameId]) {
        console.log("start")
        gameIsTimerStart[gameId] = true;
        timers[gameId] = setTimeout(() => {
            gameIsTimerStart[gameId] = false;
            console.log("stop")
        }, seconds70PerQuestion);

        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'time': seconds70PerQuestion
            }));
        }
    } else {
        console.log("startFromPause")
        gameIsTimerStart[gameId] = true;
        timesIsOnPause[gameId] = false;
        const t = timesWhenPauseClick[gameId];
        timers[gameId] = setTimeout(() => {
            gameIsTimerStart[gameId] = false;
            console.log("stop after pause")
        }, t);
        console.log(t+'added time to resp');
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'time': t
            }));
        }
    }
}

function StopTimer(gameId: number) {
    console.log("stop")
    gameIsTimerStart[gameId] = false;
    clearTimeout(timers[gameId]);
    timesIsOnPause[gameId] = false;
    timesWhenPauseClick[gameId] = 0;
    for (let user of gameUsers[gameId]) {
        user.send(JSON.stringify({
            'action': 'stop'
        }));
    }
}

function PauseTimer(gameId: number) {
    if (gameIsTimerStart[gameId]) {
        console.log("pause")
        gameIsTimerStart[gameId] = false;
        timesIsOnPause[gameId] = true;
        timesWhenPauseClick[gameId] = (timesWhenPauseClick[gameId] ?? seconds70PerQuestion) - Math.floor(process.uptime() * 1000 - timers[gameId]._idleStart);
        clearTimeout(timers[gameId]);

        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'pause'
            }));
        }
    }
}

function GetAnswer(answer: string, teamId: number, gameId: number) {
    console.log('received: %s', answer, teamId);
    const roundNumber = gamesCurrentAnswer[gameId][0] - 1;
    const questionNumber = gamesCurrentAnswer[gameId][1] - 1;
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

function AcceptAppeal(gameId: number, roundNumber: number, questionNumber: number, teamId: number, answers: string[]) {
    for (const answer in answers) {
        games[gameId].rounds[roundNumber].questions[questionNumber].acceptAppeal(teamId, answer);
    }
}

function RejectAppeal(gameId: number, roundNumber: number, questionNumber: number, teamId: number, answers: string[]) {
    for (const answer in answers) {
        games[gameId].rounds[roundNumber].questions[questionNumber].rejectAppeal(teamId, answer);
    }
}

function RejectAnswer(gameId: number, roundNumber: number, questionNumber: number, answers: string[]) {
    for (const answer in answers) {
        games[gameId].rounds[roundNumber].questions[questionNumber].rejectAnswers(answer);
    }
}

function GetAllAnswers(gameId: number, roundNumber: number, questionNumber: number, ws) {
    console.log(games[gameId].rounds[roundNumber-1].questions[questionNumber-1].answers);
    ws.send(JSON.stringify({
        'action': 'answers',
        'answers' : games[gameId].rounds[roundNumber-1].questions[questionNumber-1].answers
    }));
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
            if (jsonMessage.action == 'time') {
                if (timers[gameId]) {
                    const pastDelay = Math.floor(process.uptime() * 1000 - timers[gameId]._idleStart);
                    const initialDelay = timers[gameId]._idleTimeout;
                    let result = 0;
                    if (gameIsTimerStart[gameId]) {
                        result = initialDelay - pastDelay;
                    } else if (timesIsOnPause[gameId]) {
                        result = timesWhenPauseClick[gameId];
                    } else {
                        result = seconds70PerQuestion;
                    }
                    ws.send(JSON.stringify({
                        'action': 'time',
                        'isStarted': gameIsTimerStart[gameId],
                        'time': result}));
                    console.log(result);
                }
            }
            else if (jsonMessage.action == 'changeQuestion') {
                gamesCurrentAnswer[gameId] = [jsonMessage.tourNumber, jsonMessage.questionNumber];
                ChangeQuestionNumber(gameId, jsonMessage.questionNumber, jsonMessage.tourNumber);
            }
            else if (jsonMessage.action == 'getQuestionNumber') {
                ws.send(JSON.stringify({
                    'action': 'changeQuestionNumber',
                    'number': games[gameId].rounds[0].questionsCount * (gamesCurrentAnswer[gameId][0] - 1) + gamesCurrentAnswer[gameId][1],
                }));
            }
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
                    AcceptAppeal(gameId, jsonMessage.roundNumber, jsonMessage.qustionNumber, teamId, jsonMessage.answers);
                } else if (jsonMessage.action == "RejectAnswer") {
                    RejectAnswer(gameId, jsonMessage.roundNumber, jsonMessage.qustionNumber, jsonMessage.answers);
                } else if (jsonMessage.action == "RejectAppeal") {
                    RejectAppeal(gameId, jsonMessage.roundNumber, jsonMessage.qustionNumber, teamId, jsonMessage.answers);
                } else if (jsonMessage.action == "getAnswers") {
                    GetAllAnswers(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, ws);
                }
            } else {
                gameUsers[gameId].add(ws);
                if (gameIsTimerStart[gameId] && jsonMessage.action == "Answer") {
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
