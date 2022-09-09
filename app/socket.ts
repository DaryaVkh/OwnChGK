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

function GiveAddedTime(gameId: number, gamePart: 'chgk' | 'matrix') {
    const game = gamePart === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    if (game.timeIsOnPause) {
        game.leftTime += extra10Seconds;
        game.maxTime += extra10Seconds;
        console.log('added time is ', game.leftTime);
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'addTime',
                'maxTime': game.maxTime,
                'time': game.leftTime,
                'isStarted': false,
            }));
        }
    } else {
        if (!game.isTimerStart) {
            game.leftTime += extra10Seconds;
            game.maxTime += extra10Seconds;
            for (let user of gameUsers[gameId]) {
                user.send(JSON.stringify({
                    'action': 'addTime',
                    'maxTime': game.maxTime,
                    'time': game.leftTime,
                    'isStarted': false,
                }));
            }
        } else {
            const pastDelay = Math.floor(process.uptime() * 1000 - game.timer._idleStart);
            const initialDelay = game.timer._idleTimeout;
            clearTimeout(game.timer);
            game.isTimerStart = true;
            if (initialDelay - pastDelay < 0) {
                game.leftTime = extra10Seconds;
            } else game.leftTime = initialDelay - pastDelay + extra10Seconds;
            game.maxTime += extra10Seconds;
            game.timer = setTimeout(() => {
                console.log('added time end, gameId = ', gameId);
                game.isTimerStart = false;
                game.leftTime = 0;
            }, game.leftTime);
            for (let user of gameUsers[gameId]) {
                user.send(JSON.stringify({
                    'action': 'addTime',
                    'maxTime': game.maxTime,
                    'time': game.leftTime,
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
            'matrixActive': {round: tourNumber, question: questionNumber},
            'number': bigGames[gameId].CurrentGame.rounds[0].questionsCount * (tourNumber - 1) + questionNumber,
            'activeGamePart': activeGamePart
        }));
    }
}

function StartTimer(gameId: number, gamePart: 'chgk' | 'matrix') {
    const game = gamePart === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    if (!game.timeIsOnPause) {
        console.log('start gameId = ', gameId);
        game.isTimerStart = true;
        game.timer = setTimeout(() => {
            game.isTimerStart = false;
            game.leftTime = 0;
            console.log('stop gameId = ', gameId);
        }, game.leftTime);

        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'maxTime': game.maxTime,
                'time': game.leftTime
            }));
        }
    } else {
        console.log('startFromPause gameId = ', gameId);
        game.isTimerStart = true;
        game.timeIsOnPause = false;
        game.timer = setTimeout(() => {
            game.isTimerStart = false;
            console.log('stop after pause gameId = ', gameId);
            game.leftTime = 0
        }, game.leftTime);
        console.log(game.leftTime, 'added time to resp gameId = ', gameId);
        for (let user of gameUsers[gameId]) {
            user.send(JSON.stringify({
                'action': 'start',
                'maxTime': game.maxTime,
                'time': game.leftTime
            }));
        }
    }
}

function StopTimer(gameId: number, gamePart: 'chgk' | 'matrix') {
    console.log('STOP gameId = ', gameId);
    const game = gamePart === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    game.isTimerStart = false;
    clearTimeout(game.timer);
    game.timeIsOnPause = false;
    game.leftTime = game.type === GameTypeLogic.ChGK
        ? seconds70PerQuestion
        : seconds20PerQuestion;
    game.maxTime = game.type === GameTypeLogic.ChGK
        ? seconds70PerQuestion
        : seconds20PerQuestion;
    for (let user of gameUsers[gameId]) {
        user.send(JSON.stringify({
            'action': 'stop',
            'activeGamePart': game.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix',
        }));
    }
}

function PauseTimer(gameId: number, gamePart: 'chgk' | 'matrix') {
    const game = gamePart === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    if (game.isTimerStart) {
        console.log('pause gameId = ', gameId);
        game.isTimerStart = false;
        game.timeIsOnPause = true;
        game.leftTime -= Math.floor(process.uptime() * 1000 - game.timer._idleStart);
        clearTimeout(game.timer);

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
    bigGames[gameId].CurrentGame.rounds[roundNumber].questions[questionNumber].acceptAnswers(process.env.ANSWER);
    ws.send(JSON.stringify({
        'action': 'statusAnswer',
        'isAccepted': true,
        'answer': answer,
        'activeGamePart': 'chgk'
    }));
}

function GiveAppeal(appeal: string, teamId: string, gameId: number, number: number, answer: string, gamePart: string) {
    console.log('received: %s', appeal, teamId);
    const game = gamePart === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    const roundNumber = Math.ceil(number / game.rounds[0].questionsCount);
    let questionNumber = number - (roundNumber - 1) * game.rounds[0].questionsCount;
    game.rounds[roundNumber - 1].questions[questionNumber - 1].giveAppeal(teamId, appeal, answer);
}

function AcceptAnswer(gameId: number, gameType: string, roundNumber: number, questionNumber: number, answers: string[]) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    for (const answer of answers) {
        game.rounds[roundNumber - 1].questions[questionNumber - 1].acceptAnswers(answer);
    }
}

function ChangeAnswer(gameId: number, gameType: string, teamName: string, number: number) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    let team;
    for (let id in game.teams)
    {
        if (game.teams[id].name === teamName) {
            team = game.teams[id];
            break;
        }
    }

    const roundNumber = Math.ceil(number / game.rounds[0].questionsCount);
    let questionNumber = number - (roundNumber - 1) * game.rounds[0].questionsCount;
    game.rounds[roundNumber - 1].questions[questionNumber - 1].changeAnswer(team, roundNumber, questionNumber, gameType === 'matrix');
}

function AcceptAppeal(gameId: number, gameType: string, roundNumber: number, questionNumber: number, answers: string[]) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    for (const answer of answers) {
        game.rounds[roundNumber - 1].questions[questionNumber - 1].acceptAppeal(answer, '');
    }
}

function RejectAppeal(gameId: number, gameType: string, roundNumber: number, questionNumber: number, answers: string[]) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    for (const answer of answers) {
        game.rounds[roundNumber - 1].questions[questionNumber - 1].rejectAppeal(answer, '');
    }
}

function RejectAnswer(gameId: number, gameType: string, roundNumber: number, questionNumber: number, answers: string[], isMatrixType = false) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    for (const answer of answers) {
        game.rounds[roundNumber - 1].questions[questionNumber - 1].rejectAnswers(answer, isMatrixType);
    }
}

function GetAllTeamsAnswers(gameId: number, gameType: string, roundNumber: number, questionNumber: number, ws) {
    const game = gameType === 'chgk' ? bigGames[gameId].ChGK : bigGames[gameId].Matrix;
    const answers = game.rounds[roundNumber - 1].questions[questionNumber - 1].answers.filter(ans => ans.text.length > 0);
    const acceptedAnswers = answers.filter(ans => ans.status === 0 && ans.text != process.env.ANSWER).map(ans => ans.text);
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
                teamName: game.teams[appeal.teamId].name,
                text: appeal.text,
                answer: game.teams[appeal.teamId].getAnswer(roundNumber, questionNumber).text
            }
        });

    console.log('appeals', appeals, 'In game = ', gameId);
    ws.send(JSON.stringify({
        'action': 'appealsByNumber',
        appeals
    }));
}

function GetAllAppeals(gameId: number, ws) { // Тут вроде CurrentGame законно: метод нужен для индикации апелляций в текущей игре
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
    console.log('received: %s', answer, roundNumber, questionNumber, teamId, bigGames[gameId].Matrix.type);
    bigGames[gameId].Matrix.rounds[roundNumber - 1].questions[questionNumber - 1].giveAnswer(bigGames[gameId].Matrix.teams[teamId], answer);
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
    if (!bigGames[gameId].CurrentGame.currentQuestion) {
        console.log('currentQuestion is undefined');
        ws.send(JSON.stringify({
            'action': 'questionNumberIsUndefined',
            'activeGamePart': bigGames[gameId].CurrentGame.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix',
        }));
        return;
    }

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
        'matrixActive': {round: game.currentQuestion[0], question: game.currentQuestion[1]},
        'activeGamePart': game.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix',
    }));
}

function GetTeamAnswers(gameId, teamId, ws) {
    let answer: { [key: string]: { number: number, answer: string, status: Status }[] };
    answer = {};
    if (bigGames[gameId].ChGK) {
        const chgk = bigGames[gameId].ChGK.teams[teamId].getAnswers();
        answer['chgk'] = chgk.map((ans) => {
            return {
                number: (ans.roundNumber - 1) * bigGames[gameId].ChGK.rounds[0].questionsCount + ans.questionNumber,
                roundNumber: ans.roundNumber,
                questionNumber: ans.questionNumber,
                answer: ans.text,
                status: ans.status
            }
        });
    }
    if (bigGames[gameId].Matrix) {
        const matrix = bigGames[gameId].Matrix.teams[teamId].getAnswers();

        answer['matrix'] = matrix.map((ans) => {
            return {
                number: (ans.roundNumber - 1) * bigGames[gameId].Matrix.rounds[0].questionsCount + ans.questionNumber,
                roundNumber: ans.roundNumber,
                questionNumber: ans.questionNumber,
                answer: ans.text,
                status: ans.status
            }
        });

    }

    ws.send(JSON.stringify({
        'action': 'teamAnswers',
        'chgkAnswers': answer['chgk'],
        'matrixAnswers': answer['matrix']
    }))
}

function GetTeamAnswersForAdmin(gameId, teamName, ws) {
    let answer: { [key: string]: { number: number, answer: string, status: Status }[] };
    answer = {};
    let chgk;
    if (bigGames[gameId].ChGK) {
        for (let id in bigGames[gameId].ChGK.teams)
        {
            if (bigGames[gameId].ChGK.teams[id].name === teamName) {
                chgk = bigGames[gameId].ChGK.teams[id].getAnswers();
                break;
            }
        }
        answer['chgk'] = chgk.map((ans) => {
            return {
                number: (ans.roundNumber - 1) * bigGames[gameId].ChGK.rounds[0].questionsCount + ans.questionNumber,
                roundNumber: ans.roundNumber,
                questionNumber: ans.questionNumber,
                answer: ans.text,
                status: ans.status
            }
        });
    }
    if (bigGames[gameId].Matrix) {
        let matrix;
        for (let id in bigGames[gameId].Matrix.teams)
        {
            if (bigGames[gameId].Matrix.teams[id].name === teamName) {
                matrix = bigGames[gameId].Matrix.teams[id].getAnswers();
            }
        }

        answer['matrix'] = matrix.map((ans) => {
            return {
                number: (ans.roundNumber - 1) * bigGames[gameId].Matrix.rounds[0].questionsCount + ans.questionNumber,
                roundNumber: ans.roundNumber,
                questionNumber: ans.questionNumber,
                answer: ans.text,
                status: ans.status
            }
        });

    }

    ws.send(JSON.stringify({
        'action': 'teamAnswersForAdmin',
        'chgkAnswers': answer['chgk'],
        'matrixAnswers': answer['matrix'],
        'chgkQuestionsCount': bigGames[gameId].ChGK ? bigGames[gameId].ChGK.rounds.length * bigGames[gameId].ChGK.rounds[0].questionsCount : 0,
        'matrixQuestionsCount': bigGames[gameId].Matrix ? bigGames[gameId].Matrix.rounds.length * bigGames[gameId].Matrix.rounds[0].questionsCount : 0,
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
    if (!gameAdmins[gameId].has(ws)) {
        gameAdmins[gameId].add(ws);
        ws.on('close', function() {
            gameAdmins[gameId].delete(ws);
        });
    }

    switch (jsonMessage.action) {
        case '+10sec':
            GiveAddedTime(gameId, jsonMessage.gamePart);
            break;
        case 'Start':
            StartTimer(gameId, jsonMessage.gamePart);
            break;
        case 'Pause':
            PauseTimer(gameId, jsonMessage.gamePart);
            break;
        case 'Stop':
            StopTimer(gameId, jsonMessage.gamePart);
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
        case 'getTeamAnswersForAdmin':
            GetTeamAnswersForAdmin(gameId, jsonMessage.teamName, ws);
            break;
        case 'changeAnswer':
            ChangeAnswer(gameId, jsonMessage.gamePart, jsonMessage.teamName, jsonMessage.number);
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
    if (!gameUsers[gameId].has(ws)) {
        gameUsers[gameId].add(ws);
        ws.on('close', function() {
            gameUsers[gameId].delete(ws);
        });
    }
    switch (jsonMessage.action) {
        case 'Answer':
            if (gameType === GameTypeLogic.ChGK && bigGames[gameId].CurrentGame.isTimerStart) {
                GiveAnswer(jsonMessage.answer, teamId, gameId, ws);
            } else if (gameType === GameTypeLogic.Matrix) {
                GiveAnswerMatrix(jsonMessage.answer, jsonMessage.roundNumber, jsonMessage.questionNumber, jsonMessage.roundName, teamId, gameId, ws);
            }
            break;
        case 'appeal':
            GiveAppeal(jsonMessage.appeal, teamId, gameId, jsonMessage.number, jsonMessage.answer, jsonMessage.gamePart);
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

function GetPreliminaryTime(gameId) {
    if (bigGames[gameId].CurrentGame.timer) {
        const pastDelay = Math.floor(process.uptime() * 1000 - bigGames[gameId].CurrentGame.timer._idleStart);
        const initialDelay = bigGames[gameId].CurrentGame.timer._idleTimeout;
        if (bigGames[gameId].CurrentGame.isTimerStart) {
            return initialDelay - pastDelay;
        } else {
            return bigGames[gameId].CurrentGame.leftTime;
        }
    }

    return bigGames[gameId].CurrentGame.leftTime;
}

function GetTime(gameId, ws) {
    ws.send(JSON.stringify({
        'action': 'time',
        'isStarted': bigGames[gameId].CurrentGame.isTimerStart,
        'maxTime': bigGames[gameId].CurrentGame.maxTime,
        'time': GetPreliminaryTime(gameId),
        'gamePart': bigGames[gameId].CurrentGame.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix'
    }));
}

function CheckTime(gameId, ws) {
    ws.send(JSON.stringify({
        'action': 'checkTime',
        'maxTime': bigGames[gameId].CurrentGame.maxTime,
        'time': GetPreliminaryTime(gameId),
        'gamePart': bigGames[gameId].CurrentGame.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix'
    }));
}

function CheckBreakTime(gameId, ws, jsonMessage) {
    ws.send(JSON.stringify({
        'action': 'checkBreakTime',
        'currentTime': jsonMessage.time,
        'time': bigGames[gameId].breakTime
    }))
}

function IsOnBreak(gameId, ws) {
    ws.send(JSON.stringify({
        action: 'isOnBreak',
        status: bigGames[gameId].status === GameStatus.IsOnBreak,
        time: bigGames[gameId].breakTime
    }));
}

function getGameStatus(gameId, ws) {
    const currentGame = bigGames[gameId]?.CurrentGame

    if (currentGame) {
        const currentQuestionNumber = currentGame.currentQuestion
            ? currentGame.rounds[0].questionsCount * (currentGame.currentQuestion[0] - 1) + currentGame.currentQuestion[1]
            : undefined;

        ws.send(JSON.stringify({
            'action': 'gameStatus',
            'isStarted': !!bigGames[gameId] && bigGames[gameId].CurrentGame.currentQuestion,
            'activeGamePart': currentGame.type === GameTypeLogic.ChGK ? 'chgk' : 'matrix',
            'isOnBreak': bigGames[gameId].status === GameStatus.IsOnBreak,
            'breakTime': bigGames[gameId].breakTime,
            'currentQuestionNumber': currentQuestionNumber, //todo: тут вроде надо ток для чгк
            'matrixActive': currentGame.type === GameTypeLogic.Matrix && currentGame.currentQuestion ? {
                round: currentGame.currentQuestion[0],
                question: currentGame.currentQuestion[1]
            } : null,
            'maxTime': currentGame.maxTime,
            'time': GetPreliminaryTime(gameId),
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
            case 'checkTime':
                CheckTime(gameId, ws);
                break;
            case 'checkBreakTime':
                CheckBreakTime(gameId, ws, jsonMessage);
                break;
            case 'isOnBreak':
                IsOnBreak(gameId, ws);
                break;
            case 'checkStart':
                getGameStatus(gameId, ws);
                break;
        }

        if (userRoles == 'admin' || userRoles == 'superadmin') {
            AdminsAction(gameId, ws, jsonMessage, gameType);
        } else {
            UsersAction(gameId, ws, jsonMessage, gameType, teamId);
        }
    }
}
