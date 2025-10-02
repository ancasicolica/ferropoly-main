/**
 * Tests of the /summary route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 02.10.2025
 **/


const expect        = require('expect.js');
const api           = require('../fixtures/apiTest');
const unitTestGame  = require('../fixtures/unitTestGame');
const db            = require('../../common/lib/ferropolyDb');
const settings      = require('../../main/settings');
const gameplayModel = require('../../common/models/gameplayModel');
const {DateTime}    = require('luxon');

let gameData = null;
const gameId = 'static-test';

describe('Testing the /summary route', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    api.resetClient();
    const gcRes = await api.post('/gamecache/refresh');
    expect(gcRes.status).to.be(200);
    const login = await api.login('demo@ferropoly.ch');
    expect(login.status).to.be(200);

    // Buy a few properties first
    let res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[1].uuid}/${gameData.properties[0].uuid}`);
    expect(res.status).to.be(200);
    res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[1].uuid}/${gameData.properties[2].uuid}`);
    expect(res.status).to.be(200);
    res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[1].uuid}/${gameData.properties[4].uuid}`);
    expect(res.status).to.be(200);

    res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[2].uuid}/${gameData.properties[6].uuid}`);
    expect(res.status).to.be(200);
    res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[3].uuid}/${gameData.properties[8].uuid}`);
    expect(res.status).to.be(200);

    res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[4].uuid}/${gameData.properties[10].uuid}`);
    expect(res.status).to.be(200);
    await api.get(`/marketplace/payRents/${gameId}`);
    expect(res.status).to.be(200);
    await api.get(`/marketplace/payRents/${gameId}`);
    expect(res.status).to.be(200);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Testing while game is running, without login', () => {
    before(async () => {
      await api.logout();
    })

    it('should fail with a 403 because the game is running', async () => {
      try {
        await api.get(`/summary/${gameId}/static`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should fail with a 404 when the gameId is wrong ', async () => {
      try {
        await api.get(`/summary/none/static`);
        expect().fail('Request should have failed with 404');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(404);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

  })

  describe('After the game', () => {
    before(async () => {
      const gp = await gameplayModel.getGameplay(gameId, 'demo@ferropoly.ch');
      gp.scheduling.gameEnd =  DateTime.now().minus({minutes: 10}).toJSDate();
      gp.scheduling.gameEndTs =  DateTime.now().minus({minutes: 10}).toJSDate();
      await gp.save();
      await api.post('/gamecache/refresh');
    })

    it('should work', async () => {
      const res = await api.get(`/summary/${gameId}/static`);
      console.log('done', res.data);
      const data = res.data;
      expect(data.gameplay._id).to.be(gameId);
      expect(data.teams.length).to.be(6);
      expect(data.teams[0].uuid).to.be(gameData.teams[0].uuid);
      expect(data.currentGameId).to.be(gameId);
      expect(data.mapApiKey.length > 10).to.be(true);
      expect(data.properties.length).to.be(40);
      expect(data.ranking.length).to.be(6);
      expect(data.accountStatement.accountData).to.be.an('array');
      expect(data.travelLog).to.be.an('array');
      expect(data.travelLog.length).to.be(6);
      expect(data.chancellery).to.be.an('array');
      expect(data.picBucket).to.be.an('array');

    })
  })


});
