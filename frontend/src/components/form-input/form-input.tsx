import React, {Component} from 'react';
import classes from './form-input.module.scss';
import {InputProps} from "../../entities/form-input/form-input.interfaces";

export class FormInput extends Component<InputProps> {
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