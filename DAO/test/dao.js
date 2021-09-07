const { expectRevert, time } = require('@openzeppelin/test-helpers');
const DAO = artifacts.require('DAO');

contract('DAO', (accounts) => {
  let dao;

  const [investor1, investor2, investor3] = [accounts[1], accounts[2], accounts[3]];
  beforeEach(async () => {
    dao = await DAO.new(2, 2, 50);

    await dao.contribute({from: investor1, value: 100});
    await dao.contribute({from: investor2, value: 200});
    await dao.contribute({from: investor3, value: 300});

    await dao.createProposal(
      'Proposal',
      50,
      accounts[5],
      {from: investor1}
      );

  });

  it('Should accept contribution', async () => {
    
    const shares = await Promise.all(
      [investor1, investor2, investor3].map(investor =>
        dao.shares(investor)
       )
      );

    const isInvestors = await Promise.all(
      [investor1, investor2, investor3].map(isInvestor =>
        dao.investors(isInvestor)
      )
    );

    const totalShares = await dao.totalShares();
    const availableFunds = await dao.availableFunds();

    assert(shares[0].toNumber() === 100);
    assert(shares[1].toNumber() === 200);
    assert(shares[2].toNumber() === 300);
    isInvestors.forEach(isInvestor => assert(isInvestor === true));

    assert(totalShares.toNumber() === 600);
    assert(availableFunds.toNumber() === 600);
    
  });

  it('Should NOT accept contribution after contributionTime', async () => {
    await time.increase(2001);
    await expectRevert(
      dao.contribute({from: investor1, value: 100}),
      'cannot contribute after contributionEnd'
    );
  });

  it('Should create proposal', async () => {      
    const proposal = await dao.proposals(0);
    assert(proposal.id.toNumber() === 0);
    assert(proposal.name === 'Proposal');
    assert(proposal.amount.toNumber() === 50);
    assert(proposal.recipient.toString() === accounts[5]);
    assert(proposal.votes.toNumber() === 0);
    assert(proposal.executed === false);
  });

  it('Should NOT create proposal if not from investor', async () => {
    await expectRevert(
      dao.createProposal(
      'Proposal',
      50,
      investor3,
      {from: accounts[10]}
      ),
      'only investors'
    );
  });

  it('Should NOT create proposal if amount too big', async () => {
    await expectRevert(
      dao.createProposal(
      'Proposal',
      2000,
      investor3,
      {from: investor1}
      ),
      'amount too big'
    );
  });

  it('Should vote', async () => {
    
    await dao.vote(0, {from: investor1});
    const proposal = await dao.proposals(0);
    assert(proposal.votes.toNumber() === 100);
  });

  it('Should NOT vote if not investor', async () => {
    await expectRevert(
      dao.vote(0,{from: accounts[10]}),
      'only investors'
    );
  });

  it('Should NOT vote if already voted', async () => {
    await dao.vote(0,{from: investor1}),
    await expectRevert(
      dao.vote(0,{from: investor1}),
      'investor can only vote once for a proposal'
    );
  });

  it('Should NOT vote if after proposal end date', async () => {

    await time.increase(2001);
    await expectRevert(
      dao.vote(0,{from: investor1}),
      'can only vote until proposal end date'
    );
  });

  it('Should execute proposal', async () => {
    
    const balanceRecipientBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[5]));

    await dao.vote(0,{from: investor1});
    await dao.vote(0,{from: investor2});
    await dao.vote(0,{from: investor3});
    await time.increase(2001);

    await dao.executeProposal(0, {from: accounts[0]});
    const balanceRecipientAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[5]));
    assert(balanceRecipientAfter.sub(balanceRecipientBefore).toNumber() === 50);
    const proposal = await dao.proposals(0);
    assert(proposal.executed === true);

    });

  it('Should NOT execute proposal if not enough votes', async () => {

    await dao.vote(0,{from: investor1});
    await time.increase(2001);
    await expectRevert(
      dao.executeProposal(0, {from: accounts[0]}),
      'cannot execute proposal with votes # below quorum'
    );
  });

  it('Should NOT execute proposal twice', async () => {
   
    await dao.vote(0,{from: investor1});
    await dao.vote(0,{from: investor2});
    await dao.vote(0,{from: investor3});

    await time.increase(2001);

    await dao.executeProposal(0, {from: accounts[0]});

    await expectRevert(
      dao.executeProposal(0, {from: accounts[0]}),
      'cannot execute proposal already executed'
    );
  });

  it('Should NOT execute proposal before end date', async () => {
    

    await dao.vote(0,{from: investor1});
    await dao.vote(0,{from: investor2});
    await dao.vote(0,{from: investor3});


    await expectRevert(
      dao.executeProposal(0, {from: accounts[0]}),
      'cannot execute proposal before end date'
    );
  });

  it('Should withdraw ether', async () => {
    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[5]));
    await dao.withdrawEther(10, accounts[5]);
    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[5]));
    assert(balanceAfter.sub(balanceBefore).toNumber() === 10);

  });

  it('Should NOT withdraw ether if not admin', async () => {
    await expectRevert(
      dao.withdrawEther(10, accounts[5], {from: investor1}),
      'only admin'
    );
  });

  it('Should NOT withdraw ether if trying to withdraw too much', async () => {
    await expectRevert(
      dao.withdrawEther(1000, accounts[5], {from: accounts[0]}),
      'not enough availableFunds'
    );
  });
});
