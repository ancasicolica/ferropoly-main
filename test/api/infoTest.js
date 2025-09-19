/**
 * Testing the /info route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 19.09.2025
 **/
const expect       = require('expect.js');
const api          = require('../fixtures/apiTest');
const unitTestGame = require('../fixtures/unitTestGame');
const db           = require('../../common/lib/ferropolyDb');
const settings     = require('../../main/settings');

let gameData = null;
const gameId = 'basic-test';

describe('Testing the /info route', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    api.resetClient();
    // No Login required!
    await api.logout();
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Reading out the game data', () => {
    it('should return the game data', async () => {
      const res = await api.get(`/info/data/${gameId}`);
      console.log(res.data);
      expect(res.data.gameplay).to.be.an('object');
      expect(res.data.teams).to.be.an('array');
      expect(res.data.teams.length).to.be(6);
      expect(res.data.pricelist).to.be.an('array');
      expect(res.data.pricelist.length).to.be(40);
    })

    it('should return a 500 for a game not found', async () => {
      try {
        await api.get(`/info/data/nada`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(500);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })
  })
});
