import React, {FC, useEffect} from 'react';
import Wrapper from './wrapper';
import Authorization from './pages/authorization/authorization';
import Registration from './pages/registration/registration';
import {Route, Switch} from 'react-router-dom';
import AdminStartScreen from './pages/admin-start-screen/admin-start-screen';
import GameCreator from './pages/game-creation/game-creation';
import TeamCreator from './pages/team-creation/team-creation';
import UserStartScreen from './pages/user-start-screen/user-start-screen';
import RestoringPassword from './pages/restoring-password/restoring-password';
import Profile from './pages/profile/profile';
import UserGame from './pages/user-game/user-game';
import AdminGame from './pages/admin-game/admin-game';
import AnswersPage from './pages/answers/answers';
import {connect} from 'react-redux';
import {AppDispatchProps, AppProps, AppState, AppStateProps} from './entities/app/app.interfaces';
import ProtectedRoute from './components/private-route/private-route';
import Game from './pages/game';
import {checkToken} from './server-api/server-api';
import {Dispatch} from 'redux';
import {AppAction} from './redux/reducers/app-reducer/app-reducer.interfaces';
import {authorizeUserWithRole, checkToken as testToken} from './redux/actions/app-actions/app-actions';

const App: FC<AppProps> = props => {
    useEffect(() => {
        checkToken().then((res) => {
            if (res.status === 200) {
                res.json().then(({role, team}) => {
                    props.onAuthorizeUserWithRole(role, team);
                })
            } else {
                props.onCheckToken();
            }
        })
    }, []);

    return props.isTokenChecked ? (
        <Wrapper>
            <Switch>
                <Route path={['/', '/auth']} exact>
                    <Authorization isAdmin={false}/>
                </Route>
                <Route path={'/admin'} exact>
                    <Authorization isAdmin={true}/>
                </Route>
                <Route path="/registration" component={Registration} exact={true}/>

                <Route path="/restore-password" exact>
                    <RestoringPassword isAdmin={false}/>
                </Route>
                <Route path="/admin/restore-password" exact>
                    <RestoringPassword isAdmin={true}/>
                </Route>

                <ProtectedRoute path="/admin/start-screen" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath={'/admin'}>
                    <AdminStartScreen isSuperAdmin={false}/>
                </ProtectedRoute>

                <ProtectedRoute path="/admin/profile" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath="/admin">
                    <Profile isAdmin={true}/>
                </ProtectedRoute>

                <ProtectedRoute path="/admin/game-creation" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath="/admin">
                    <GameCreator mode="creation" isAdmin={true}/>
                </ProtectedRoute>

                <ProtectedRoute path="/admin/game-creation/edit" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath="/admin">
                    <GameCreator mode="edit" isAdmin={true}/>
                </ProtectedRoute>

                <ProtectedRoute path="/admin/team-creation" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath="/admin">
                    <TeamCreator mode="creation" isAdmin={true}/>
                </ProtectedRoute>

                <ProtectedRoute path="/admin/team-creation/edit" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath="/admin">
                    <TeamCreator mode="edit" isAdmin={true}/>
                </ProtectedRoute>

                <ProtectedRoute path="/admin/game/:gameId" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath="/admin">
                    <AdminGame />
                </ProtectedRoute>

                <ProtectedRoute path="/answers/:tour/:question" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath="/admin">
                    <AnswersPage />
                </ProtectedRoute>


                <ProtectedRoute path="/admin/start-game/:gameId" exact
                                neededRole={['admin', 'superadmin']}
                                redirectPath="/admin">
                    <Game />
                </ProtectedRoute>

                <ProtectedRoute path="/start-screen" exact neededRole={['user']} redirectPath="/auth">
                    <UserStartScreen/>
                </ProtectedRoute>

                <ProtectedRoute path="/profile" exact neededRole={['user']} redirectPath="/auth">
                    <Profile isAdmin={false}/>
                </ProtectedRoute>

                <ProtectedRoute path="/team-creation" exact neededRole={['user']} redirectPath="/auth">
                    <TeamCreator mode="creation" isAdmin={false}/>
                </ProtectedRoute>

                <ProtectedRoute path="/team-creation/edit" exact neededRole={['user']} redirectPath="/auth">
                    <TeamCreator mode="edit" isAdmin={false}/>
                </ProtectedRoute>

                <ProtectedRoute path="/game/:gameId" exact neededRole={['user']} redirectPath="/auth">
                    <UserGame />
                </ProtectedRoute>

                {/*<Redirect from="*" to="/"/>*/}
            </Switch>
        </Wrapper>
    ) : null; // TODO: загрузка
}

function mapStateToProps(state: AppState): AppStateProps {
    return {
        user: state.appReducer.user,
        isLoggedIn: state.appReducer.isLoggedIn,
        isTokenChecked: state.appReducer.isTokenChecked
    };
}

function mapDispatchToProps(dispatch: Dispatch<AppAction>): AppDispatchProps {
    return {
        onCheckToken: () => dispatch(testToken()),
        onAuthorizeUserWithRole: (role: string, team: string) => dispatch(authorizeUserWithRole(role, team)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
