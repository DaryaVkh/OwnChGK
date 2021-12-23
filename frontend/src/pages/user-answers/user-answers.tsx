import React, {FC, useState} from 'react';
import classes from './user-answers.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import {Link} from "react-router-dom";
import Header from "../../components/header/header";
import {Answer, UserAnswersPageProps} from "../../entities/user-answers/user-answers.interfaces";
import {Scrollbars} from "rc-scrollbars";
import UserAnswer from "../../components/user-answer/user-answer";

const UserAnswersPage: FC<UserAnswersPageProps> = () => {
    const [gameName, setGameName] = useState<string>('');
    const [teamName, setTeamName] = useState<string>('');
    const [answers, setAnswers] = useState<Answer[]>([
        {answer: 'Морковь', status: 'success'},
        {answer: 'Азбука Морзе', status: 'error'},
        {answer: 'Граф', status: 'success'},
        {answer: 'Танцор', status: 'success'},
        {answer: 'Последний день Помпеи', status: 'error'},
        {answer: 'Мандарины', status: 'error'},
        {answer: 'Hey', status: 'opposition'}]);

    const renderAnswers = () => {
        return answers.map((answer, index) => {
            return (
                <UserAnswer key={`${answer.answer}_${index}`} answer={answer.answer} status={answer.status} order={index + 1} />
            );
        });
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <Link to='#' className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                <Link to='#' className={`${classes.menuLink} ${classes.toGameLink}`}>В игру</Link> {/* TODO тут написать нормальный урлик, потому что я не помню, какой нормальный*/}

                <div className={classes.gameName}>{gameName}</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.teamWrapper}>
                    <div className={classes.team}>Команда</div>
                    <div className={classes.teamName}>{teamName}</div>
                </div>

                <div className={classes.answersWrapper}>
                    <Scrollbars className={classes.scrollbar} autoHide autoHideTimeout={500}
                                autoHideDuration={200}
                                renderThumbVertical={() => <div style={{backgroundColor: 'var(--foreground-color)', borderRadius: '4px', cursor: 'pointer'}}/>}
                                renderTrackHorizontal={props => <div {...props} style={{display: 'none'}} />}
                                classes={{view: classes.scrollbarView}}>
                        {renderAnswers()}
                    </Scrollbars>
                </div>
            </div>
        </PageWrapper>
    );
}

export default UserAnswersPage;