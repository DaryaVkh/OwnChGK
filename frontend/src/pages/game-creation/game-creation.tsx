import React, {FC} from 'react';
import classes from './game-creation.module.scss';
import Header from "../../components/header/header";
import {FormButton} from "../../components/form-button/form-button";
import CustomCheckbox from "../../components/custom-checkbox/custom-checkbox";
import {Scrollbars} from 'rc-scrollbars';
import {GameCreatorProps} from "../../entities/game-creator/game-creator.interfaces";
import PageWrapper from "../../components/page-wrapper/page-wrapper";

const GameCreator: FC<GameCreatorProps> = props => {
    let gameName: string = '';
    let questionsCount: number = 0;
    let toursCount: number = 0;
    let commands: string[] = [];
    let chosenCommands: string[] = [];

    // получаем все команды из бд
    commands.push(...['Команда 1', 'Команда 1', 'Команда 1', 'Сахара опять не будет', 'hdbfkjnakslkdsdlfnjkfvjkfdnklsnckjdsnvjkfdnjkfnv',
    'Команда 2', 'Не грози Южному автовокзалу', 'Ума палата №6', 'ЧКГ-шки ниндзя'])

    if (props.mode === 'edit') {
        // получаем все с бд: имя игры, которую редачим, количество туров, вопросов в туре
        // и ранее выбранные команды
        chosenCommands.push(...['Команда 1', 'Сахара опять не будет']);
        gameName = 'ЧГК на конфУРе-2021';
        toursCount = 3;
        questionsCount = 10;
    }

    const renderCommands = () => {
        return commands.map((name, index) => {
            return chosenCommands.includes(name)
                ? <CustomCheckbox name={name} key={index} checked={true}/>
                : <CustomCheckbox name={name} key={index}/>;
        })
    };

    return (
        <PageWrapper>
            <Header isAdmin={true}>
                {
                    props.mode === 'creation'
                        ? <div className={classes.pageTitle}>Создание игры</div>
                        : <div className={classes.pageTitle}>Редактирование</div>
                }
            </Header>

            <form className={classes.gameCreationForm} action="/games/" method="post">
                <div className={classes.contentWrapper}>
                    <div className={classes.gameParametersWrapper}>
                        <input className={classes.gameNameInput}
                               type="text"
                               id="gameName"
                               name="gameName"
                               placeholder="Название игры"
                               defaultValue={gameName}
                               required={true}/>

                        <div className={classes.toursCountWrapper}>
                            <label htmlFor="toursCount" className={classes.toursCountLabel}>Количество туров</label>
                            <input className={classes.toursCountInput}
                                   type="number"
                                   id="toursCount"
                                   name="toursCount"
                                   defaultValue={toursCount || ''}
                                   required={true}/>
                        </div>

                        <div className={classes.questionsCountWrapper}>
                            <label htmlFor="questionsCount" className={classes.questionsCountLabel}>Вопросов в туре</label>
                            <input className={classes.questionsCountInput}
                                   type="number"
                                   id="questionsCount"
                                   name="questionsCount"
                                   defaultValue={questionsCount || ''}
                                   required={true}/>
                        </div>
                    </div>

                    <div className={classes.commandsWrapper}>
                        <div className={classes.commandsLabel}>
                            Команды
                        </div>

                        <div className={classes.commandsDiv}>
                            <Scrollbars autoHide autoHideTimeout={500} autoHideDuration={200} renderThumbVertical={() =>
                                <div style={{backgroundColor: "transparent"}}/>} renderTrackVertical={() =>
                                <div style={{backgroundColor: "transparent"}}/>}>

                                {renderCommands()}

                            </Scrollbars>
                        </div>
                    </div>
                </div>

                <FormButton text={props.mode === 'creation' ? "Создать" : "Сохранить"}
                            style={{
                                padding: "0 2vw", fontSize: "1.5vw", height: "7vh", marginBottom: "2.5vh",
                                filter: "drop-shadow(0 3px 3px rgba(255, 255, 255, 0.2))"
                            }} />
            </form>
        </PageWrapper>
    );
}

export default GameCreator;
