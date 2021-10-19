import React, {Component} from 'react';
import classes from './App.module.scss';
import Layout from './Layout/Layout';
import FirstPage from './Desktop/FirstPage/FirstPage'

class App extends Component {
    render() {
        return (
            <Layout>
                <FirstPage type='Registration' />
            </Layout>
        );
    }
}

export default App;
