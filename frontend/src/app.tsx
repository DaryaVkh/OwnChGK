import React, {FC, Suspense, useEffect, useState} from 'react';
import Wrapper from './wrapper';
import Authorization from './pages/authorization/authorization';
import Registration from './pages/registration/registration';
import {Redirect, Route, Switch} from 'react-router-dom';
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
import MobileMenu from './pages/mobile-menu/mobile-menu';
import AdminGame from './pages/admin-game/admin-game';
import AdminAnswersPage from './pages/admin-answers/admin-answers';
import StartGame from './pages/admin-start-game/admin-start-game';
import Rating from './pages/rating/rating';
import UserStartScreen from './pages/user-start-screen/user-start-screen';
import Profile from './pages/profile/profile';
import TeamCreator from './pages/team-creation/team-creation';
import UserGame from './pages/user-game/user-game';
import UserAnswersPage from './pages/user-answers/user-answers';
import AdminStartScreen from './pages/admin-start-screen/admin-start-screen';
import GameCreator from './pages/game-creation/game-creation';

const App: FC<AppProps> = props => {
    const [mediaMatch, setMediaMatch] = useState<MediaQueryList>(window.matchMedia('(max-width: 600px)'));

    useEffect(() => {
        const resizeEventHandler = () => {
            setMediaMatch(window.matchMedia('(max-width: 600px)'));
        };

        mediaMatch.addEventListener('change', resizeEventHandler);

        return () => {
            mediaMatch.removeEventListener('change', resizeEventHandler);
        };
    }, []);

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
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath={'/admin'}>
                        <AdminStartScreen isSuperAdmin={props.user.role === 'superadmin'}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/profile" exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <Profile isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/game-creation" exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <GameCreator mode="creation" isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/game-creation/edit" exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <GameCreator mode="edit" isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/team-creation" exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <TeamCreator mode="creation" isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/team-creation/edit" exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <TeamCreator mode="edit" isAdmin={true}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/game/:gameId" exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <AdminGame/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/admin/game/:gameId/:gamePart/answers/:tour/:question" exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <AdminAnswersPage/>
                    </ProtectedRoute>


                    <ProtectedRoute path="/admin/start-game/:gameId" exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath="/admin">
                        <StartGame/>
                    </ProtectedRoute>

                    <ProtectedRoute path='/admin/rating/:gameId' exact
                                    currentUserRole={props.user.role}
                                    neededRole={adminRoles}
                                    redirectPath={'/admin'}>
                        <Rating isAdmin={true} />
                    </ProtectedRoute>

                    <ProtectedRoute path="/start-screen" exact currentUserRole={props.user.role} neededRole={userRoles} redirectPath="/auth">
                        <UserStartScreen/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/profile" exact currentUserRole={props.user.role} neededRole={userRoles} redirectPath="/auth">
                        <Profile isAdmin={false}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/team-creation" exact currentUserRole={props.user.role} neededRole={userRoles} redirectPath="/auth">
                        <TeamCreator mode="creation" isAdmin={false}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/team-creation/edit" exact currentUserRole={props.user.role} neededRole={userRoles} redirectPath="/auth">
                        <TeamCreator mode="edit" isAdmin={false}/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/game/:gameId" exact currentUserRole={props.user.role} neededRole={userRoles} redirectPath="/auth">
                        <UserGame/>
                    </ProtectedRoute>

                    <ProtectedRoute path="/game-answers/:gameId" exact currentUserRole={props.user.role} neededRole={userRoles} redirectPath='/auth'>
                        <UserAnswersPage/>
                    </ProtectedRoute>

                    <ProtectedRoute path='/rating/:gameId' exact currentUserRole={props.user.role} neededRole={userRoles} redirectPath='/auth'>
                        <Rating isAdmin={false} />
                    </ProtectedRoute>

                    <ProtectedRoute path='/menu' exact neededRole={userRoles} redirectPath='/auth' currentUserRole={props.user.role} extraCondition={mediaMatch.matches}>
                        <MobileMenu />
                    </ProtectedRoute>

                    <Redirect from="*" to="/"/>
                </Switch>
            </Wrapper>
        </Suspense>
    ) : null;
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
