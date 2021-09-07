import React, { Component } from 'react';
import FollowPeopleUnit from './FollowPeopleUnit.js'
import './App.css';

class FollowPeopleContainer extends React.Component {
    constructor() {
        super()
    }

    render() {
        let followData = this.props.followUsersData
        // Remove the users that you already follow so that you don't see em
        for(let i = 0; i < followData.length; i++) {
            let indexOfFollowing = followData[i].following.indexOf(this.props.userAddress)
            if(indexOfFollowing != -1) {
                followData = followData.splice(indexOfFollowing, 1)
            }
        }
        return (
            <div className={this.props.className}>
                {followData.map(user => (
                    <FollowPeopleUnit
                        key={user.address}
                        address={user.addres}
                        age={user.age}
                        name={user.name}
                        state={user.state}
                        recommendations={user.recommendations}
                        following={user.following}
                        followUser={() => {
                            this.props.followUser(user.address)
                        }}
                    />
                ))}
            </div>
        )
    }
}

export default FollowPeopleContainer;
