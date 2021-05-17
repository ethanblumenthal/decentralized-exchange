const Dex = artifacts.require('Dex');
const Link = artifacts.require('Link');
const truffleAssert = require('truffle-assertions');

contract('Dex', (accounts) => {
  const LINK = web3.utils.fromUtf8('LINK');

  // The user must have ETH deposited such that deposited ETH >= buy order value
  it('should throw an error if ETH balance is too low when creating BUY limit order', async () => {
    let dex = await Dex.deployed();

    await truffleAssert.reverts(dex.createLimitOrder(0, LINK, 10, 1));

    dex.depositEth({ value: 10 });
    await truffleAssert.passes(dex.createLimitOrder(0, LINK, 10, 1));
  });

  // The user must have enough tokens deposited such that token balance >= sell order amount
  it('should throw an error if token balance is too low when creating SELL limit order', async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();

    await truffleAssert.reverts(dex.createLimitOrder(1, LINK, 10, 1));

    await link.approve(dex.address, 500);
    await dex.addToken(LINK, link.address, {
      from: accounts[0],
    });

    await dex.deposit(10, LINK);
    await truffleAssert.passes(dex.createLimitOrder(1, LINK, 10, 1));
  });

  // The BUY order book should be ordered on price from highest to lowest starting at index 0
  it('The BUY order book should be ordered on price from highest to lowest starting at index 0', async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();

    await link.approve(dex.address, 500);
    await dex.depositEth({ value: 3000 });
    await dex.createLimitOrder(0, LINK, 1, 300);
    await dex.createLimitOrder(0, LINK, 1, 100);
    await dex.createLimitOrder(0, LINK, 1, 200);

    let orderbook = await dex.getOrderBook(LINK, 0);
    assert(orderbook.length > 0);

    for (let i = 0; i < orderbook.length - 1; i++) {
      assert(
        orderbook[i].price >= orderbook[i + 1].price,
        'not right order in BUY book',
      );
    }
  });

  // The SELL order book should be ordered on price from lowest to highest starting at index 0
  it('The SELL order book should be ordered on price from lowest to highest starting at index 0', async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();

    await link.approve(dex.address, 500);
    await dex.createLimitOrder(1, LINK, 1, 300);
    await dex.createLimitOrder(1, LINK, 1, 100);
    await dex.createLimitOrder(1, LINK, 1, 200);

    let orderbook = await dex.getOrderBook(LINK, 1);
    assert(orderbook.length > 0);

    for (let i = 0; i < orderbook.length - 1; i++) {
      assert(
        orderbook[i].price <= orderbook[i + 1].price,
        'not right order in SELL book',
      );
    }
  });
});
