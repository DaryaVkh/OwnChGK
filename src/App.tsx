import React, {Component} from 'react';
import './App.css';
import Layout from './Layout/Layout';
import FirstPage from './Desktop/FirstPage/FirstPage'

class App extends Component {
    render() {
        return (
            <Layout>
                <FirstPage type='Authorization' isAdmin={true}/>
            </Layout>
        );
    }
}

export default App;
