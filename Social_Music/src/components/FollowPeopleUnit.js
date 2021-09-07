import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';

class FollowPeopleUnit extends React.Component {
    constructor() {
        super()
    }

    render() {
        return (
            <div className="follow-people-unit">
                <div className="follow-people-address">{this.props.address}</div>
                <div className="follow-people-name">{Web3.utils.toUtf8(this.props.name)}</div>
                <div className="follow-people-age">{this.props.age}</div>
                <div className="follow-people-state">"{this.props.state}"</div>
                <div className="follow-people-recommendation-container">
                    {this.props.recommendations.map((message, index) => (
                        <div key={index} className="follow-people-recommendation">{message}</div>
                    ))}
                </div>
                <button
                    className="follow-button"
                    onClick={() => {
                        this.props.followUser()
                    }}
                >Follow</button>
            </div>
        )
    }
}

 export default FollowPeopleUnit;