import React, {FC} from 'react';
import Wrapper from './wrapper';
import Authorization from './pages/authorization/authorization';
import Registration from './pages/registration/registration';
import {Redirect, Route, Switch} from 'react-router-dom';
import AdminStartScreen from "./pages/admin-start-screen/admin-start-screen";
import GameCreator from "./pages/game-creation/game-creation";
import TeamCreator from "./pages/team-creation/team-creation";
import UserStartScreen from "./pages/user-start-screen/user-start-screen";
import RestoringPassword from "./pages/restoring-password/restoring-password";
import Profile from "./pages/profile/profile";
import Socket from "./pages/socket";

const App: FC = () => {
    return (
        <Wrapper>
            <Switch>
                <Route path='/answer' component={Socket} exact={true}/>
                <Route path={['/', '/auth']} component={Authorization} exact={true} />
                <Route path={'/admin'} exact={true} >
                    <Authorization isAdmin={true} />
                </Route>
                <Route path="/registration" component={Registration} exact={true} />

                <Route path="/game-creation" exact={true}>
                    <GameCreator mode="creation" />
                </Route>
                <Route path="/game-creation/edit" render={(props) => <GameCreator mode='edit' {...props}/>} />

                <Route path="/team-creation" exact={true}>
                    <TeamCreator mode="creation" isAdmin={true} />
                </Route>
                <Route path="/team-creation/edit" render={(props) => <TeamCreator mode='edit' isAdmin={true} {...props} />} />

                <Route path='/admin/start-screen' exact={true}>
                    <AdminStartScreen isSuperAdmin={true} />
                </Route>
                <Route path='/start-screen' exact={true} component={UserStartScreen} />

                <Route path='/restore-password' exact={true}>
                    <RestoringPassword isAdmin={false} />
                </Route>
                <Route path='/admin/restore-password' exact={true}>
                    <RestoringPassword isAdmin={true} />
                </Route>

                <Route path='/admin/profile'>
                    <Profile isAdmin={true} />
                </Route>
                <Route path='/profile'>
                    <Profile isAdmin={false} />
                </Route>

                {/*<Route path="/admin/start-screen" exact={true}>*/}
                {/*    <AdminStartScreen page=''/>*/}
                {/*</Route>*/}
                {/*<Route path="/admin/games" exact={true}>*/}
                {/*    <AdminStartScreen page='games' />*/}
                {/*</Route>*/}
                {/*<Route path='/admin/teams' exact={true}>*/}
                {/*    <AdminStartScreen page='teams' />*/}
                {/*</Route>*/}
                {/*<Route path='/admins' exact={true}>*/}
                {/*    <AdminStartScreen page='admins' />*/}
                {/*</Route>*/}

                {/*<Route path='/games' exact={true}>*/}
                {/*    <UserStartScreen page='games' />*/}
                {/*</Route>*/}
                {/*<Route path='/teams' exact={true}>*/}
                {/*    <UserStartScreen page='teams' />*/}
                {/*</Route>*/}

                <Redirect from='*' to='/'/>
            </Switch>
        </Wrapper>
    );
}

export default App;