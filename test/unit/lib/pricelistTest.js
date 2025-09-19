/**
 * Testing the pricelist module (which is AN EDITOR MODULE but testing is easier here)
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 19.09.2025
 **/

const expect       = require('expect.js');
const db           = require('../../../common/lib/ferropolyDb');
const settings     = require('../../../main/settings');
const unitTestGame = require('../../fixtures/unitTestGame');
const pricelist    = require('../../../common/lib/pricelist');

const gameId = 'pricelist';

describe('Testing the pricelist module', () => {
  before(async () => {
    await db.init(settings);
    await unitTestGame.createGame(gameId);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  it('should be possible to get the pricelist', async () => {
    const p = await pricelist.getPricelist(gameId);
    for (let i = 0; i < p.length; i++) {
      expect(p[i].pricelist.position).to.be(i);
    }
    console.log(p);
  })
  it('should return an empty pricelist for a non existing game', async () => {
    const p = await pricelist.getPricelist('nada');
    expect(p.length).to.be(0);
    console.log(p);
  })

  it('should be possible to get the pricelist as an array (for Excel)', async () => {
    const p = await pricelist.getArray(gameId);
    for (let i = 2; i < p.data.length - 1; i++) {
      expect(p.data[i][0]).to.be(i - 1);
    }
    console.log(p);
  })

  it('should return data (for Excel) when the gameId is not known, but not crash', async () => {
    const p = await pricelist.getArray('nada');
    expect(p).to.be.an('object');
    expect(p.data.length).to.be(3);
    console.log(p);
  })
})
