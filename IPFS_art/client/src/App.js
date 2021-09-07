import React, { Component } from "react";
import IPFSInboxContract from "./IPFSInbox.json";
import Original from "./Original.json";
import getWeb3 from "./utils/getWeb3";
import AddArt from "./addArt.js";
import ViewArts from "./ViewArts.js";
import Web3 from 'web3';
import truffleContract from "truffle-contract";
import styled from "styled-components";
import  MusicIcon from "./music.svg";
import ipfs from './ipfs';

import "./App.css";

class App extends Component {

  async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }


  constructor(props) {
    super(props)
      this.state = { 
      storageValue: 0, 
      web3: null, 
      accounts: null, 
      contract: null, 
      ipfsHash: null,
      isViewArtsHidden: true,
      isAddArtHidden: true,
      arts: [],
      name: '',
      formIPFS: "",
      formAddress: "",
      receivedIPFS: "",
      loading: false
    };

    this.handleChangeAddress = this.handleChangeAddress.bind(this);
    this.handleChangeIPFS = this.handleChangeIPFS.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleReceiveIPFS = this.handleReceiveIPFS.bind(this);
  }

  hideAllSections() {
        this.setState({
            isViewArtsHidden: true,
            isAddArtHidden: true
        })
    }

  
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log(accounts[0])
    this.setState({ accounts: accounts})
    // Load contract
    const networkId = await web3.eth.net.getId()
    const originalData = Original.networks[networkId]


    if(originalData) {
      const contract = new web3.eth.Contract(Original.abi, originalData.address);
      this.setState({ contract })

      const ArtistList = await contract.methods.getArtistList().call();
      console.log('num of artists', ArtistList.length)
      for (var i = 0; i <= ArtistList.length - 1; i++) {
        const num = await this.state.contract.methods.numOfItems(ArtistList[i]).call();
        console.log('num of arts', num)
        console.log(ArtistList[i])
         for(var j = 0; j <= num - 1; j++) {
          
          let ipfsHash = await this.state.contract.methods.artOwnership(ArtistList[i],[j]).call()
          let name = await this.state.contract.methods.ipfsHashestoNames(ipfsHash).call()
          let access = await this.state.contract.methods.ifAccess(ipfsHash).call({ from: this.state.accounts[0]})
          console.log(ipfsHash)
          console.log(access)
          let item = {
                name,
                ipfsHash,
                access
                }
           this.setState({
                arts: [...this.state.arts, item]
                 })
          }
         }
       }
      else {
            window.alert('Contract not deployed to detected network')
          }
        }
    

  // BELOW ADDED
  handleChangeAddress(event){
    this.setState({formAddress: event.target.value});
  }

  handleChangeIPFS(event){
    this.setState({formIPFS: event.target.value});
  }

  handleSend(event){
    event.preventDefault();
    const contract = this.state.contract
    const account = this.state.accounts[0]

  //  document.getElementById('new-notification-form').reset()
  //  this.setState({showNotification: true});
    contract.methods.sendArt(this.state.formAddress, this.state.formIPFS, {from: account})
      .then(result => {
        this.setState({formAddress: ""});
        this.setState({formIPFS: ""});
      })
  }

  handleReceiveIPFS(event){
    event.preventDefault();
    const contract = this.state.contract
    const account = this.state.accounts[0]
    contract.checkInbox({from: account})
  }

  convertToBuffer = async(reader) => {
  //  file is converted to a buffer for upload to IPFS
      const buffer = await Buffer.from(reader.result);
 //   set this buffer -using es6 syntax
      this.setState({buffer});
  };

  captureFile = (event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)    
  };

  onIPFSSubmit (event) {
    this.setState({ loading: true })
    event.preventDefault();

    //bring in user's metamask account address
    const accounts = this.state.accounts;

    console.log('Sending from Metamask account: ' + accounts[0]);


    //save document to IPFS,return its hash#, and set hash# to state
    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 

     ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log(ipfsHash[0].hash);
      const hash = ipfsHash[0].hash
      console.log(hash)
      console.log(this.state.accounts[0])
      //setState by setting ipfsHash to ipfsHash[0].hash 
      const name = this.state.name
      console.log(name)
     this.state.contract.methods.sendArt(hash, this.fillBytes32WithSpaces(name)).send({from: this.state.accounts[0]}).then(() => {
      return  this.setState({ ipfsHash: ipfsHash[0].hash})
      console.log('ipfsHash', this.state.ipfsHash)
    })

    }) 

     this.setState({ loading: false })
  }; 


  async giveAccesstoArt(event, _ipfsHash) {
    event.preventDefault();
 console.log(_ipfsHash)
    console.log('ACCESS')
     console.log(this.state.accounts[0])
    await this.state.contract.methods.getAccess(_ipfsHash).send({ from: this.state.accounts[0], value: window.web3.utils.toWei('10', 'Ether') })
  }

  fillBytes32WithSpaces(name) {
        let nameHex = Web3.utils.toHex(name)
        for(let i = nameHex.length; i < 66; i++) {
            nameHex = nameHex + '0'
        }
        return nameHex
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
  // ABOVE ADDED 

  render() {
  
    return (
      <div className="App">

        <BtnContainer>
          <button onClick={() => {
                        this.hideAllSections()
                        if(this.state.isAddArtHidden) this.setState({isAddArtHidden: false})
                        else this.setState({isAddArtHidden: true})
                          
                    }}>Add Art</button>

           <button onClick={() => {
                        this.hideAllSections()
                        if(this.state.isViewArtsHidden) this.setState({isViewArtsHidden: false})
                        else this.setState({isViewArtsHidden: true})
                          
                    }}>View Arts</button>
        </BtnContainer>

        <AddArt className={this.state.isAddArtHidden ? 'hidden': ''}
           close={() => {
                          this.setState({isAddArtHidden: true})
                      }}
          onIPFSSubmit = { (event) => this.onIPFSSubmit(event)}
          captureFile = { (event) => this.captureFile(event)}
          addArt = { (string) => this.addArt(string)}
          ipfsHash = {this.state.ipfsHash}
          arts = {this.state.arts}
          setName = { (name) => this.setState({ name: name})}
          />

     
              
       <ViewArts
          className={this.state.isViewArtsHidden ? 'hidden': ''}
                    close={() => {
                        this.setState({isViewArtsHidden: true})
                    }}
                    arts = {this.state.arts}
                    giveAccesstoArt = { (event, ipfsHash) => this.giveAccesstoArt(event, ipfsHash)}

        />
        
    </div>
    );
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

const BtnContainer = styled.div`
  margin-top: 2rem;
  button {
    background-color: #81D1FF;
    border: none;
    padding: 0.9rem 1.1rem;
    color: #fff;
    border-radius: 1rem;
    box-shadow: 0px 13px 24px -7px #81d1ff;
    transition: all 0.3s ease-in-out;
    margin: 0.5rem;
    font-size: 0.8rem;
    cursor: pointer;

    &:hover {
      box-shadow: 0px 17px 16px -11px #81d1ff;
      transform: translateY(-5px);
    }
  }

  .addart {
    color: #81d1ff;
    background: transparent;
    border: 3px solid #81d1ff;

    &:hover {
      box-shadow: 0px 17px 16px -11px #81d1ff;
      transform: translateY(-5px);
    }
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

export default App;
