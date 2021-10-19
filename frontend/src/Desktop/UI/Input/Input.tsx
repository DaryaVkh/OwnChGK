import React, {Component} from 'react';
import classes from './Input.module.scss';

type InputPropsType = {
    type: string;
    id: string;
    name: string;
    placeholder: string;
};

export class Input extends Component<InputPropsType> {
    public cls = [classes.Input];

    render() {
        return (
            <input className={this.cls.join(' ')}
                   type={this.props.type}
                   id={this.props.id}
                   name={this.props.name}
                   placeholder={this.props.placeholder}
                   required={true} />
        );
    }
}