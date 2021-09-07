const Escrow = artifacts.require('Escrow');

const assertError = async (promise, error) => {
  try {
    await promise;
  } catch(e) {
    assert(e.message.includes(error))
    console.log()
    return;
  }
  assert(false);
}

contract('Escrow', accounts => {
  let escrow = null;
  const [lawyer, payer, recipient] = accounts;
  before(async () => {
    escrow = await Escrow.deployed();
  });

  it('Should deposit', async () => {
    await escrow.deposit({from: payer, value: 900});
    const escrowBalance = parseInt(await web3.eth.getBalance(escrow.address));
    assert(escrowBalance === 900);
  });


  it('Should not deposit if the sender is not payer', async () => {
    assertError(
      escrow.deposit({from: accounts[5], value:100}),
      'Sender must be the payer'
      );  
  });

  it('Should NOT deposit if transfer exceed amount', async () => {
    assertError(
      escrow.deposit({from: payer, value: 2000}),
      'Cant send more than escrow amount'
      );
  });

  it('should NOT release if not lawyer', async () => {
    await escrow.deposit({from: payer, value: 100}); //We are missing 100 wei
    try {
      await escrow.release({from: payer});
    } catch(e) {
      assert(e.message.includes('only lawyer can release funds'));
      return;
    }
    assert(false);
  });

  it('should release', async () => {
    const initialRecipientBalance = web3.utils.toBN(
      await web3.eth.getBalance(recipient)
    );
    await escrow.release({from: lawyer});
    const finalRecipientBalance = web3.utils.toBN(
      await web3.eth.getBalance(recipient)
    );
    assert(finalRecipientBalance.sub(initialRecipientBalance).toNumber() === 1000);
  });


});

