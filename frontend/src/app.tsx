import React, {Component} from 'react';
import classes from './app.module.scss';
import Wrapper from './wrapper';
import Auth from './pages/auth/auth'

class App extends Component {
    render() {
        return (
            <Wrapper>
                <Auth type='Registration' />
            </Wrapper>
        );
    }
}

export default App;
