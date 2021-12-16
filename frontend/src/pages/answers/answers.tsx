import React, {FC, useEffect, useState} from 'react';
import classes from './answers.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import Header from "../../components/header/header";
import {Link} from 'react-router-dom';

const AnswersPage: FC = () => {
    const [page, setPage] = useState('answers');

    useEffect(() => {
        function handleWindowResize() {
            const indicator = document.querySelector('#indicator') as HTMLSpanElement;
            const el = document.querySelector(`.${classes['is-active']}`) as HTMLElement;
            if (el) {
                indicator.style.width = `${el.offsetWidth}px`;
                indicator.style.left = `${el.offsetLeft}px`;
                indicator.style.backgroundColor = "white";
            }
        }

        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const activeItem = document.querySelector(`.${classes['is-active']}`) as HTMLElement;

        indicator.style.width = `${activeItem.offsetWidth}px`;
        indicator.style.left = `${activeItem.offsetLeft}px`;
        indicator.style.backgroundColor = "white";

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        }
    }, []);

    const handleIndicator = (event: React.SyntheticEvent) => {
        const indicator = document.querySelector('#indicator') as HTMLSpanElement;
        const items = document.querySelectorAll(`.${classes['nav-item']}`);
        const el = event.target as HTMLElement;

        items.forEach(function (item) {
            item.classList.remove(classes['is-active']);
            item.removeAttribute('style');
        });

        indicator.style.width = `${el.offsetWidth}px`;
        indicator.style.left = `${el.offsetLeft}px`;
        indicator.style.backgroundColor = "white";

        el.classList.add(classes['is-active']);
    }

    const changePageToAnswers = (event: React.SyntheticEvent) => {
        handleIndicator(event);
        setPage('answers');
    }

    const changePageToOppositions = (event: React.SyntheticEvent) => {
        handleIndicator(event);
        setPage('oppositions');
    }

    const renderPage = () => {
        if (page === 'answers') {
            return (
                <div className={classes.answersPageWrapper}>
                    <div className={classes.answerTypesWrapper}>
                        <div className={classes.answersType}>принятые</div>
                        <div className={classes.answersType}>непроверенные</div>
                        <div className={classes.answersType}>отклоненные</div>
                    </div>
                </div>
            );
        }
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={true}>
                <Link to='/admin/game' className={classes.toGameLink}>В игру</Link>

                <div className={classes.tourNumber}>Тур 1</div>
                <div className={classes.questionNumber}>Вопрос 1</div>

                <nav className={classes.nav}>
                    <Link to={{}} className={`${classes['nav-item']} ${page === 'answers' ? classes['is-active'] : null}`} onClick={changePageToAnswers}>Ответы</Link>
                    <Link to={{}} className={`${classes['nav-item']} ${page === 'oppositions' ? classes['is-active'] : null}`} onClick={changePageToOppositions}>
                        Апелляции <b className={classes.opposition}>&#9679;</b>
                    </Link>
                    <span className={`${classes['nav-indicator']}`} id='indicator'/>
                </nav>
            </Header>

            <div className={classes.sectionWrapper}>
                {renderPage()}
            </div>
        </PageWrapper>
    );
}

export default AnswersPage;
