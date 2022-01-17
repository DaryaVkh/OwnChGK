import {Game} from './logic/Game';
import {CreateTransporter} from './email';
import {Status} from './logic/AnswerAndAppeal';
import jwt from 'jsonwebtoken';
import {secret} from './jwtToken';
import * as WebSocket from 'ws';

export const games: { [id: string]: Game; } = {};
export const gameAdmins: { [id: string]: any; } = {};
export const gameUsers: { [id: string]: any; } = {};

export const transporter = CreateTransporter('ownchgk@gmail.com', '6ownchgkgoogle');

export const seconds70PerQuestion = 70000;
export const extra10Seconds = 10000;

function GiveAddedTime(gameId: number) {
    if (games[gameId].timeIsOnPause) {
        games[gameId].leftTime += extra10Seconds;
        games[gameId].maxTime += extra10Seconds;
        console.log('added time is' + games[gameId].leftTime);
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'addTime',
                'maxTime': games[gameId].maxTime,
                'time': games[gameId].leftTime,
                'isStarted': false,
            }));
        }
    } else {
        if (!games[gameId].isTimerStart) {
            games[gameId].leftTime += extra10Seconds;
            games[gameId].maxTime += extra10Seconds;
            for (let user of gameUsers[gameId]) {
                user.send(JSON.stringify({
                    'action': 'addTime',
                    'maxTime': games[gameId].maxTime,
                    'time': games[gameId].leftTime,
                    'isStarted': false,
                }));
            }
        } else {
            const pastDelay = Math.floor(process.uptime() * 1000 - games[gameId].timer._idleStart);
            const initialDelay = games[gameId].timer._idleTimeout;
            clearTimeout(games[gameId].timer);
            games[gameId].isTimerStart = true;
            if (initialDelay - pastDelay < 0) {
                games[gameId].leftTime = extra10Seconds;
            } else games[gameId].leftTime = initialDelay - pastDelay + extra10Seconds;
            games[gameId].maxTime += extra10Seconds;
            games[gameId].timer = setTimeout(() => {
                console.log('added time end');
                games[gameId].isTimerStart = false;
                games[gameId].leftTime = 0;
            }, games[gameId].leftTime);
            console.log('t' + games[gameId].leftTime);
            for (let user of gameUsers[gameId]) {
                user.send(JSON.stringify({
                    'action': 'addTime',
                    'maxTime': games[gameId].maxTime,
                    'time': games[gameId].leftTime,
                    'isStarted': true,
                }));
            }
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
    if (!games[gameId].timeIsOnPause) {
        console.log('start')
        games[gameId].isTimerStart = true;
        games[gameId].timer = setTimeout(() => {
            games[gameId].isTimerStart = false;
            games[gameId].leftTime = 0;
            console.log('stop')
        }, games[gameId].leftTime);

        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'maxTime': games[gameId].maxTime,
                'time': games[gameId].leftTime
            }));
        }
    } else {
        console.log('startFromPause')
        games[gameId].isTimerStart = true;
        games[gameId].timeIsOnPause = false;
        games[gameId].timer = setTimeout(() => {
            games[gameId].isTimerStart = false;
            console.log('stop after pause')
            games[gameId].leftTime = 0
        }, games[gameId].leftTime);
        console.log(games[gameId].leftTime + 'added time to resp');
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'maxTime': games[gameId].maxTime,
                'time': games[gameId].leftTime
            }));
        }
    }
}

function StopTimer(gameId: number) {
    console.log('stop')
    games[gameId].isTimerStart = false;
    clearTimeout(games[gameId].timer);
    games[gameId].timeIsOnPause = false;
    games[gameId].leftTime = seconds70PerQuestion;
    games[gameId].maxTime = seconds70PerQuestion;
    for (let user of gameUsers[gameId]) {
        user.send(JSON.stringify({
            'action': 'stop'
        }));
    }
}

function PauseTimer(gameId: number) {
    if (games[gameId].isTimerStart) {
        console.log('pause')
        games[gameId].isTimerStart = false;
        games[gameId].timeIsOnPause = true;
        games[gameId].leftTime -= Math.floor(process.uptime() * 1000 - games[gameId].timer._idleStart);
        clearTimeout(games[gameId].timer);

        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'pause'
            }));
        }
    }
}

function GetAnswer(answer: string, teamId: number, gameId: number) {
    console.log('received: %s', answer, teamId);
    const roundNumber = games[gameId].currentQuestion[0] - 1;
    const questionNumber = games[gameId].currentQuestion[1] - 1;
    games[gameId].rounds[roundNumber].questions[questionNumber].giveAnswer(games[gameId].teams[teamId], answer);
}

function GetAppeal(appeal: string, teamId: number, gameId: number, number: number, answer: string) {
    console.log('received: %s', appeal, teamId);
    const roundNumber = Math.ceil(number / games[gameId].rounds[0].questionsCount);
    let questionNumber = number - (roundNumber - 1) * games[gameId].rounds[0].questionsCount;
    console.log(roundNumber, questionNumber);
    games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].giveAppeal(teamId, appeal, answer);
}

function AcceptAnswer(gameId: number, roundNumber: number, questionNumber: number, answers: string[]) {
    for (const answer of answers) {
        games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].acceptAnswers(answer);
    }
}

function AcceptAppeal(gameId: number, roundNumber: number, questionNumber: number, answers: string[]) {
    for (const answer of answers) {
        games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].acceptAppeal(answer, ''); // TODO: переписать, acceptAppeal должен принимать ответ, а не команду
    }
}

function RejectAppeal(gameId: number, roundNumber: number, questionNumber: number, answers: string[]) {
    for (const answer of answers) {
        games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].rejectAppeal(answer, '');
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

function GetAppealsByNumber(gameId: number, roundNumber: number, questionNumber: number, ws) {
    const appeals = games[gameId].rounds[roundNumber - 1].questions[questionNumber - 1].appeals
        .filter(value => value.status === Status.UnChecked)
        .map(appeal => {
            return {
                teamName: games[gameId].teams[appeal.teamNumber].name,
                text: appeal.text,
                answer: games[gameId].teams[appeal.teamNumber].getAnswer(roundNumber, questionNumber).text
            }
        });

    console.log('APPEALS', appeals);
    ws.send(JSON.stringify({
        'action': 'appealsByNumber',
        appeals
    }));
}

function GetAllAppeals(gameId: number, ws) {
    const res = [];
    for (let roundNumber = 0; roundNumber < games[gameId].rounds.length; roundNumber++) {
        for (let questionNumber = 0; questionNumber < games[gameId].rounds[roundNumber].questions.length; questionNumber++) {
            if (games[gameId].rounds[roundNumber].questions[questionNumber].appeals
                .filter(a => a.status === Status.UnChecked).length > 0)
                res.push(roundNumber * games[gameId].rounds[roundNumber].questions.length + (questionNumber + 1));
        }
    }
    ws.send(JSON.stringify({
        action: 'appeals',
        appealByQuestionNumber: res
    }));
}

export function HandlerWebsocket(ws: WebSocket, message: string) {
    message += '';
    const jsonMessage = JSON.parse(message);
    if (jsonMessage.action === 'ping') {
        ws.send(JSON.stringify({
            'action': 'pong'
        }));
    }
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
            if (games[gameId].timer) {
                const pastDelay = Math.floor(process.uptime() * 1000 - games[gameId].timer._idleStart);
                const initialDelay = games[gameId].timer._idleTimeout;
                let result = 0;
                if (games[gameId].isTimerStart) {
                    result = initialDelay - pastDelay;
                } else {
                    result = games[gameId].leftTime;
                }
                ws.send(JSON.stringify({
                    'action': 'time',
                    'isStarted': games[gameId].isTimerStart,
                    'maxTime': games[gameId].maxTime,
                    'time': result
                }));
                console.log(result);
            } else {
                ws.send(JSON.stringify({
                    'action': 'time',
                    'isStarted': games[gameId].isTimerStart,
                    'maxTime': games[gameId].maxTime,
                    'time': games[gameId].leftTime
                }));
            }
        } else if (jsonMessage.action == 'changeQuestion') {
            console.log('changeQuestion', jsonMessage.tourNumber, jsonMessage.questionNumber);
            games[gameId].currentQuestion = [jsonMessage.tourNumber, jsonMessage.questionNumber];
            ChangeQuestionNumber(gameId, jsonMessage.questionNumber, jsonMessage.tourNumber);
        } else if (jsonMessage.action == 'isOnBreak') {
            ws.send(JSON.stringify({
                action: 'isOnBreak',
                status: !games[gameId].status, //не статус = на паузе
                time: games[gameId].breakTime
            }))
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
                AcceptAppeal(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.appeals);
            } else if (jsonMessage.action == 'RejectAnswer') {
                RejectAnswer(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.answers);
            } else if (jsonMessage.action == 'RejectAppeals') {
                RejectAppeal(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.appeals);
            } else if (jsonMessage.action == 'getAnswers') {
                GetAllTeamsAnswers(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, ws);
            } else if (jsonMessage.action == 'getAppealsByNumber') {
                GetAppealsByNumber(gameId, jsonMessage.roundNumber, jsonMessage.questionNumber, ws);
            } else if (jsonMessage.action == 'getAllAppeals') {
                GetAllAppeals(gameId, ws);
            } else if (jsonMessage.action == 'breakTime') {
                games[gameId].startBreak(jsonMessage.time);
                for (const adminWs of gameAdmins[gameId]) {
                    adminWs.send(JSON.stringify({
                        action: 'isOnBreak',
                        status: true,
                        time: jsonMessage.time
                    }));
                }
                for (const userWs of gameUsers[gameId]) {
                    userWs.send(JSON.stringify({
                        action: 'isOnBreak',
                        status: true,
                        time: jsonMessage.time
                    }));
                }
            } else if (jsonMessage.action == 'stopBreak') {
                games[gameId].stopBreak();
                for (const userWs of gameUsers[gameId]) {
                    userWs.send(JSON.stringify({
                        action: 'isOnBreak',
                        status: false,
                        time: 0
                    }))
                }
            } else if (jsonMessage.action == 'getQuestionNumber') {
                console.log('tour ' + games[gameId].currentQuestion[0]);
                console.log('question ' + games[gameId].currentQuestion[1]);
                ws.send(JSON.stringify({
                    'action': 'changeQuestionNumber',
                    'round': games[gameId].currentQuestion[0],
                    'question': games[gameId].currentQuestion[1]
                }));
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
            if (games[gameId].isTimerStart && jsonMessage.action == 'Answer') {
                GetAnswer(jsonMessage.answer, teamId, gameId);
                ws.send(JSON.stringify({
                    'action': 'statusAnswer',
                    'isAccepted': true
                }));
            } else if (jsonMessage.action == 'appeal') {
                console.log(jsonMessage);
                GetAppeal(jsonMessage.appeal, teamId, gameId, jsonMessage.number, jsonMessage.answer);
                for (let ws of gameAdmins[gameId])
                    ws.send(JSON.stringify({
                        action: 'appeal',
                        questionNumber: jsonMessage.number
                    }));
            } else if (jsonMessage.action == 'getTeamAnswers') {
                const answers = games[gameId].teams[teamId].getAnswers();
                const result = answers.map((ans) => {
                    return {
                        number: (ans.roundNumber - 1) * games[gameId].rounds[0].questionsCount + ans.questionNumber,
                        answer: ans.text,
                        status: ans.status
                    }
                })
                ws.send(JSON.stringify({
                    'action': 'teamAnswers',
                    'answers': result
                }))
            } else if (jsonMessage.action == 'getQuestionNumber') {
                const result = games[gameId].rounds[0].questionsCount * (games[gameId].currentQuestion[0] - 1) + games[gameId].currentQuestion[1];
                ws.send(JSON.stringify({
                    'action': 'changeQuestionNumber',
                    'number': result,
                }));
            }
        }
    }
}