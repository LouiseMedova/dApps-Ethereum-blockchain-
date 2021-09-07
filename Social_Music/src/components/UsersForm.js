import React, { Component } from 'react';
import './App.css';

class UsersForm extends React.Component {
    constructor() {
        super()
    }

    render() {
        return (
            <div className="UsersForm">
                <div className="UsersForm-name">{this.props.name}</div>
                <div className="UsersForm-age">{this.props.age}</div>
                <div className="UsersForm-state">{this.props.state}</div>
                <div className="UsersForm-address">{this.props.address}</div>
            </div>
        )
    }
}

export default UsersForm;