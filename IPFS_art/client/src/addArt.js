import React, { Component } from 'react';
import './App.css';
import styled from "styled-components";

class AddArt extends React.Component {
    constructor() {
        super()
    }

    render() {
        return (
            <form className={this.props.className}>
                  <Container>
                     <input className="form-input" 
                            type="text" ref="form-name"    
                            placeholder="Filename"/>
                        <UploadInput 
                         type="file"
                         id = "upload"
                         onChange={this.props.captureFile}
                    />
                    <Label htmlFor="upload">Upload</Label>
                    <Button
                    onClick={event => {
                            event.preventDefault()
                           
                        this.props.onIPFSSubmit(event)
                        this.props.setName(this.refs['form-name'].value)
                        }}
                        type="submit"> 
                        Send it 
                    </Button>
                   
                </Container>
              <p> The IPFS hash is: {this.props.ipfsHash}</p>
            </form>
                    

        )
    }
}

const Container = styled.div`
 display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  max-width: 1000px;
  margin: auto;
  width: 100%;
  padding: 2rem;
  img {
    height: 3rem;
    cursor: pointer;
  }

`;

const Button = styled.button`
  font-size: 0.8rem;
  background: #f774c5;
  border: none;
  padding: 0.8rem 1.1rem;
  color: #fff;
  border-radius: 1rem;
  box-shadow: 0px 13px 24px -7px #ecb6d7;
  transition: all 0.2s ease-in-out;
  margin-left: 0.5rem;
  cursor: pointer;
  &:hover {
    box-shadow: 0px 17px 16px -11px #ecb6d7;
    transform: translateY(-5px);
  }

  @media (max-width: 670px){

  }

`;

const UploadInput = styled.input`
  display: none;
`;

const Label = styled.label`
    display: inline-block;
    cursor: pointer;
    color: #81d1ff;
    background: transparent;
    border-radius: 1rem;
    margin: 2rem;
    padding: 0.8rem 1rem;
    border: 3px solid #81d1ff;
    &:hover {
      box-shadow: 0px 17px 16px -11px #81d1ff;
      transform: translateY(-5px);
    }
`;

export default AddArt;
