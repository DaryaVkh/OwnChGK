import {GameStatus, GameTypeLogic} from './logic/Game';
import {Status} from './logic/AnswerAndAppeal';
import jwt from 'jsonwebtoken';
import {secret} from './jwtToken';
import * as WebSocket from 'ws';
import {BigGameLogic} from "./logic/BigGameLogic";

export const bigGames: { [id: string]: BigGameLogic; } = {};
export const gameAdmins: { [id: string]: any; } = {};
export const gameUsers: { [id: string]: any; } = {};
export const seconds70PerQuestion = 70000;
export const seconds20PerQuestion = 20000;
export const extra10Seconds = 10000;

function GiveAddedTime(gameId: number) {
    if (bigGames[gameId].CurrentGame.timeIsOnPause) {
        bigGames[gameId].CurrentGame.leftTime += extra10Seconds;
        bigGames[gameId].CurrentGame.maxTime += extra10Seconds;
        console.log('added time is ', bigGames[gameId].CurrentGame.leftTime);
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'addTime',
                'maxTime': bigGames[gameId].CurrentGame.maxTime,
                'time': bigGames[gameId].CurrentGame.leftTime,
                'isStarted': false,
            }));
        }
    } else {
        if (!bigGames[gameId].CurrentGame.isTimerStart) {
            bigGames[gameId].CurrentGame.leftTime += extra10Seconds;
            bigGames[gameId].CurrentGame.maxTime += extra10Seconds;
            for (let user of gameUsers[gameId]) {
                user.send(JSON.stringify({
                    'action': 'addTime',
                    'maxTime': bigGames[gameId].CurrentGame.maxTime,
                    'time': bigGames[gameId].CurrentGame.leftTime,
                    'isStarted': false,
                }));
            }
        } else {
            const pastDelay = Math.floor(process.uptime() * 1000 - bigGames[gameId].CurrentGame.timer._idleStart);
            const initialDelay = bigGames[gameId].CurrentGame.timer._idleTimeout;
            clearTimeout(bigGames[gameId].CurrentGame.timer);
            bigGames[gameId].CurrentGame.isTimerStart = true;
            if (initialDelay - pastDelay < 0) {
                bigGames[gameId].CurrentGame.leftTime = extra10Seconds;
            } else bigGames[gameId].CurrentGame.leftTime = initialDelay - pastDelay + extra10Seconds;
            bigGames[gameId].CurrentGame.maxTime += extra10Seconds;
            bigGames[gameId].CurrentGame.timer = setTimeout(() => {
                console.log('added time end, gameId = ', gameId);
                bigGames[gameId].CurrentGame.isTimerStart = false;
                bigGames[gameId].CurrentGame.leftTime = 0;
            }, bigGames[gameId].CurrentGame.leftTime);
            for (let user of gameUsers[gameId]) {
                user.send(JSON.stringify({
                    'action': 'addTime',
                    'maxTime': bigGames[gameId].CurrentGame.maxTime,
                    'time': bigGames[gameId].CurrentGame.leftTime,
                    'isStarted': true,
                }));
            }
        }
    }
}

function ChangeQuestionNumber(gameId: number, questionNumber: number, tourNumber: number, activeGamePart: string) {
    console.log('changeQuestion ', activeGamePart, tourNumber, questionNumber, 'with gameId= ', gameId);
    bigGames[gameId].CurrentGame = activeGamePart === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix
    bigGames[gameId].CurrentGame.currentQuestion = [tourNumber, questionNumber];

    for (let user of gameUsers[gameId]) {
        user.send(JSON.stringify({
            'action': 'changeQuestionNumber',
            'number': bigGames[gameId].CurrentGame.rounds[0].questionsCount * (tourNumber - 1) + questionNumber,
            'activeGamePart': activeGamePart
        }));
    }
}

function StartTimer(gameId: number) {
    if (!bigGames[gameId].CurrentGame.timeIsOnPause) {
        console.log('start gameId = ', gameId);
        bigGames[gameId].CurrentGame.isTimerStart = true;
        bigGames[gameId].CurrentGame.timer = setTimeout(() => {
            bigGames[gameId].CurrentGame.isTimerStart = false;
            bigGames[gameId].CurrentGame.leftTime = 0;
            console.log('stop gameId = ', gameId);
        }, bigGames[gameId].CurrentGame.leftTime);

        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'maxTime': bigGames[gameId].CurrentGame.maxTime,
                'time': bigGames[gameId].CurrentGame.leftTime
            }));
        }
    } else {
        console.log('startFromPause gameId = ', gameId);
        bigGames[gameId].CurrentGame.isTimerStart = true;
        bigGames[gameId].CurrentGame.timeIsOnPause = false;
        bigGames[gameId].CurrentGame.timer = setTimeout(() => {
            bigGames[gameId].CurrentGame.isTimerStart = false;
            console.log('stop after pause gameId = ', gameId);
            bigGames[gameId].CurrentGame.leftTime = 0
        }, bigGames[gameId].CurrentGame.leftTime);
        console.log(bigGames[gameId].CurrentGame.leftTime, 'added time to resp gameId = ', gameId);
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'maxTime': bigGames[gameId].CurrentGame.maxTime,
                'time': bigGames[gameId].CurrentGame.leftTime
            }));
        }
    }
}

function StopTimer(gameId: number) {
    console.log('STOP gameId = ', gameId);
    bigGames[gameId].CurrentGame.isTimerStart = false;
    clearTimeout(bigGames[gameId].CurrentGame.timer);
    bigGames[gameId].CurrentGame.timeIsOnPause = false;
    bigGames[gameId].CurrentGame.leftTime = bigGames[gameId].CurrentGame.type === GameTypeLogic.ChGK
        ? seconds70PerQuestion
        : seconds20PerQuestion;
    bigGames[gameId].CurrentGame.maxTime = bigGames[gameId].CurrentGame.type === GameTypeLogic.ChGK
        ? seconds70PerQuestion
        : seconds20PerQuestion;
    for (let user of gameUsers[gameId]) {
        user.send(JSON.stringify({
            'action': 'stop',
            'activeGamePart': bigGames[gameId].CurrentGame.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix',
        }));
    }
}

function PauseTimer(gameId: number) {
    if (bigGames[gameId].CurrentGame.isTimerStart) {
        console.log('pause gameId = ', gameId);
        bigGames[gameId].CurrentGame.isTimerStart = false;
        bigGames[gameId].CurrentGame.timeIsOnPause = true;
        bigGames[gameId].CurrentGame.leftTime -= Math.floor(process.uptime() * 1000 - bigGames[gameId].CurrentGame.timer._idleStart);
        clearTimeout(bigGames[gameId].CurrentGame.timer);

        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'pause'
            }));
        }
    }
}

function GiveAnswer(answer: string, teamId: string, gameId: number, ws) {
    console.log('received: %s', answer, teamId);
    const roundNumber = bigGames[gameId].CurrentGame.currentQuestion[0] - 1;
    const questionNumber = bigGames[gameId].CurrentGame.currentQuestion[1] - 1;
    bigGames[gameId].CurrentGame.rounds[roundNumber].questions[questionNumber].giveAnswer(bigGames[gameId].CurrentGame.teams[teamId], answer);
    ws.send(JSON.stringify({
        'action': 'statusAnswer',
        'isAccepted': true,
        'answer': answer,
        'activeGamePart': 'chgk'
    }));
}

function GiveAppeal(appeal: string, teamId: string, gameId: number, number: number, answer: string) {
    console.log('received: %s', appeal, teamId);
    const roundNumber = Math.ceil(number / bigGames[gameId].CurrentGame.rounds[0].questionsCount);
    let questionNumber = number - (roundNumber - 1) * bigGames[gameId].CurrentGame.rounds[0].questionsCount;
    bigGames[gameId].CurrentGame.rounds[roundNumber - 1].questions[questionNumber - 1].giveAppeal(teamId, appeal, answer);
}

function AcceptAnswer(gameId: number, gameType: string, roundNumber: number, questionNumber: number, answers: string[]) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    for (const answer of answers) {
        game.rounds[roundNumber - 1].questions[questionNumber - 1].acceptAnswers(answer);
    }
}

function AcceptAppeal(gameId: number, gameType: string, roundNumber: number, questionNumber: number, answers: string[]) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    for (const answer of answers) {
        bigGames[gameId].CurrentGame.rounds[roundNumber - 1].questions[questionNumber - 1].acceptAppeal(answer, '');
    }
}

function RejectAppeal(gameId: number, gameType: string, roundNumber: number, questionNumber: number, answers: string[]) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    for (const answer of answers) {
        bigGames[gameId].CurrentGame.rounds[roundNumber - 1].questions[questionNumber - 1].rejectAppeal(answer, '');
    }
}

function RejectAnswer(gameId: number, gameType: string, roundNumber: number, questionNumber: number, answers: string[], isMatrixType = false) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    for (const answer of answers) {
        bigGames[gameId].CurrentGame.rounds[roundNumber - 1].questions[questionNumber - 1].rejectAnswers(answer, isMatrixType);
    }
}

function GetAllTeamsAnswers(gameId: number, gameType: string, roundNumber: number, questionNumber: number, ws) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    const answers = game.rounds[roundNumber - 1].questions[questionNumber - 1].answers;
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

function GetAppealsByNumber(gameId: number, gameType: string, roundNumber: number, questionNumber: number, ws) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    const appeals = game.rounds[roundNumber - 1].questions[questionNumber - 1].appeals
        .filter(value => value.status === Status.UnChecked)
        .map(appeal => {
            return {
                teamName: bigGames[gameId].CurrentGame.teams[appeal.teamId].name,
                text: appeal.text,
                answer: bigGames[gameId].CurrentGame.teams[appeal.teamId].getAnswer(roundNumber, questionNumber).text
            }
        });

    console.log('appeals', appeals, 'In game = ', gameId);
    ws.send(JSON.stringify({
        'action': 'appealsByNumber',
        appeals
    }));
}

function GetAllAppeals(gameId: number, ws) {
    const res = [];
    for (let roundNumber = 0; roundNumber < bigGames[gameId].CurrentGame.rounds.length; roundNumber++) {
        for (let questionNumber = 0; questionNumber < bigGames[gameId].CurrentGame.rounds[roundNumber].questions.length; questionNumber++) {
            if (bigGames[gameId].CurrentGame.rounds[roundNumber].questions[questionNumber].appeals
                .filter(a => a.status === Status.UnChecked).length > 0)
                res.push(roundNumber * bigGames[gameId].CurrentGame.rounds[roundNumber].questions.length + (questionNumber + 1));
        }
    }
    ws.send(JSON.stringify({
        action: 'appeals',
        appealByQuestionNumber: res
    }));
}

function GiveAnswerMatrix(answer: string, roundNumber: number, questionNumber: number, roundName: string, teamId: any, gameId: any, ws) {
    console.log('received: %s', answer, roundNumber, questionNumber, teamId, bigGames[gameId].CurrentGame.type);
    bigGames[gameId].CurrentGame.rounds[roundNumber - 1].questions[questionNumber - 1].giveAnswer(bigGames[gameId].CurrentGame.teams[teamId], answer);
    ws.send(JSON.stringify({
        'action': 'statusAnswer',
        'isAccepted': true,
        'roundNumber': roundNumber,
        'questionNumber': questionNumber,
        'roundName': roundName,
        'answer': answer,
        'activeGamePart': 'matrix'
    }));
}

function StartBreakTime(gameId, time) {
    bigGames[gameId].startBreak(time);
    for (const adminWs of gameAdmins[gameId]) {
        adminWs.send(JSON.stringify({
            action: 'isOnBreak',
            status: true,
            time: time
        }));
    }
    for (const userWs of gameUsers[gameId]) {
        userWs.send(JSON.stringify({
            action: 'isOnBreak',
            status: true,
            time: time
        }));
    }
}

function StopBreakTime(gameId) {
    bigGames[gameId].stopBreak();
    for (const userWs of gameUsers[gameId]) {
        userWs.send(JSON.stringify({
            action: 'isOnBreak',
            status: false,
            time: 0
        }))
    }
}

function GetQuestionNumber(gameId, ws) {
    console.log('tour ' + bigGames[gameId].CurrentGame.currentQuestion[0], 'in game = ', gameId);
    console.log('question ' + bigGames[gameId].CurrentGame.currentQuestion[1], 'in game = ', gameId);
    ws.send(JSON.stringify({
        'action': 'changeQuestionNumber',
        'round': bigGames[gameId].CurrentGame.currentQuestion[0],
        'question': bigGames[gameId].CurrentGame.currentQuestion[1],
        'activeGamePart': bigGames[gameId].CurrentGame.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix',
    }));
}

function GetQuestionNumberForUser(gameId, ws) {
    const game = bigGames[gameId].CurrentGame
    const result = game.rounds[0].questionsCount * (game.currentQuestion[0] - 1) + game.currentQuestion[1];
    ws.send(JSON.stringify({
        'action': 'currentQuestionNumber',
        'number': result,
        'activeGamePart': game.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix',
    }));
}

function GetTeamAnswers(gameId, teamId, ws) {
    const answers = bigGames[gameId].CurrentGame.teams[teamId].getAnswers();
    const result = answers.map((ans) => {
        return {
            number: (ans.roundNumber - 1) * bigGames[gameId].CurrentGame.rounds[0].questionsCount + ans.questionNumber,
            answer: ans.text,
            status: ans.status
        }
    })
    ws.send(JSON.stringify({
        'action': 'teamAnswers',
        'answers': result
    }))
}

function NotifyAdminsAboutAppeal(gameId, number) {
    for (let ws of gameAdmins[gameId])
        ws.send(JSON.stringify({
            action: 'appeal',
            questionNumber: number
        }));
}

function AdminsAction(gameId, ws, jsonMessage, gameType) {
    gameAdmins[gameId].add(ws);
    switch (jsonMessage.action) {
        case '+10sec':
            GiveAddedTime(gameId);
            break;
        case 'Start':
            StartTimer(gameId);
            break;
        case 'Pause':
            PauseTimer(gameId);
            break;
        case 'Stop':
            StopTimer(gameId);
            break;
        case 'AcceptAnswer':
            AcceptAnswer(gameId, jsonMessage.gamePart, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.answers);
            break;
        case 'AcceptAppeals':
            AcceptAppeal(gameId, jsonMessage.gamePart, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.appeals);
            break;
        case 'RejectAnswer':
            RejectAnswer(gameId, jsonMessage.gamePart, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.answers, gameType === GameTypeLogic.Matrix);
            break;
        case 'RejectAppeals':
            RejectAppeal(gameId, jsonMessage.gamePart, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.appeals);
            break;
        case 'getAnswers':
            GetAllTeamsAnswers(gameId, jsonMessage.gamePart, jsonMessage.roundNumber, jsonMessage.questionNumber, ws);
            break;
        case 'getAppealsByNumber':
            GetAppealsByNumber(gameId, jsonMessage.gamePart, jsonMessage.roundNumber, jsonMessage.questionNumber, ws);
            break;
        case 'getAllAppeals':
            GetAllAppeals(gameId, ws);
            break;
        case 'breakTime':
            StartBreakTime(gameId, jsonMessage.time);
            break;
        case 'stopBreak':
            StopBreakTime(gameId);
            break;
        case 'changeQuestion':
            ChangeQuestionNumber(gameId, jsonMessage.questionNumber, jsonMessage.tourNumber, jsonMessage.activeGamePart);
            break;
        case 'getQuestionNumber':
            GetQuestionNumber(gameId, ws);
            break;
    }
}

function UsersAction(gameId, ws, jsonMessage, gameType, teamId) {
    if (!bigGames[gameId].CurrentGame) {
        ws.send(JSON.stringify({
            'action': 'error',
            'gameIsStarted': bigGames[gameId].CurrentGame
        }));
        return;
    }
    gameUsers[gameId].add(ws);
    switch (jsonMessage.action) {
        case 'Answer':
            if (gameType === GameTypeLogic.ChGK && bigGames[gameId].CurrentGame.isTimerStart) {
                GiveAnswer(jsonMessage.answer, teamId, gameId, ws);
            } else if (gameType === GameTypeLogic.Matrix) {
                GiveAnswerMatrix(jsonMessage.answer, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.roundName, teamId, gameId, ws);
            }
            break;
        case 'appeal':
            GiveAppeal(jsonMessage.appeal, teamId, gameId, jsonMessage.number, jsonMessage.answer);
            NotifyAdminsAboutAppeal(gameId, jsonMessage.number);
            break;
        case 'getTeamAnswers':
            GetTeamAnswers(gameId, teamId, ws);
            break;
        case 'getQuestionNumber':
            GetQuestionNumberForUser(gameId, ws);
            break;
    }
}

function GetTime(gameId, ws) {
    if (bigGames[gameId].CurrentGame.timer) {
        const pastDelay = Math.floor(process.uptime() * 1000 - bigGames[gameId].CurrentGame.timer._idleStart);
        const initialDelay = bigGames[gameId].CurrentGame.timer._idleTimeout;
        let result: number;
        if (bigGames[gameId].CurrentGame.isTimerStart) {
            result = initialDelay - pastDelay;
        } else {
            result = bigGames[gameId].CurrentGame.leftTime;
        }
        ws.send(JSON.stringify({
            'action': 'time',
            'isStarted': bigGames[gameId].CurrentGame.isTimerStart,
            'maxTime': bigGames[gameId].CurrentGame.maxTime,
            'time': result
        }));
    } else {
        ws.send(JSON.stringify({
            'action': 'time',
            'isStarted': bigGames[gameId].CurrentGame.isTimerStart,
            'maxTime': bigGames[gameId].CurrentGame.maxTime,
            'time': bigGames[gameId].CurrentGame.leftTime
        }));
    }
}

function IsOnBreak(gameId, ws) {
    ws.send(JSON.stringify({
        action: 'isOnBreak',
        status: bigGames[gameId].status === GameStatus.IsOnBreak,
        time: bigGames[gameId].breakTime
    }))
}

function CheckStart(gameId, ws) {
    if (bigGames[gameId].CurrentGame) {
        ws.send(JSON.stringify({
            'action': 'gameStatus',
            'isStarted': !!bigGames[gameId],
            'activeGamePart': bigGames[gameId].CurrentGame.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix',
        }));
    }
}

function NotAuthorizeMessage(ws) {
    ws.send(JSON.stringify({
        'action': 'notAuthorized'
    }));
    console.log('not authorized');
}

export function HandlerWebsocket(ws: WebSocket, message: string) {
    message += '';
    const jsonMessage = JSON.parse(message);
    if (jsonMessage.action === 'ping') {
        ws.send(JSON.stringify({
            'action': 'pong'
        }));
        return;
    }
    if (!jsonMessage || !jsonMessage.cookie) {
        NotAuthorizeMessage(ws);
    } else {
        const {roles: userRoles, teamId: teamId, gameId: gameId} =
            jwt.verify(jsonMessage.cookie, secret) as jwt.JwtPayload;
        if (!bigGames[gameId] || (userRoles === 'user' && !bigGames[gameId].CurrentGame.teams[teamId])) {
            ws.send(JSON.stringify({
                'action': 'gameNotStarted'
            }));
            return;
        }

        const gameType = bigGames[gameId].CurrentGame.type;

        switch (jsonMessage.action) {
            case 'time':
                GetTime(gameId, ws);
                break;
            case 'isOnBreak':
                IsOnBreak(gameId, ws);
                break;
            case 'checkStart':
                CheckStart(gameId, ws);
                break;
        }

        if (userRoles == 'admin' || userRoles == 'superadmin') {
            AdminsAction(gameId, ws, jsonMessage, gameType);
        } else {
            UsersAction(gameId, ws, jsonMessage, gameType, teamId);
        }
    }
}
