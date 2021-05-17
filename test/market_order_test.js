const Dex = artifacts.require('Dex');
const Link = artifacts.require('Link');
const truffleAssert = require('truffle-assertions');

contract('Dex', (accounts) => {
  const LINK = web3.utils.fromUtf8('LINK');
  const ETH = web3.utils.fromUtf8('ETH');

  // When creating a SELL market order, the seller needs to have enough tokens for the trade
  it('Should throw an error when creating a SELL market order without adequate token balance', async () => {
    let dex = await Dex.deployed();

    let balance = await dex.balances(accounts[0], LINK);
    assert.equal(balance.toNumber(), 0, 'Initial LINK balance is not 0');

    await truffleAssert.reverts(dex.createMarketOrder(1, LINK, 10));
  });

  // When creating a BUY market order, the buyer needs to have enough ETH for the trade
  it('Should throw an error when creating a BUY market order without adequate ETH balance', async () => {
    let dex = await Dex.deployed();

    let balance = await dex.balances(accounts[0], web3.utils.fromUtf8('ETH'));
    assert.equal(balance.toNumber(), 0, 'Initial ETH balance is not 0');

    await truffleAssert.reverts(dex.createMarketOrder(0, LINK, 10));
  });

  // Market orders can be submitted even if the order book is empty
  it('Market orders can be submitted even if the order book is empty', async () => {
    let dex = await Dex.deployed();

    await dex.depositEth({ value: 10000 });

    let orderbook = await dex.getOrderBook(web3.utils.fromUtf8('ETH'), 0);
    assert(
      orderbook.length == 0,
      'BUY side orderbook should be empty at start of test',
    );

    await truffleAssert.passes(dex.createMarketOrder(0, LINK, 10));
  });

  // Market orders should be filled until the order book is empty or the market order is 100% filled
  it('Market orders should not fill more limit orders than the market order amount', async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();

    let orderbook = await dex.getOrderBook(LINK, 1);
    assert(
      orderbook.length == 0,
      'SELL side orderbook should be empty at start of test',
    );

    await dex.addToken(LINK, link.address);

    // Send LINK tokens to accounts 1, 2, 3 from account 0
    await link.transfer(accounts[1], 50);
    await link.transfer(accounts[2], 50);
    await link.transfer(accounts[3], 50);

    // Approve DEX for accounts 1, 2, 3
    await link.approve(dex.address, 50, { from: accounts[1] });
    await link.approve(dex.address, 50, { from: accounts[2] });
    await link.approve(dex.address, 50, { from: accounts[3] });

    // Deposit LINK into DEX for accounts 1, 2, 3
    await dex.deposit(50, LINK, { from: accounts[1] });
    await dex.deposit(50, LINK, { from: accounts[2] });
    await dex.deposit(50, LINK, { from: accounts[3] });

    // Fill up the SELL orderbook
    await dex.createLimitOrder(1, LINK, 5, 300, {
      from: accounts[1],
    });
    await dex.createLimitOrder(1, LINK, 5, 400, {
      from: accounts[2],
    });
    await dex.createLimitOrder(1, LINK, 5, 500, {
      from: accounts[3],
    });

    // Create market order that should fill 2/3 orders in the book
    await dex.createMarketOrder(0, LINK, 10);

    orderbook = await dex.getOrderBook(LINK, 1);
    assert(
      orderbook.length == 1,
      'SELL side orderbook should only have 1 order left',
    );
    assert(
      orderbook[0].filled == 0,
      'SELL side orderbook should have 0 filled',
    );
  });

  // Market orders should be filled until the order book is empty or the market order is 100% filled
  it('Market orders should be filled until the order book is empty', async () => {
    let dex = await Dex.deployed();

    let orderbook = await dex.getOrderBook(LINK, 1);
    assert(
      orderbook.length == 1,
      'SELL side orderbook should have 1 order left',
    );

    // Fill up the SELL order book again
    await dex.createLimitOrder(1, LINK, 5, 400, { from: accoutns[1] });
    await dex.createLimitOrder(1, LINK, 5, 500, { from: accoutns[2] });

    // Check buyer LINK balance before and after trade
    let balanceBefore = await dex.balances(accounts[0], LINK);
    await dex.createMarketOrder(0, LINK, 50);
    let balanceAfter = await dex.balances(accounts[0], LINK);

    assert.equal(balanceBefore + 15, balanceAfter);
  });

  // The ETH balance of the buyer should decrease with the filled amount
  it('The ETH balance of the buyer should decrease with the filled amount', async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();

    // Seller deposits LINK and creates a SELL limit order for 1 LINK for 300 WEI
    await link.approve(dex.address, 500, { from: accounts[1] });
    await dex.createLimitOrder(1, LINK, 1, 300, { from: accounts[1] });

    // Check buyer ETH balance before and after trade
    let balanceBefore = await dex.balances(accounts[0], ETH);
    await dex.createMarketOrder(0, LINK, 1);
    let balanceAfter = await dex.balances(accounts[0], ETH);

    asert.equal(balanceBefore - 300, balanceAfter);
  });

  // The token balances of the limit order sellers should decrease with the filled amounts.
  it('The token balances of the limit order sellers should decrease with the filled amounts.', async () => {});

  // Filled limit orders should be removed from the orderbook
  it('Filled limit orders should be removed from the orderbook', async () => {});

  // Partly filled limit orders should be modified to represent the filled/remaining amount
  it('Limit orders filled property should be set correctly after a trade', async () => {});
});
