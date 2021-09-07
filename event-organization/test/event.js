const { expectRevert, time } = require('@openzeppelin/test-helpers');
const EventContract = artifacts.require('EventContract.sol');

contract('EventContract', (accounts) => {
  let eventContract = null;
  before(async () => {
    eventContract = await EventContract.new();
  });

  it('Should NOT create an event if date if before now', async () => {
    const date = (await time.latest()).sub(time.duration.seconds(10));  
    await expectRevert(
      eventContract.createEvent('event1', date, 5, 10),
      'can only organize event at a future date'
    );
  });

  it('Should NOT create an event if less than 1 ticket', async () => {
    const date = (await time.latest()).add(time.duration.seconds(1000));  
    await expectRevert(
      eventContract.createEvent('event1', date, 5, 0),
      'can only organize event with at least 1 ticket'
    );
  });

  it('Should create an event', async () => {
    const date = (await time.latest()).add(time.duration.seconds(1000));  
    await eventContract.createEvent('event1', date, 5, 10);
    const event = await eventContract.events(0);
    assert(event.id.toNumber() === 0);
    assert(event.name === 'event1');
    assert(event.date.toNumber() === date.toNumber());
    assert(event.price.toNumber() === 5);
    assert(event.ticketCount.toNumber()  === 10);

  });

  it('Should NOT buy a ticket if event does not exist', async () => {
    await expectRevert(
      eventContract.buyTicket(1,1),
      'this event does not exist'
    );
  });

  context('event created', () => {
    beforeEach(async () => {
      const date = (await time.latest()).add(time.duration.seconds(1000));  
      await eventContract.createEvent('event1', date, 5, 6);
    });

    it('Should NOT buy a ticket if wrong amount of ether sent', async () => {
      await expectRevert(
      eventContract.buyTicket(1,2, {value: 1}),
      'ether sent must be equal to total ticket cost'
    );
    });

    it('Should NOT buy a ticket if not enough ticket left', async () => {
       await expectRevert(
        eventContract.buyTicket(1, 7, {value: 35}),
        'not enough ticket left'
      );
    });

    it('Should buy tickets', async () => {
      await eventContract.buyTicket(1, 2, {from: accounts[0], value: 10});
      await eventContract.buyTicket(1, 3, {from: accounts[1], value: 15});
      const ticketCount1 = await eventContract.tickets.call(accounts[0], 1);
      const ticketCount2 = await eventContract.tickets.call(accounts[1], 1);
      assert(ticketCount1.toNumber() == 2);
      assert(ticketCount2.toNumber() == 3);
    });

    it('Should NOT transfer ticket it not enough tickets', async () => {
      await expectRevert(
        eventContract.transferTicket(1, 4, accounts[0], {from: accounts[1]}),
        'not enough ticket'
      );
    });

    it('Should transfer ticket', async () => {
      await eventContract.transferTicket(1, 2, accounts[0], {from: accounts[1]});
      const ticketCount1 = await eventContract.tickets.call(accounts[0], 1);
      const ticketCount2 = await eventContract.tickets.call(accounts[1], 1);
      assert(ticketCount1.toNumber() == 4);
      assert(ticketCount2.toNumber() == 1);
    });

    it('Should NOT buy a ticket if event has expired', async () => {
      time.increase(1001);
      await expectRevert(
        eventContract.buyTicket(1, 1),
        'event has expired'
      );

    });
  });
});
