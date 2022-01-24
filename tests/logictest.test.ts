import {Team} from "../app/logic/Team";
import {Question} from "../app/logic/Question";
import {Status} from "../app/logic/AnswerAndAppeal"
import {Game, Round} from "../app/logic/Game";

let game;
let team;
let question;
let round;

beforeEach(() => {
    game = new Game("newGame");
    team = new Team("cool", 1);
    game.addTeam(team);
    game.addRound(new Round(1, 2, 50, 1));
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

test('Should_get_total_score_when_exist_right_answers', () => {
    const round = new Round(1, 2, 50, 1);

    round.questions[0].giveAnswer(team, "rightAnswer");
    round.questions[0].acceptAnswers("rightAnswer");

    round.questions[1].giveAnswer(team, "rightAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(round.questionsCount*round.questionCost);
});

test('Should_get_0_in_total_score_when_no_right_answer', () => {
    const round = new Round(1, 2, 50, 1);

    round.questions[0].giveAnswer(team, "wrongAnswer");
    round.questions[0].acceptAnswers("rightAnswer");

    round.questions[1].giveAnswer(team, "wrongAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(0);
});

test('Should_get_0_in_total_score_when_answer_without_score', () => {
    const round = new Round(1, 2, 50, 0);

    round.questions[0].giveAnswer(team, "wrongAnswer");
    round.questions[0].acceptAnswers("rightAnswer");

    round.questions[1].giveAnswer(team, "wrongAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(0);
});

test('Should_get_0_in_total_score_when_no_answers', () => {
    const round = new Round(1, 2, 50, 1);

    round.questions[0].acceptAnswers("rightAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(0);
});

test('Should_get_right_score_table_for_one_team_when_one_round', () => {
    round.questions[0].giveAnswer(team, "rightAnswer");
    round.questions[0].acceptAnswers("rightAnswer");

    round.questions[1].giveAnswer(team, "rightAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(game.getScoreTableForTeam(1)[team.name]).toStrictEqual([[round.questionCost, round.questionCost]]);
});

test('Should_get_right_score_table_for_one_team_when_two_rounds', () => {
    const round1 = game.rounds[0];
    const round2 = new Round(2, 1, 50, 1);
    game.addRound(round2);

    round1.questions[0].giveAnswer(team, "rightAnswer");
    round1.questions[0].acceptAnswers("rightAnswer");

    round2.questions[0].giveAnswer(team, "rightAnswer");
    round2.questions[0].acceptAnswers("rightAnswer");

    expect(game.getScoreTableForTeam(1)[team.name].length).toBe(2);
    expect(game.getScoreTableForTeam(1)[team.name]).toStrictEqual([[round1.questionCost, 0], [round2.questionCost, 0]]);
});

test('Should_get_team_answer_when_it_exist', () => {
    const round1 = game.rounds[0];
    const round2 = new Round(2, 5, 50, 1);

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
        expect(answer.score).toBe(1);
        expect(answer.status).toBe(Status.Right);
    }
})

test('Should_get_team_answer_when_it_not_exist', () => {
    const question = new Question(1, 1, 1, 50);

    question.acceptAnswers("right");

    expect(team.getAnswer(1, 1)).toBeUndefined();
})

test('Should_create_questions_as_in_setting', () => {
    const round = new Round(1, 5, 50, 1);

    expect(round.questions.length).toBe(round.questionsCount);
});

test('Should_give_questions_different_numbers', () => {
    const round = new Round(1, 5, 50, 1);

    expect(round.questions[0].number).toBe(1);
    expect(round.questions[1].number).toBe(2);
    expect(round.questions[4].number).toBe(5);
});

test('Should_not_change_score_when_answer_alredy_accept', () => {
    question.giveAnswer(team, "right");
    question.acceptAnswers("right");
    const scoreTable = game.getScoreTableForTeam(team.id);

    question.acceptAnswers("right");

    expect(team.getTotalScore()).toBe(1);
    const answer = team.getAnswer(1, 1);
    expect(answer.score).toBe(round.questionCost);
    expect(answer.status).toBe(Status.Right);
    expect(game.getScoreTableForTeam(team.id)).toStrictEqual(scoreTable);
});

test('Should_change_score_when_accept_answer_reject', () => {
    question.giveAnswer(team, "right");
    question.acceptAnswers("right");

    const answer = team.getAnswer(1, 1);
    answer.reject();

    expect(team.getTotalScore()).toBe(0);
    expect(answer.score).toBe(0);
    expect(answer.status).toBe(Status.Wrong);
    expect(game.getScoreTable()[team.name][0][0]).toBe(0);
});

test('Should_not_change_score_when_answer_reject', () => {
    question.giveAnswer(team, "wrong");
    question.acceptAnswers("right");
    const scoreTable = game.getScoreTable();

    const answer = team.getAnswer(1, 1);
    answer.reject();

    expect(team.getTotalScore()).toBe(0);
    expect(answer.score).toBe(0);
    expect(answer.status).toBe(Status.Wrong);
    expect(game.getScoreTable()).toStrictEqual(scoreTable);
});

test('Should_change_score_when_rejected_answer_accept', () => {
    question.giveAnswer(team, "wrong");
    question.acceptAnswers("right");

    question.acceptAnswers("wrong");

    const answer = team.getAnswer(1, 1);
    expect(team.getTotalScore()).toBe(1);
    expect(answer.score).toBe(round.questionCost);
    expect(answer.status).toBe(Status.Right);
    expect(game.getScoreTable()[team.name][0][0]).toStrictEqual(round.questionCost);
});

test('Should_accept_appeal_and_change_answer_state_for_one_team', () => {
    const question = new Question(1, 1, 1, 50);
    question.giveAnswer(team, "otherAnswer");
    question.acceptAnswers("rightAnswer");

    question.giveAppeal(team.id, "appeal text", "otherAnswer");
    question.acceptAppeal("otherAnswer", "");

    const teamAnswer = team.getAnswer(1, 1);
    expect(teamAnswer).not.toBeUndefined();
    if (teamAnswer !== undefined) {
        expect(teamAnswer.status).toBe(Status.Right);
        expect(teamAnswer.score).toBe(question.cost);
    }
});

test('Should_accept_appeal_and_change_score_for_one_team', () => {
    question.giveAnswer(team, "otherAnswer");
    question.acceptAnswers("rightAnswer");
    const totalScore = team.getTotalScore();

    question.giveAppeal(team.id, "textAppeal", "otherAnswer");
    question.acceptAppeal("otherAnswer", "");

    const newTotalScore = team.getTotalScore();
    const newScoreTable = game.getScoreTable();
    expect(newTotalScore).toBe(totalScore + 1);
    expect(newScoreTable[team.name]).toStrictEqual([[1, 0]]);

});

test('Should_accept_appeal_for_all_team', () => {
    const team1 = new Team("cool", 1);
    const team2 = new Team("good", 2);
    const question = new Question(1, 1, 1, 50);
    question.giveAnswer(team1, "otherAnswer");
    question.giveAnswer(team2, "otherAnswer");
    question.acceptAnswers("rightAnswer");

    question.giveAppeal(team1.id, "textAppeal", "otherAnswer");
    question.acceptAppeal("otherAnswer", "");

    const teamAnswer1 = team1.getAnswer(1, 1);
    const teamAnswer2 = team2.getAnswer(1, 1);
    expect(teamAnswer1).not.toBeUndefined();
    expect(teamAnswer2).not.toBeUndefined();
    if (teamAnswer1 !== undefined) {
        expect(teamAnswer1.status).toBe(Status.Right);
        expect(teamAnswer1.score).toBe(question.cost);
    }
    if (teamAnswer2 !== undefined) {
        expect(teamAnswer2.status).toBe(Status.Right);
        expect(teamAnswer2.score).toBe(question.cost);
    }
});

test('Should_get_score_table_for_all_team', () => {
    const team2 = new Team("good", 2);
    game.addTeam(team2);

    question.giveAnswer(team, "rightAnswer");
    question.giveAnswer(team2, "otherAnswer");
    question.acceptAnswers("rightAnswer");

    expect(game.getScoreTable()).toStrictEqual({"cool": [[1, 0]], "good": [[0, 0]]});
}
);