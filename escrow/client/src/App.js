import React, { Component } from 'react';
import { getWeb3 } from './utils.js';
import Escrow from './contracts/Escrow.json'

class App extends Component {

  state = {
    web3: undefined,
    accounts: [],
    currentAccount: undefined,
    contract: undefined,
    balance: undefined
  }

  async componentDidMount() {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
    console.log(networkId);
    const deployedNetwork = Escrow.networks[networkId];
    console.log(deployedNetwork.address);
    
    const contract = new web3.eth.Contract(
        Escrow.abi,
        deployedNetwork.address
       );

    this.setState({web3, accounts, contract}, this.updateBalance);
  };

  async updateBalance() {
    const  contract  = this.state.contract;
    const balance = await contract.methods.balanceOf().call();
    this.setState({ balance }); 
  };

  async deposit(e) {
    e.preventDefault();

    const { contract, accounts } = this.state;
    console.log(accounts[0]);
    await contract.methods.deposit().send({
      from: accounts[0],
      value: e.target.elements[0].value
    });
    this.updateBalance();
  }

  async release(e) {
    e.preventDefault();
    const { contract, accounts } = this.state;
    await contract.methods.release().send({
      from: accounts[0]
      });
    this.updateBalance();
  }

  render() {
    if(!this.state.web3) {
      return <div>Loading...</div>;
    }
    const { balance } = this.state;
    return (
      <div className="container">
        <h1 className="text-center">Escrow</h1>

        <div className="row">
          <div className="col-sm-12">
             <p>Balance: <b>{balance}</b> wei </p>
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <form onSubmit={e => this.deposit(e)}>
              <div className="form-group">
                <label htmlFor="deposit">Deposit</label>
                <input type="number" className="form-control" id="deposit" />
              </div>
              <button type="submit" className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>

        <br />

        <div className="row">
          <div className="col-sm-12">
             <button onClick={e => this.release(e)} type="submit" className="btn btn-primary">Release</button>
          </div>
        </div>

      </div>
    );
  }
}

export default App;
