import React, {Component} from 'react';
import classes from './FirstPage.module.scss';
import Header from '../UI/Header/Header';
import Authorization from './Authorization/Authorization';
import Registration from './Registration/Registration';

type FirstPageProps = {
    type: 'Authorization' | 'Registration';
    isAdmin?: boolean;
};

class FirstPage extends Component<FirstPageProps> {
    render() {
        return (
            <div className={classes.FirstPage}>
                <Header/>

                <div className={classes.contentWrapper}>
                    <img className={classes.logo} src={require('../../images/Logo.svg').default} alt='logo'/>

                    {
                        this.props.type === 'Authorization'
                            ? <Authorization isAdmin={ this.props.isAdmin ?? false } />
                            : <Registration />
                    }
                </div>
            </div>
        );
    }
}

export default FirstPage;