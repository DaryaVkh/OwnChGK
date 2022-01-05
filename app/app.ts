import {Server} from './server';
import * as WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import {secret} from './jwtToken';
import {Game} from './logic/Game';
import {CreateTransporter} from './email';

export const games: { [id: string]: Game; } = {};
export const gamesCurrentAnswer: { [id: string]: [number, number]; } = {};
export const gameAdmins: { [id: string]: any; } = {};
export const gameUsers: { [id: string]: any; } = {};
export const gameIsTimerStart: { [id: string]: boolean; } = {};
const addedTime: { [id: string]: number } = {};

export const transporter = CreateTransporter('ownchgk@gmail.com', '6ownchgkgoogle');

export const timers: { [id: string]: any; } = {};
export const timesWhenPauseClick: { [id: string]: number; } = {};
export const timesIsOnPause: { [id: string]: boolean; } = {};

const port = parseInt(process.env.PORT || '3000');

const wss = new WebSocket.Server({port: 80});
const seconds70PerQuestion = 70000;
const extra10Seconds = 10000;

function testFunction(gameId: number) {
    for (let [key, value] of Object.entries(games[gameId].teams)) {
        try {
            console.log(value.getAnswer(1, 1));
            console.log(games[gameId].teams[key].name);
        } catch (e) {
            console.log('no answer for team' + games[gameId].teams[key].name);
        }
    }
}

function GiveAddedTime(gameId: number) {
    if (timesIsOnPause[gameId]) {
        timesWhenPauseClick[gameId] += extra10Seconds;
        console.log('added time is' + timesWhenPauseClick[gameId]);
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'addTime',
                'maxTime': seconds70PerQuestion + (addedTime[gameId] ?? 0),
                'time': timesWhenPauseClick[gameId],
                'isStarted': false,
            }));
        }
    } else {
        if (!gameIsTimerStart[gameId]) {
            addedTime[gameId] = addedTime[gameId] ? addedTime[gameId] + 10000 : 10000;
            for (let user of gameUsers[gameId]) {
                user.send(JSON.stringify({
                    'action': 'addTime',
                    'maxTime': seconds70PerQuestion + (addedTime[gameId] ?? 0),
                    'time': seconds70PerQuestion + addedTime[gameId],
                    'isStarted': false,
                }));
            }
            return;
        }

        const pastDelay = Math.floor(process.uptime() * 1000 - timers[gameId]._idleStart);
        const initialDelay = timers[gameId]._idleTimeout;
        clearTimeout(timers[gameId]);
        gameIsTimerStart[gameId] = true;
        let t;
        if (initialDelay - pastDelay < 0) {
            t = extra10Seconds;
        } else t = initialDelay - pastDelay + extra10Seconds;
        addedTime[gameId] = addedTime[gameId] ? addedTime[gameId] + 10000 : 10000;
        timers[gameId] = setTimeout(() => {
            console.log('added time end');
            gameIsTimerStart[gameId] = false;
            addedTime[gameId] = 0;
        }, t); // может быть косяк с очисткой таймаута, но хз. пока не косячило
        console.log('t' + t);
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'addTime',
                'maxTime': seconds70PerQuestion + (addedTime[gameId] ?? 0),
                'time': t,
                'isStarted': true,
            }));
        }
    }
}

function ChangeQuestionNumber(gameId: number, questionNumber: number, roundNumber: number) {
    for (let user of gameUsers[gameId]) {
        user.send(JSON.stringify({
            'action': 'changeQuestionNumber',
            'number': games[gameId].rounds[0].questionsCount * (roundNumber - 1) + questionNumber,
        }));
    }
}

function StartTimer(gameId: number) {
    if (!timesIsOnPause[gameId]) {
        console.log('start')
        gameIsTimerStart[gameId] = true;
        timers[gameId] = setTimeout(() => {
            gameIsTimerStart[gameId] = false;
            addedTime[gameId] = 0;
            console.log('stop')
        }, seconds70PerQuestion + (addedTime[gameId] ?? 0));

        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'maxTime': seconds70PerQuestion + (addedTime[gameId] ?? 0),
                'time': seconds70PerQuestion + (addedTime[gameId] ?? 0)
            }));
        }
    } else {
        console.log('startFromPause')
        gameIsTimerStart[gameId] = true;
        timesIsOnPause[gameId] = false;
        const t = timesWhenPauseClick[gameId];
        //timesWhenPauseClick[gameId] = 70000;
        timers[gameId] = setTimeout(() => {
            gameIsTimerStart[gameId] = false;
            console.log('stop after pause')
            addedTime[gameId] = 0;
        }, t);
        console.log(t + 'added time to resp');
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'maxTime': seconds70PerQuestion + (addedTime[gameId] ?? 0),
                'time': t
            }));
        }
    }
}

function StopTimer(gameId: number) {
    console.log('stop')
    gameIsTimerStart[gameId] = false;
    clearTimeout(timers[gameId]);
    timesIsOnPause[gameId] = false;
    timesWhenPauseClick[gameId] = 70000;
    addedTime[gameId] = 0;
    for (let user of gameUsers[gameId]) {
        user.send(JSON.stringify({
            'action': 'stop'
        }));
    }
}

function PauseTimer(gameId: number) {
    if (gameIsTimerStart[gameId]) {
        console.log('pause')
        gameIsTimerStart[gameId] = false;
        timesIsOnPause[gameId] = true;
        //addedTime[gameId] = 0;
        timesWhenPauseClick[gameId] = (timesWhenPauseClick[gameId] ?? seconds70PerQuestion + addedTime[gameId]) - Math.floor(process.uptime() * 1000 - timers[gameId]._idleStart);
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

function GetAppeal(appeal: string, teamId: number, gameId: number, number: number) {
    console.log('received: %s', appeal, teamId);
    const roundNumber = Math.ceil(number / games[gameId].rounds[0].questionsCount - 1);
    let questionNumber = number - (roundNumber + 1) * games[gameId].rounds[0].questionsCount;
    console.log(roundNumber, questionNumber);
    games[gameId].rounds[roundNumber].questions[questionNumber].giveAppeal(teamId, appeal);
}

function AcceptAnswer(gameId: number, roundNumber: number, questionNumber: number, answers: string[]) {
    for (const answer of answers) {
        games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].acceptAnswers(answer);
    }
}

function AcceptAppeal(gameId: number, roundNumber: number, questionNumber: number, teamId: number, answers: string[]) {
    for (const answer of answers) {
        games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].acceptAppeal(teamId, answer); // TODO: переписать, acceptAppeal должен принимать ответ, а не команду
    }
}

function RejectAppeal(gameId: number, roundNumber: number, questionNumber: number, teamId: number, answers: string[]) {
    for (const answer of answers) {
        games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].rejectAppeal(teamId, answer);
    }
}

function RejectAnswer(gameId: number, roundNumber: number, questionNumber: number, answers: string[]) {
    for (const answer of answers) {
        games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].rejectAnswers(answer);
    }
}

function GetAllTeamsAnswers(gameId: number, roundNumber: number, questionNumber: number, ws) {
    const answers = games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].answers;
    console.log(answers);
    const acceptedAnswers = answers.filter(ans => ans.status === 0).map(ans => ans.text);
    const rejectedAnswers = answers.filter(ans => ans.status === 1 || ans.status === 3).map(ans => ans.text);
    const uncheckedAnswers = answers.filter(ans => ans.status === 2).map(ans => ans.text);
    ws.send(JSON.stringify({
        'action': 'answers',
        'acceptedAnswers': acceptedAnswers,
        'rejectedAnswers': rejectedAnswers,
        'uncheckedAnswers': uncheckedAnswers
    }));
}

function GetAllTeamsAppeals(gameId: number, roundNumber: number, questionNumber: number, ws) {
    const appeals = games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].appeals
        .map(appeal => {
            return {
                teamName: games[gameId].teams[appeal.teamNumber].name,
                text: appeal.text,
                answer: games[gameId].teams[appeal.teamNumber].getAnswer(roundNumber, questionNumber).text
            }
        });
    ws.send(JSON.stringify({
        'action': 'appeals',
        appeals
    }));
}

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        message += '';
        const jsonMessage = JSON.parse(message);
        if (jsonMessage.cookie === null) {
            console.log('не авторизован');
        } else {
            const {roles: userRoles, teamId: teamId, gameId: gameId} =
                jwt.verify(jsonMessage.cookie, secret) as jwt.JwtPayload;

            if (!games[gameId]) {
                ws.send(JSON.stringify({
                    'action': 'error',
                    'gameIsStarted': games[gameId]
                }));
                return;
            }

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
                        result = seconds70PerQuestion + (addedTime[gameId] ?? 0);
                    }
                    ws.send(JSON.stringify({
                        'action': 'time',
                        'isStarted': gameIsTimerStart[gameId],
                        'maxTime': seconds70PerQuestion + (addedTime[gameId] ?? 0),
                        'time': result
                    }));
                    console.log(result);
                } else {
                    console.log('addedTime:', addedTime[gameId]);
                    ws.send(JSON.stringify({
                        'action': 'time',
                        'isStarted': gameIsTimerStart[gameId],
                        'maxTime': seconds70PerQuestion + (addedTime[gameId] ?? 0),
                        'time': seconds70PerQuestion + (addedTime[gameId] ?? 0)
                    }));
                }
            } else if (jsonMessage.action == 'changeQuestion') {
                gamesCurrentAnswer[gameId] = [jsonMessage.tourNumber, jsonMessage.questionNumber];
                ChangeQuestionNumber(gameId, jsonMessage.questionNumber, jsonMessage.tourNumber);
            } else if (jsonMessage.action == 'getQuestionNumber') {
                const result = games[gameId].rounds[0].questionsCount * (gamesCurrentAnswer[gameId][0] - 1) + gamesCurrentAnswer[gameId][1];
                ws.send(JSON.stringify({
                    'action': 'changeQuestionNumber',
                    'number': result,
                }));
            }
            if (userRoles == 'admin' || userRoles == 'superadmin') {
                gameAdmins[gameId].add(ws);
                if (jsonMessage.action == '+10sec') {
                    GiveAddedTime(gameId);
                } else if (jsonMessage.action == 'Start') {
                    StartTimer(gameId);
                } else if (jsonMessage.action == 'Pause') {
                    PauseTimer(gameId);
                } else if (jsonMessage.action == 'Stop') {
                    StopTimer(gameId);
                } else if (jsonMessage.action == 'AcceptAnswer') {
                    AcceptAnswer(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.answers);
                } else if (jsonMessage.action == 'AcceptAppeals') {
                    console.log(jsonMessage.appeals);
                    AcceptAppeal(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, teamId, jsonMessage.appeals);
                } else if (jsonMessage.action == 'RejectAnswer') {
                    RejectAnswer(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.answers);
                } else if (jsonMessage.action == 'RejectAppeals') {
                    RejectAppeal(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, teamId, jsonMessage.appeals);
                } else if (jsonMessage.action == 'getAnswers') {
                    GetAllTeamsAnswers(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, ws);
                } else if (jsonMessage.action == 'getAppeals') {
                    GetAllTeamsAppeals(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, ws);
                }
            } else {
                if (!games[gameId]) {
                    ws.send(JSON.stringify({
                        'action': 'error',
                        'gameIsStarted': games[gameId]
                    }));
                    return;
                }
                gameUsers[gameId].add(ws);
                if (gameIsTimerStart[gameId] && jsonMessage.action == 'Answer') {
                    GetAnswer(jsonMessage.answer, teamId, gameId); // TODO: отправить мол приняли ответ, а в юзерке выводить плашку, иначе красную
                    ws.send(JSON.stringify({
                        'action': 'statusAnswer',
                        'isAccepted': true
                    }));
                } else if (jsonMessage.action == 'Appeal') {
                    for (let ws of gameAdmins[gameId])
                        ws.send('Appeal'); // TODO: какой вопрос, тур? Отправлять в сообщении и брать оттуда

                    GetAppeal(jsonMessage.appeal, teamId, gameId, jsonMessage.number);
                } else if (jsonMessage.action == 'getTeamAnswers') {
                    const result = [];
                    const answers = games[gameId].teams[teamId].answers;
                    for (let i = 1; i < answers.length; i++) {
                        for (let j = 1; j < answers[i].length; j++) {
                            result.push({
                                number: (i - 1) * answers[i].length + j,
                                answer: answers[i][j].text,
                                status: answers[i][j].status
                            })
                        }
                    }
                    ws.send(JSON.stringify({
                        'action': 'teamAnswers',
                        'answers': result
                    }))
                }
            }
        }
    });
});


const starter = new Server().start(port)
    .then(port => console.log(`Running on port ${port}`))
    .catch(error => console.log(error));

export default starter;
