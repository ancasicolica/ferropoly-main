/**
 * Basic API Tests, just a poc basically
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 13.09.2025
 **/

const expect       = require('expect.js');
const api          = require('../fixtures/apiTest');
const unitTestGame = require('../fixtures/unitTestGame');
const db           = require('../../common/lib/ferropolyDb');
const settings     = require('../../main/settings');

let gameData = null;
const gameId = 'basic-test';

describe('/gameplays testing', () => {

  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  it('should get at least one game', async () => {
    const result = await api.login();
    expect(result.status).to.be(200);
    const resp = await api.get(`/gameplays`);
    console.log(resp.data);
    expect(resp.data.gameplays.length).to.be.greaterThan(0);
  })

  it('should get at least one game as a player', async () => {
    const result = await api.login('team10@ferropoly.ch');
    expect(result.status).to.be(200);
    const resp = await api.get(`/gameplays`);
    console.log(resp.data);
    expect(resp.status).to.be(200);
    expect(resp.data.games.length).to.be.greaterThan(0);
  })

  it('should return an error with a wrong user', async () => {
    const result = await api.logout();
    expect(result.status).to.be(200);
    try {
      await api.get(`/gameplays`);
      expect().fail('Request should have failed with 401');
    } catch (err) {
      // Axios liefert den Status hier
      expect(err.response && err.response.status).to.be(401);
      expect(err.response.data).to.have.key('message');
      console.log(err.response.data.message);
    }
  })
})
