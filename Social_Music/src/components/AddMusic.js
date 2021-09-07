import React, { Component } from 'react';
import './App.css';


class AddMusic extends React.Component {
    constructor() {
        super()
    }

    render() {
        return (
            <form className={this.props.className}>
                <input type="text" ref="add-music-input" className="form-input" placeholder="Your song recommendation"/>
               <div className="buttons-container">
               <button onClick={event => {
                         event.preventDefault()
                         this.props.cancel()
                     }} className="cancel-button">Cancel</button>
                <button onClick={event => {
                        event.preventDefault()
                        this.props.addMusic(this.refs['add-music-input'].value)

                    }}className="button-submit"><span>Submit</span></button>
                </div>
            </form>
                    

        )
    }
}

export default AddMusic;
