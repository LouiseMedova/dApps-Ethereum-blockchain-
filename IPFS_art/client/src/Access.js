import React, { Component } from 'react';
import styled from "styled-components";
import  MusicIcon from "./music.svg";
import './App.css';


class Access extends React.Component {
    constructor() {
        super()
    }

     hex_to_ascii(str1)
 {
  var hex  = str1.toString();
  var str = '';
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
 }

    render() {
        let content, view
        if(this.props.loading){
        content = <p id="loader" className="text-center">Loading...</p>
        } else {
        let song = this.props.artItem.name;
        console.log(this.props.artItem)
        console.log(song)
        console.log(song.length)
       console.log(this.props.loading)
        if(song.length > 0){
            view = 
                <Container> 
                <img src={MusicIcon}/>
                <div><h2>{this.hex_to_ascii(this.props.artItem.name)}</h2></div>
                <Button>Get access</Button> </Container> 

        }
        else {
            view = this.props.artItem.ipfsHash;
        }
    }


        
        return (
            <div> 
             {view}
            </div> 
            

        )
    }
}

const Container = styled.div`
 display: flex;
  justify-content: space-between;
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

export default Access;
