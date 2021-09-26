import {Team} from "../private/Team";
import {Question} from "../private/Question";
import {Status} from "../private/AnswerAndAppeal"
import {Game, Round} from "../private/logic";

test('Should_set_right_answer', () => {
    const team = new Team("cool");
    const question = new Question(1, 1, 1, 50);

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
    const team = new Team("cool");
    const question = new Question(1, 1, 1, 50);

    question.giveAnswer(team, "wrongAnswer");
    question.acceptAnswers("rightAnswer");
    const teamAnswer = team.getAnswer(1, 1);

    expect(teamAnswer).not.toBeUndefined();
    if (teamAnswer !== undefined) {
        expect(teamAnswer.status).toBe(Status.UnChecked);
        expect(teamAnswer.score).toBe(0);
    }
});

test('Should_get_right_total_count', () => {
    const team = new Team("cool");
    const question = new Question(1, 1, 1, 50);

    question.giveAnswer(team, "rightAnswer");
    question.acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(question.cost);
});

test('Should_get_right_score_table_for_one_team_when_one_round', () => {
    const team = new Team("cool");
    const question = new Question(1, 1, 1, 50);

    question.giveAnswer(team, "rightAnswer");
    question.acceptAnswers("rightAnswer");

    expect(team.getScoreTable()).toStrictEqual([[question.cost]]);
});

test('Should_get_right_score_table_for_one_team_when_2_rounds', () => {
    const team = new Team("cool");
    const question1 = new Question(1, 1, 1, 50);
    const question2 = new Question(1, 2, 1, 50);

    question1.giveAnswer(team, "rightAnswer");
    question1.acceptAnswers("rightAnswer");
    question2.giveAnswer(team, "rightAnswer");
    question2.acceptAnswers("rightAnswer");

    expect(team.getScoreTable()).toStrictEqual([[question1.cost], [question2.cost]]);
});

test('Should_accept_appeal_for_one_team', () => {
    const team = new Team("cool");
    const question = new Question(1, 1, 1, 50);
    question.giveAnswer(team, "otherAnswer");
    question.acceptAnswers("rightAnswer");

    question.giveAppeal(team.id, "otherAnswer");
    question.acceptAppeal(team, "");

    const teamAnswer = team.getAnswer(1, 1);
    expect(teamAnswer).not.toBeUndefined();
    if (teamAnswer !== undefined) {
        expect(teamAnswer.status).toBe(Status.Right);
        expect(teamAnswer.score).toBe(question.cost);
    }
});

test('Should_accept_appeal_for_all_team', () => {
    const team1 = new Team("cool");
    const team2 = new Team("good");
    const question = new Question(1, 1, 1, 50);
    question.giveAnswer(team1, "otherAnswer");
    question.giveAnswer(team2, "otherAnswer");
    question.acceptAnswers("rightAnswer");

    question.giveAppeal(team1.id, "otherAnswer");
    question.acceptAppeal(team1, "");

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
    const game = new Game("newGame");
    const team1 = new Team("cool");
    const team2 = new Team("good");
    game.addTeam(team1);
    game.addTeam(team2);
    game.addRound(new Round(1, 1, 50, 1));
    const question = game.rounds[0].questions[0];

    question.giveAnswer(team1, "rightAnswer");
    question.giveAnswer(team2, "otherAnswer");
    question.acceptAnswers("rightAnswer");

    expect(game.getScoreTable()).toStrictEqual({"cool":[[1]], "good": [[0]]});
});