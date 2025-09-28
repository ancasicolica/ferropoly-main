/**
 * testing the /static route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.09.2025
 **/


const expect         = require('expect.js');
const api            = require('../fixtures/apiTest');
const unitTestGame   = require('../fixtures/unitTestGame');
const db             = require('../../common/lib/ferropolyDb');
const settings       = require('../../main/settings');

let gameData = null;
const gameId = 'static-test';

describe('Testing the /static route', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    api.resetClient();
    const gcRes = await api.post('/gamecache/refresh');
    expect(gcRes.status).to.be(200);
    const login = await api.login('demo@ferropoly.ch');
    expect(login.status).to.be(200);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })




    it('should return the data for the game', async ()=> {
      const res = await api.get(`/static/${gameId}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.authToken).to.be.a('string');
      expect(res.data.user).to.be.a('string');
      expect(res.data.socketUrl).to.be.a('string');
      expect(res.data.gameplay.internal.gameId).to.be(gameId);
      expect(res.data.pricelist.length).to.be(40);
      expect(res.data.teams.length).to.be(6);
      expect(res.data.mapApiKey.length > 10).to.be(true);
    })

    it('should not be possible to get the static data of a non existing game', async ()=> {
      try {
        await api.get(`/static/nada`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(404);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

});
