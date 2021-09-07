const { expectRevert, time } = require('@openzeppelin/test-helpers');
const Lottery = artifacts.require('Lottery.sol');

contract('Lottery', (accounts) => {
  let lottery;
  beforeEach(async () => {
    lottery = await Lottery.new(2);
  });
  
  it('Should NOT create bet if not admin', async () => {
    await expectRevert(
        lottery.createBet(3,5, {from: accounts[1]}),
        'only admin'
      );
  });

  it('Should NOT create bet if state not idle', async () => {
    await lottery.createBet(3,5, {from: accounts[0]});
    await expectRevert(
        lottery.createBet(3,5, {from: accounts[0]}),
        'current state does not allow this'
      );
  });

  it('Should create a bet', async () => {
     await lottery.createBet(3,5, {from: accounts[0]});
     const betCount = await lottery.betCount();
     const betSize = await lottery.betSize();
     const state = await lottery.currentState();
     assert(betCount.toNumber() === 3);
     assert(betSize.toNumber() === 5);
     assert(state.toNumber() === 1);
  });

  it('Should NOT bet if not in state BETTING', async () => {
     await expectRevert(
        lottery.bet({value: 100, from: accounts[1]}),
        'current state does not allow this'
      );
  });

  it('Should NOT bet if not sending exact bet amount', async () => {
    await lottery.createBet(3,5, {from: accounts[0]});
    await expectRevert(
        lottery.bet({value: 3, from: accounts[1]}),
        'can only bet exactly the bet size'
      );
  });

  it('Should bet', async () => {
    const players = [accounts[1], accounts[2], accounts[3]];
    await lottery.createBet(3, web3.utils.toWei('1', 'ether'));

    balancesBefore = await Promise.all(players.map( player =>
      web3.eth.getBalance(player)));
    balancesBeforeBN = balancesBefore.map(balance => web3.utils.toBN(balance));

    const txs = await Promise.all(players.map(player => lottery.bet({
      from: player, 
      value: web3.utils.toWei('1', 'ether'),
      gasPrice: 1}
      )));

    balancesAfter = await Promise.all(players.map( player =>
      web3.eth.getBalance(player)));
    balancesAfterBN = balancesAfter.map(balance => web3.utils.toBN(balance));

    const result = players.some((_player, i) => {
      const gasUsed = web3.utils.toBN(txs[i].receipt.gasUsed);
      const expected = web3.utils.toBN(web3.utils.toWei('1.94', 'ether'));
      return balancesAfterBN[i].sub(balancesBeforeBN[i]).add(gasUsed).eq(expected);
    });
    assert(result === true);
  });

  it('Should NOT cancel if not betting', async () => {
    await expectRevert(
        lottery.cancel({from: accounts[0]}),
        'current state does not allow this'
      );

  });

  it('Should NOT cancel if not admin', async () => {
    await lottery.createBet(3, web3.utils.toWei('1', 'ether'));
    await expectRevert(
        lottery.cancel({from: accounts[1]}),
        'only admin'
      );
  });

  it('Should cancel', async () => {
    await lottery.createBet(3, 100);
    await lottery.cancel();
    const state = await lottery.currentState();
    assert(state.toNumber() === 0);

  });
});
