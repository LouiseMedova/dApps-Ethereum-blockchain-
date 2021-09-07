const { expectRevert, time } = require('@openzeppelin/test-helpers');
const ICO = artifacts.require('ICO.sol');
const Token = artifacts.require('ERC20Token.sol');

contract('ICO', accounts => {
  let ico;
  let token;
  const name = 'My Token';
  const symbol = 'TKN'; 
  const decimals = 18;
  const initialBalance = web3.utils.toBN(web3.utils.toWei('1000'));

  beforeEach(async () => {
    ico = await ICO.new(name, symbol, decimals, initialBalance); 
    const tokenAddress = await ico.token();
    token = await Token.at(tokenAddress); 
  });

  it('should create an erc20 token', async () => {
    const _name = await token.name();
    const _symbol = await token.symbol();
    const _decimals = await token.decimals();
    const _initialBalance = web3.utils.toBN(await token.totalSupply());
    assert(_name === name);
    assert(_symbol === symbol);
    assert(_decimals.toNumber() === decimals);
    assert(_initialBalance.toString() === initialBalance.toString());
  });

  it('should start the ICO', async () => {
    const duration = 100;
    const price = 2;
    const availableTokens = web3.utils.toWei('30');
    const minPurchase = web3.utils.toWei('1'); 
    const maxPurchase = web3.utils.toWei('10');
    await ico.start(
        duration,
        price,
        availableTokens,
        minPurchase,
        maxPurchase
      );
    const _price = await ico.price();
    const _availableTokens = web3.utils.toBN(await ico.availableTokens());
    const _minPurchase = await ico.minPurchase();
    const _maxPurchase = await ico.maxPurchase();

    assert(_price.toNumber() === price);
    assert(_availableTokens.toString() === availableTokens.toString());

  });

  it('should NOT start the ICO', async () => {
    const duration = 100;
    const price = 2;
    const availableTokens = web3.utils.toWei('30');
    const minPurchase = web3.utils.toWei('1'); 
    const maxPurchase = web3.utils.toWei('10');

    await expectRevert(
      ico.start(
        duration,
        price,
        availableTokens,
        minPurchase,
        maxPurchase,
        {from: accounts[1]}
      ), 'only admin');

    await expectRevert(
      ico.start(
        0,
        price,
        availableTokens,
        minPurchase,
        maxPurchase
      ), 'duration should be > 0');

    await expectRevert(
      ico.start(
        duration,
        price,
        web3.utils.toWei('3000'),
        minPurchase,
        maxPurchase
      ), 'totalSupply should be > 0 and <= totalSupply');

    await expectRevert(
      ico.start(
        duration,
        price,
        availableTokens,
        0,
        maxPurchase
      ), '_minPurchase should > 0');

     await expectRevert(
      ico.start(
        duration,
        price,
        availableTokens,
        minPurchase,
        web3.utils.toWei('2000')
      ), '_maxPurchase should be > 0 and <= _availableTokens');

     await ico.start(
        duration,
        price,
        availableTokens,
        minPurchase,
        maxPurchase
      );

      await expectRevert(
      ico.start(
        duration,
        price,
        availableTokens,
        minPurchase,
        maxPurchase
      ), 'ICO should not be active');

  });

  context('Sale started', () => {
    let start;
    const duration = 100;
    const price = 2;
    const availableTokens = web3.utils.toWei('30');
    const minPurchase = web3.utils.toWei('1'); 
    const maxPurchase = web3.utils.toWei('10');
    beforeEach(async() => {
     start = parseInt((new Date()).getTime() / 1000);
      time.increaseTo(start);
      ico.start(duration, price, availableTokens, minPurchase, maxPurchase); 
    });

    it('should NOT let non-investors buy', async () => {
        await expectRevert(
          ico.buy({from: accounts[1], value: 4}),
          'only investors'
          );
    });

    it('should NOT buy non-multiple of price', async () => {
      await ico.whitelist(accounts[1], {from: accounts[0]});
      await expectRevert(
          ico.buy({from: accounts[1], value: 3}),
          'have to send a multiple of price'
          );
    });

    it('should NOT buy if not between min and max purchase', async () => {
      await ico.whitelist(accounts[1], {from: accounts[0]});
      await expectRevert(
          ico.buy({from: accounts[1], value: web3.utils.toWei('11')}),
          'have to send between minPurchase and maxPurchase'
          );
    });

    it('should NOT buy if not enough tokens left', async () => {
      await ico.whitelist(accounts[1], {from: accounts[0]});
      await ico.whitelist(accounts[2], {from: accounts[0]});
      await ico.whitelist(accounts[3], {from: accounts[0]});
      await ico.whitelist(accounts[4], {from: accounts[0]});

      await ico.buy({from: accounts[1], value: web3.utils.toWei('5')});
      await ico.buy({from: accounts[2], value: web3.utils.toWei('5')});
      await ico.buy({from: accounts[3], value: web3.utils.toWei('4')});

      await expectRevert(
        ico.buy({from: accounts[4], value: web3.utils.toWei('2')}),
        'Not enough tokens left for sale'
        );
    });

    it.only(
      'full ico process: investors buy, admin release and withdraw', 
      async () => {

  
        const investors = [accounts[1], accounts[2], accounts[3], accounts[4]];

        await ico.whitelist(accounts[1], {from: accounts[0]});
        await ico.whitelist(accounts[2], {from: accounts[0]});
        await ico.whitelist(accounts[3], {from: accounts[0]});
        await ico.whitelist(accounts[4], {from: accounts[0]});

        await ico.buy({from: accounts[1], value: web3.utils.toWei('1')});

        let balanceContract = web3.utils.toBN(await web3.eth.getBalance(ico.address));
        console.log(balanceContract.toString());
        await ico.buy({from: accounts[2], value: web3.utils.toWei('2')});
        balanceContract = web3.utils.toBN(await web3.eth.getBalance(ico.address));
        console.log(balanceContract.toString());
        await ico.buy({from: accounts[3], value: web3.utils.toWei('3')});
        balanceContract = web3.utils.toBN(await web3.eth.getBalance(ico.address));
        console.log(balanceContract.toString());
        await ico.buy({from: accounts[4], value: web3.utils.toWei('4')});
        balanceContract = web3.utils.toBN(await web3.eth.getBalance(ico.address));
        console.log(balanceContract.toString());

        const initialBalances = await Promise.all(
            investors.map(investor => token.balanceOf(investor))
          );

        await expectRevert(
        ico.release({from: accounts[4]}),
        'only admin'
        );

         await expectRevert(
        ico.release({from: accounts[0]}),
        'ICO must have ended'
        );

        await expectRevert(
        ico.withdraw(accounts[4], 100, {from: accounts[4]}),
        'only admin'
        );

         await expectRevert(
        ico.withdraw(accounts[0], 100, {from: accounts[0]}),
        'ICO must have ended'
        );

         const duration = 100;
         time.increase(duration+10);

        await ico.release();
        
        const finalBalances = await Promise.all(
            investors.map(investor => token.balanceOf(investor))
          );

        for(let i = 0; i < 4; i++) {
          let value = web3.utils.toBN(finalBalances[i].sub(initialBalances[i]));
          let m = ((i+1)*2).toString();
          assert(value.eq(web3.utils.toBN(web3.utils.toWei(m))));
        }

        await expectRevert(
        ico.release({from: accounts[0]}),
        'Tokens must NOT have been released'
        );

        console.log(ico.address);
        balanceContract = web3.utils.toBN(await web3.eth.getBalance(ico.address));
        console.log(balanceContract.toString());
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[5]));
        await ico.withdraw(accounts[5], balanceContract);
        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[5]));
        assert(balanceAfter.sub(balanceBefore).eq(balanceContract));
    });
  });
});
