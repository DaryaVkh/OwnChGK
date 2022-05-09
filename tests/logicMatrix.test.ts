import {Team} from "../app/logic/Team";
import {Question} from "../app/logic/Question";
import {Status} from "../app/logic/AnswerAndAppeal"
import {Game, GameTypeLogic, Round} from "../app/logic/Game";

let game;
let team;
let question;
let round;

beforeEach(() => {
    game = new Game("newGame", GameTypeLogic.Matrix);
    team = new Team("cool", "1");
    game.addTeam(team);
    game.addRound(new Round(1, 5, 20, GameTypeLogic.Matrix));
    round = game.rounds[0];
    question = round.questions[0];
});

test('Should_set_right_answer', () => {
    question.giveAnswer(team, "rightAnswer");
    question.acceptAnswers("rightAnswer");

    const teamAnswer = team.getAnswer(1, 1);
    expect(teamAnswer).not.toBeUndefined();
    if (teamAnswer !== undefined) {
        expect(teamAnswer.status).toBe(Status.Right);
        expect(teamAnswer.score).toBe(question.cost);
    }
});

test('Should_not_set_wrong_answer', () => {
    question.giveAnswer(team, "wrongAnswer");
    question.acceptAnswers("rightAnswer");
    const teamAnswer = team.getAnswer(1, 1);

    expect(teamAnswer).not.toBeUndefined();
    if (teamAnswer !== undefined) {
        expect(teamAnswer.status).toBe(Status.UnChecked);
        expect(teamAnswer.score).toBe(0);
    }
});

test('Should_get_total_score_when_all_answers_right', () => {
    const totalRoundMatrixRightCost = 150;
    const round = new Round(1, 5, 50, GameTypeLogic.Matrix);

    for (let i = 0; i < 5; i++) {
        round.questions[i].giveAnswer(team, "rightAnswer");
        round.questions[i].acceptAnswers("rightAnswer");
    }

    expect(team.getTotalScore()).toBe(totalRoundMatrixRightCost);
});

test('Should_get_0_in_total_score_when_no_answers', () => {
    const round = new Round(1, 5, 50, GameTypeLogic.Matrix);

    for (let i = 0; i < 5; i++) {
        round.questions[i].acceptAnswers("rightAnswer");
    }

    expect(team.getTotalScore()).toBe(0);
});

test('Should_get_negative_total_score_when_all_answers_wrong', () => {
    const totalRoundMatrixWrongCost = -150;
    const round = new Round(1, 5, 50, GameTypeLogic.Matrix);

    for (let i = 0; i < 5; i++) {
        round.questions[i].giveAnswer(team, "wrongAnswer");
        round.questions[i].rejectAnswers("wrongAnswer", true);
    }

    expect(team.getTotalScore()).toBe(totalRoundMatrixWrongCost);
});

test('Should_return_total_score_when_one_answer_wrong_and_one_right', () => {
    const expectedTotalScore = 10;
    const round = new Round(1, 5, 50, GameTypeLogic.Matrix);

    round.questions[0].giveAnswer(team, "wrongAnswer");
    round.questions[1].giveAnswer(team, "rightAnswer");

    for (let i = 0; i < 5; i++) {
        round.questions[i].acceptAnswers("rightAnswer");
        round.questions[i].rejectAnswers("wrongAnswer", true);
    }

    expect(team.getTotalScore()).toBe(expectedTotalScore);
});

test('Should_get_team_answer_when_it_exist', () => {
    const round1 = game.rounds[0];
    const round2 = new Round(2, 5, 50, GameTypeLogic.Matrix);

    round1.questions[0].giveAnswer(team, "right1");
    round1.questions[0].acceptAnswers("right1");

    round1.questions[1].giveAnswer(team, "right2");
    round1.questions[1].acceptAnswers("right2");

    round2.questions[0].giveAnswer(team, "right3");
    round2.questions[0].acceptAnswers("right3");

    const answer = team.getAnswer(1, 2);
    expect(answer).not.toBeUndefined();
    if (answer !== undefined) {
        expect(answer.text).toBe("right2");
        expect(answer.score).toBe(round1.questions[1].cost);
        expect(answer.status).toBe(Status.Right);
    }
})

test('Should_get_team_answer_when_it_not_exist', () => {
    const question = new Question(1, 1, 1, 50);

    question.acceptAnswers("right");

    expect(team.getAnswer(1, 1)).toBeUndefined();
})

test('Should_create_questions_as_in_setting', () => {
    const round = new Round(1, 5, 50, GameTypeLogic.Matrix);

    expect(round.questions.length).toBe(round.questionsCount);
});

test('Should_give_questions_different_numbers', () => {
    const round = new Round(1, 5, 50, GameTypeLogic.Matrix);

    expect(round.questions[0].number).toBe(1);
    expect(round.questions[1].number).toBe(2);
    expect(round.questions[4].number).toBe(5);
});

test('Should_not_change_score_when_answer_already_accept', () => {
    question.giveAnswer(team, "right");
    question.acceptAnswers("right");

    question.acceptAnswers("right");

    expect(team.getTotalScore()).toBe(question.cost);
    const answer = team.getAnswer(1, 1);
    expect(answer.score).toBe(question.cost);
    expect(answer.status).toBe(Status.Right);
});

test('Should_change_score_when_accept_answer_reject', () => {
    question.giveAnswer(team, "right");
    question.acceptAnswers("right");

    const answer = team.getAnswer(1, 1);
    answer.reject(question.cost);

    expect(team.getTotalScore()).toBe(-question.cost);
    expect(answer.score).toBe(-question.cost);
    expect(answer.status).toBe(Status.Wrong);
});

test('Should_change_score_when_answer_reject', () => {
    question.giveAnswer(team, "wrong");
    question.rejectAnswers("wrong", true);
    question.acceptAnswers("right");

    const answer = team.getAnswer(1, 1);

    expect(team.getTotalScore()).toBe(-question.cost);
    expect(answer.score).toBe(-question.cost);
    expect(answer.status).toBe(Status.Wrong);
});

test('Should_change_score_when_rejected_answer_accept', () => {
    question.giveAnswer(team, "wrong");
    question.acceptAnswers("right");

    question.acceptAnswers("wrong");

    const answer = team.getAnswer(1, 1);
    expect(team.getTotalScore()).toBe(question.cost);
    expect(answer.score).toBe(question.cost);
    expect(answer.status).toBe(Status.Right);
});