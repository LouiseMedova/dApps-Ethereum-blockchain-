import React, { Component } from 'react';
import logo from '../logo.png';

import './App.css';
import Web3 from 'web3';
import SocialMusic from '../abis/SocialMusic.json'
import Form from './Form.js';
import Recommendation from './Recommendation.js';
import AddMusic from './AddMusic.js';
import FollowPeopleContainer from './FollowPeopleContainer.js';
import UsersForm from './UsersForm.js';

class App extends Component {

async componentWillMount(){
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log(accounts[0])
    this.setState({ account: accounts[0]})
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })
    // Load contract
    const networkId = await web3.eth.net.getId()
    const socialMusicData = SocialMusic.networks[networkId]

    if(socialMusicData) {
      const socialMusic = new web3.eth.Contract(SocialMusic.abi,socialMusicData.address)
      this.setState({ socialMusic })  

      const userAddresses = await socialMusic.methods.getUserList().call()
      console.log(userAddresses.length)
      // Load Users
       for (var i = 0; i <= userAddresses.length - 1; i++) {
        let {name, age, state} = await this.state.socialMusic.methods.users(userAddresses[i]).call()
        let userData = {
                address: userAddresses[i],
                age,
                name,
                state
            }

        this.setState({
          users: [...this.state.users, userData]
        })
      }
    }
    else {
            window.alert('Contract not deployed to detected network')
    }


}

async getFollowPeopleUsersData() {
        let userAddresses = await this.state.socialMusic.methods.getUserList().call()

        // The user object array contains objects like so userObject = {address, name, age, state, recommendations[2], following[]}
        let usersObjects = []

        // Return only the latest 10 users with only 2 recommendations for each, ignore the rest to avoid getting a gigantic list
        if(userAddresses.length > 10) userAddresses = userAddresses.slice(0, 10)
        for(let i = 0; i < userAddresses.length; i++) {
            let {age, name, state} = await this.state.socialMusic.methods.users(userAddresses[i]).call()
            let userData = {
                address: userAddresses[i],
                age,
                name,
                state,
                recommendations: [],
                following: []
            }
            let usersMusicRecommendationLength = await this.state.socialMusic.methods.getUsersMusicRecommendationLength(userAddresses[i]).call()
            // We only want to get the 2 latests music recommendations of each user
            if(usersMusicRecommendationLength > 2) usersMusicRecommendationLength = 2
            for(let a = 0; a < usersMusicRecommendationLength; a++) {
                const recommendation = await this.state.socialMusic.methods.getUsersMusicRecommendation(userAddresses[i], a).call()
                userData.recommendations.push(recommendation)
            }
            let following = await this.state.socialMusic.methods.getUsersFollowings(userAddresses[i]).call()
            userData.following = following
            usersObjects.push(userData)
        }
        await this.setState({followUsersData: usersObjects})
    }

 async followUser(address) {
        await this.state.socialMusic.methods.follow(address).send({from: this.state.account})
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

  async setupAccount(name, age, status) {
        await this.state.socialMusic.methods.setup(this.fillBytes32WithSpaces(name), age, status).
        send({from: this.state.account})
    }

 async addMusic(music) {
        await this.state.socialMusic.methods.addSong(music).
        send({from: this.state.account})
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

  hideAllSections() {
        this.setState({
            isFormHidden: true,
            isAddMusicHidden: true,
            isFollowPeopleHidden: true
        })
    }


  constructor() {
    super()

    this.state = {
      account: '',
      ethBalance: '0',
      socialMusic: {},
      users: [{name:'', age: '', state: '', address: ''}],
      followUsersData: [],
      userAddress: '',
      isFormHidden: true,
      isAddMusicHidden: true,
      isFollowPeopleHidden: true
    }
    
  }




  render() {
    return (
      <div>
        <div className="Welcome-form">Welcome to Decentralized Social Music!</div>
        <div className="subheader-form">Setup your account, start adding musical recommendations for your friends and follow people that may interest you</div>
        <div className="buttons-container">
            <button onClick={() => {
              this.hideAllSections()
                if(this.state.isFormHidden) this.setState({isFormHidden: false})
                        else this.setState({isFormHidden: true})
                      }}>Setup Account</button>

           <button onClick={() => {
                        this.hideAllSections()
                        if(this.state.isAddMusicHidden) this.setState({isAddMusicHidden: false})
                        else this.setState({isAddMusicHidden: true})
                    }}>Add Music</button>
           <button onClick={() => {
                        this.hideAllSections()
                        if(this.state.isFollowPeopleHidden) this.setState({isFollowPeopleHidden: false})
                        else this.setState({isFollowPeopleHidden: true})
                          this.getFollowPeopleUsersData()
                    }}>Follow People</button>
              </div>
        <Form
          className={this.state.isFormHidden ? 'hidden' : ''}
          cancel={() => {
                this.setState({isFormHidden: true})
         }}
          setupAccount={(name, age, status) => {
                        this.setupAccount(name, age, status)
                    }}
         />

         <AddMusic
          className={this.state.isAddMusicHidden ? 'hidden' : ''}
          cancel={() => {
                this.setState({isAddMusicHidden: true})
         }}
          addMusic={(music) => {
                        this.addMusic(music)
                    }}
         />

         <FollowPeopleContainer
                    className={this.state.isFollowPeopleHidden ? 'hidden': 'follow-people-container'}
                    close={() => {
                        this.setState({isFollowPeopleHidden: true})
                    }}
                    userAddress={this.state.userAddress}
                    followUsersData={this.state.followUsersData}
                    followUser={address => {
                        this.followUser(address)
                    }}
                />

         <div ref="UsersForms">
                   { this.state.users.map((user, key) => {
                      return(
                  <div key={key}>
                    <UsersForm
                        name={this.hex_to_ascii(user.name)}
                        age={user.age}
                        state={user.state}
                        address={user.address}
                    />
                  </div>
              )
            })}
                </div>
      </div>
    );
  }
}



export default App;
