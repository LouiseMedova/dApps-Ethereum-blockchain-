import React, { Component } from 'react';
import './App.css';


class Form extends React.Component {
    constructor() {
        super()
    }

    render() {
        return (
            <form className={this.props.className}>
                <input className="form-input" 
                    type="text" ref="form-name"    
                    placeholder="Your name"/>
                <input className="form-input" 
                    type="number" ref="form-age" 
                    placeholder="Your age"/>
                <textarea className="form-input form-textarea" 
                    ref="form-state" 
                    placeholder="Your state, a description about yourself"></textarea>
               <div>
                   <div className="buttons-container">
                   <button onClick={event => {
                             event.preventDefault()
                             this.props.cancel()
                         }} className="cancel-button">Cancel</button>
                    <button onClick={event => {
                            event.preventDefault()
                            this.props.setupAccount(this.refs['form-name'].value, this.refs['form-age'].value, this.refs['form-state'].value)

                        }} className="button-submit"><span>Submit</span></button>
                    </div>
                </div>
            </form>
                    

        )
    }
}

export default Form;
