import React, {Component} from 'react';
import classes from './auth.module.scss';
import Header from '../../components/header/header';
import Authorization from '../../components/authorization/authorization';
import Registration from '../../components/registration/registration';

interface FirstPageProps {
    type: 'Authorization' | 'Registration';
    isAdmin?: boolean;
}

class Auth extends Component<FirstPageProps> {
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

export default Auth;