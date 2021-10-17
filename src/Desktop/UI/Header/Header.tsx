import React, {Component} from 'react';
import classes from './Header.module.scss';

class Header extends Component {
    render() {
        return (
            <header className={classes.Header}>
                <img className={classes.logo} src={require('../../../images/Logo.svg').default} alt='logo' />
                { this.props.children }
            </header>
        );
    }
}

export default Header;