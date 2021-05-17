const Dex = artifacts.require('Dex');
const Link = artifacts.require('Link');
const truffleAssert = require('truffle-assertions');

contract.skip('Dex', (accounts) => {
  const LINK = web3.utils.fromUtf8('LINK');
  const AAVE = web3.utils.fromUtf8('AAVE');

  it('should only be possible for owner to add tokens', async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();

    await truffleAssert.passes(
      dex.addToken(LINK, link.address, {
        from: accounts[0],
      }),
    );

    await truffleAssert.reverts(
      dex.addToken(AAVE, link.address, {
        from: accounts[1],
      }),
    );
  });

  it('should handle deposits correctly', async () => {
    let dex = await Dex.deployed();
    let link = await Link.deployed();

    await link.approve(dex.address, 500);
    await dex.deposit(100, LINK);

    let balance = await dex.balances(accounts[0], LINK);
    assert.equal(balance.toNumber(), 100);
  });

  it('should handle faulty withdrawls correctly', async () => {
    let dex = await Dex.deployed();
    await truffleAssert.reverts(dex.withdraw(500, LINK));
  });

  it('should handle correct withdrawls correctly', async () => {
    let dex = await Dex.deployed();
    await truffleAssert.passes(dex.withdraw(100, LINK));
  });
});
