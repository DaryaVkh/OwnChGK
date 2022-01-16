import React, {FC, useEffect, Suspense} from 'react';
import Wrapper from './wrapper';
import Authorization from './pages/authorization/authorization';
import Registration from './pages/registration/registration';
import {Route, Switch} from 'react-router-dom';
import RestoringPassword from './pages/restoring-password/restoring-password';
import {connect} from 'react-redux';
import ProtectedRoute from './components/private-route/private-route';
import {AppDispatchProps, AppProps, AppState, AppStateProps} from './entities/app/app.interfaces';
import {checkToken} from './server-api/server-api';
import {Dispatch} from 'redux';
import {AppAction} from './redux/reducers/app-reducer/app-reducer.interfaces';
import {authorizeUserWithRole, checkToken as testToken} from './redux/actions/app-actions/app-actions';
import {adminRoles, userRoles} from './entities/common/common.constants';
import Loader from './components/loader/loader';

const AdminStartScreen = React.lazy(() => Promise.all([import('./pages/admin-start-screen/admin-start-screen'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const GameCreator = React.lazy(() => Promise.all([import('./pages/game-creation/game-creation'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const TeamCreator = React.lazy(() => Promise.all([import('./pages/team-creation/team-creation'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const UserStartScreen = React.lazy(() => Promise.all([import('./pages/user-start-screen/user-start-screen'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const Profile = React.lazy(() => Promise.all([import('./pages/profile/profile'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const UserGame = React.lazy(() => Promise.all([import('./pages/user-game/user-game'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const AdminGame = React.lazy(() => Promise.all([import('./pages/admin-game/admin-game'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const AdminAnswersPage = React.lazy(() => Promise.all([import('./pages/admin-answers/admin-answers'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const UserAnswersPage = React.lazy(() => Promise.all([import('./pages/user-answers/user-answers'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const StartGame = React.lazy(() => Promise.all([import('./pages/admin-start-game/admin-start-game'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));
const Rating = React.lazy(() => Promise.all([import('./pages/rating/rating'), new Promise(resolve => setTimeout(resolve, 1000))]).then(([moduleExports]) => moduleExports));

const App: FC<AppProps> = props => {
    useEffect(() => {
        checkToken().then((res) => {
            if (res.status === 200) {
                res.json().then(({role, team, email, name}) => {
                    props.onAuthorizeUserWithRole(role, team, email, name);
                });
            } else {
                props.onCheckToken();
            }
        });
    }, []);

    return props.isTokenChecked ? (
        <Suspense fallback={<Loader />}>
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
                                    neededRole={adminRoles}
                                    redirectPath={'/admin'}>
                        <AdminStartScreen isSuperAdmin={props.user.role === 'superadmin'}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/profile" exact
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <Profile isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/game-creation" exact
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <GameCreator mode="creation" isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/game-creation/edit" exact
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <GameCreator mode="edit" isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/team-creation" exact
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <TeamCreator mode="creation" isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/team-creation/edit" exact
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <TeamCreator mode="edit" isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/game/:gameId" exact
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <AdminGame/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/game/:gameId/answers/:tour/:question" exact
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <AdminAnswersPage/>
                    </ProtectedRoute>


                    <ProtectedRoute path="/admin/start-game/:gameId" exact
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <StartGame/>
                    </ProtectedRoute>

                    <ProtectedRoute path='/admin/rating/:gameId' exact
                                    neededRole={adminRoles}
                                    redirectPath={'/admin'}>
                        <Rating isAdmin={true} />
                    </ProtectedRoute>

                    <ProtectedRoute path="/start-screen" exact neededRole={userRoles} redirectPath="/auth">
                        <UserStartScreen/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/profile" exact neededRole={userRoles} redirectPath="/auth">
                        <Profile isAdmin={false}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/team-creation" exact neededRole={userRoles} redirectPath="/auth">
                        <TeamCreator mode="creation" isAdmin={false}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/team-creation/edit" exact neededRole={userRoles} redirectPath="/auth">
                        <TeamCreator mode="edit" isAdmin={false}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/game/:gameId" exact neededRole={userRoles} redirectPath="/auth">
                        <UserGame/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/game-answers/:gameId" exact neededRole={userRoles} redirectPath='/auth'>
                        <UserAnswersPage/>
                    </ProtectedRoute>

                    <ProtectedRoute path='/rating/:gameId' exact neededRole={userRoles} redirectPath='/auth'>
                        <Rating isAdmin={false} />
                    </ProtectedRoute>

                    {/*<Redirect from="*" to="/"/>*/}
                </Switch>
            </Wrapper>
        </Suspense>
    ) : null; // TODO: загрузка
};

function mapStateToProps(state: AppState): AppStateProps {
    return {
        user: state.appReducer.user,
        isLoggedIn: state.appReducer.isLoggedIn,
        isTokenChecked: true
        // isTokenChecked: state.appReducer.isTokenChecked
    };
}

function mapDispatchToProps(dispatch: Dispatch<AppAction>): AppDispatchProps {
    return {
        onCheckToken: () => dispatch(testToken()),
        onAuthorizeUserWithRole: (role: string, team: string, email: string, name: string) => dispatch(authorizeUserWithRole(role, team, email, name)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
