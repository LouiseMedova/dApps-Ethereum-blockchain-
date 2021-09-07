import React, { Component } from 'react';
import styled from "styled-components";
import  MusicIcon from "./music.svg";
import Access from "./Access.js"
import './App.css';


class ViewArts extends React.Component {
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
       
        return (
            


            <form className={this.props.className}>
        
                <div>
                    { this.props.arts.map((art, key) => {
                        return(<div key={key} className="">
                             {art.access ? 
                                (<Container>
                                     <img src={MusicIcon}/>
                                     <div><h2><a href= "#">{"https://gateway.ipfs.io/ipfs/"+art.ipfsHash}</a></h2></div>
                                </Container> ):
                                (<Container>
                                     <img src={MusicIcon}/>
                                     <h2>{this.hex_to_ascii(art.name)}</h2>
                                    <Button onClick={ event => {
                                        event.preventDefault()
                                        this.props.giveAccesstoArt(event, art.ipfsHash)
                                        }}>Get access</Button> 
                                </Container>)}
                                                            
                                </div>)}) } 
                </div>
            </form>
                    

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

export default ViewArts;
