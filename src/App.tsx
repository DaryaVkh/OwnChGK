import React, {Component} from 'react';
import './App.css';
import Layout from './Layout/Layout';
import Authorization from './Desktop/Authorization/Authorization';

class App extends Component {
    render() {
        return (
            <Layout>
                <Authorization isAdmin={ false } />
            </Layout>
        );
    }
}

export default App;
