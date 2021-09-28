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

test('Should_get_total_score_when_exist_right_answers', () => {
    const team = new Team("cool");
    const round = new Round(1, 2, 50, 1);

    round.questions[0].giveAnswer(team, "rightAnswer");
    round.questions[0].acceptAnswers("rightAnswer");

    round.questions[1].giveAnswer(team, "rightAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(round.questionsCount*round.questionCost);
});

test('Should_get_0_in_total_score_when_no_right_answer', () => {
    const team = new Team("cool");
    const round = new Round(1, 2, 50, 1);

    round.questions[0].giveAnswer(team, "wrongAnswer");
    round.questions[0].acceptAnswers("rightAnswer");

    round.questions[1].giveAnswer(team, "wrongAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(0);
});

test('Should_get_0_in_total_score_when_answer_without_score', () => {
    const team = new Team("cool");
    const round = new Round(1, 2, 50, 0);

    round.questions[0].giveAnswer(team, "wrongAnswer");
    round.questions[0].acceptAnswers("rightAnswer");

    round.questions[1].giveAnswer(team, "wrongAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(0);
});

test('Should_get_0_in_total_score_when_no_answers', () => {
    const team = new Team("cool");
    const round = new Round(1, 2, 50, 1);

    round.questions[0].acceptAnswers("rightAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getTotalScore()).toBe(0);
});

test('Should_get_right_score_table_for_one_team_when_one_round', () => {
    const team = new Team("cool");
    const round = new Round(1, 2, 50, 1);

    round.questions[0].giveAnswer(team, "rightAnswer");
    round.questions[0].acceptAnswers("rightAnswer");

    round.questions[1].giveAnswer(team, "rightAnswer");
    round.questions[1].acceptAnswers("rightAnswer");

    expect(team.getScoreTable()).toStrictEqual([[round.questionCost, round.questionCost]]);
});

test('Should_get_right_score_table_for_one_team_when_two_rounds', () => {
    const team = new Team("cool");
    const round1 = new Round(1, 1, 50, 1);
    const round2 = new Round(1, 1, 50, 1);

    round1.questions[0].giveAnswer(team, "rightAnswer");
    round1.questions[0].acceptAnswers("rightAnswer");

    round2.questions[1].giveAnswer(team, "rightAnswer");
    round2.questions[1].acceptAnswers("rightAnswer");

    expect(team.getScoreTable().length).toBe(2);
    expect(team.getScoreTable()).toStrictEqual([[round1.questionCost], [round2.questionCost]]);
});

test('Should_get_team_answer_when_it_exist', () => {
    const team = new Team("cool");
    const round1 = new Round(1, 5, 50, 1);
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
    const team = new Team("cool");
    const question = new Question(1, 1, 1, 50);

    question.acceptAnswers("right");

    expect(team.getAnswer(1, 1)).toBeUndefined();
})

test('Should_create_questions_as_in_setting', () => {
    const team = new Team("cool");
    const round = new Round(1, 5, 50, 1);

    expect(round.questions.length).toBe(round.questionsCount);
});

test('Should_accept_appeal_and_change_answer_state_for_one_team', () => {
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

test('Should_accept_appeal_and_change_score_for_one_team', () => {
    const team = new Team("cool");
    const question = new Question(1, 1, 1, 50);
    question.giveAnswer(team, "otherAnswer");
    question.acceptAnswers("rightAnswer");
    const totalScore = team.getTotalScore();

    question.giveAppeal(team.id, "otherAnswer");
    question.acceptAppeal(team, "");

    const newTotalScore = team.getTotalScore();
    const newScoreTable = team.getScoreTable();
    expect(newTotalScore).toBe(totalScore + 1);
    expect(newScoreTable).toBe([[1]]);

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

    expect(game.getScoreTable()).toStrictEqual({"cool": [[1]], "good": [[0]]});
}
);