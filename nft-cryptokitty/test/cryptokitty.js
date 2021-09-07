const { expectRevert } = require('@openzeppelin/test-helpers');
const Game = artifacts.require('Cryptokitty.sol');


contract('Game', accounts => {
  let game;
  const [admin, player1] = [accounts[0], accounts[1]];

  beforeEach(async () => {
    game = await Game.new('https://url-to-your-game-server');
  });

  it('should NOT mint if not admin', async () => {
    await expectRevert(
        game.mint({from: player1}),
        'only admin'
      );
  });

  it('should mint if admin', async () => {
    await game.mint();
    const kitty = await game.kitties(0);
    assert(kitty.id.toNumber() === 0);
    assert(kitty.generation.toNumber() === 1);
  });

  it('should breed', async () => {

    await game.mint();

    await expectRevert(
      game.breed(0, 1), 
      'The 2 kitties must exist'
      );

    await game.mint();
    await game.mint();
    await game.mint();
    await game.mint();

    await expectRevert(
      game.breed(0, 1, {from: player1}), 
      'msg.sender must own the 2 kitties'
      );

    await game.transferFrom(admin, player1, 1);

    await expectRevert(
      game.breed(1, 3, {from: player1}), 
      'msg.sender must own the 2 kitties'
      );

    await game.transferFrom(admin, player1, 3);
    const Id = await game.nextId();
    await game.breed(1, 3, {from: player1});
    const kitty = await game.kitties(Id);
    assert(kitty.generation.toNumber() === 2);
    console.log(kitty.id.toNumber());
    console.log(kitty.generation.toNumber());
    console.log(kitty.geneA.toNumber());
    console.log(kitty.geneB.toNumber());
  });

  it.only('shoudl return kitties of owner', async () => {

    await game.mint();
    await game.mint();
    await game.mint();
    await game.mint();

    await game.transferFrom(admin, player1, 2);
    const kitties = await game.getAllKittiesOf(admin);
    console.log(kitties);
  });
});
