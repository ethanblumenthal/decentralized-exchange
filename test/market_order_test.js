const Dex = artifacts.require('Dex');
const Link = artifacts.require('Link');
const truffleAssert = require('truffle-assertions');

contract('Dex', (accounts) => {
  // When creating a SELL market order, the seller needs to have enough tokens for the trade
  it('Should throw an error when creating a sell market order without adequate token balance', async () => {});

  // Market orders can be submitted even if the order book is empty
  it('Market orders can be submitted even if the order book is empty', async () => {});

  // Market orders should be filled until the order book is empty or the market order is 100% filled
  it('Market orders should not fill more limit orders than the market order amount', async () => {});

  // Market orders should be filled until the order book is empty or the market order is 100% filled
  it('Market orders should be filled until the order book is empty', async () => {});

  // The ETH balance of the buyer should decrease with the filled amount
  it('The ETH balance of the buyer should decrease with the filled amount', async () => {});

  // The token balances of the limit order sellers should decrease with the filled amounts.
  it('The token balances of the limit order sellers should decrease with the filled amounts.', async () => {});

  // Filled limit orders should be removed from the orderbook
  it('Filled limit orders should be removed from the orderbook', async () => {});

  // Partly filled limit orders should be modified to represent the filled/remaining amount
  it('Limit orders filled property should be set correctly after a trade', async () => {});

  // When creating a BUY market order, the buyer needs to have enough ETH for the trade
  it('Should throw an error when creating a buy market order without adequate ETH balance', async () => {});
});
