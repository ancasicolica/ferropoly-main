/**
 * Test for the /travellog route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.10.2025
 **/

const expect       = require('expect.js');
const api          = require('../fixtures/apiTest');
const unitTestGame = require('../fixtures/unitTestGame');
const db           = require('../../common/lib/ferropolyDb');
const settings     = require('../../main/settings');

let gameData = null;
const gameId = 'properties-test';

describe('Testing the /travellog route', () => {
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
    res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[2].uuid}/${gameData.properties[8].uuid}`);
    expect(res.status).to.be(200);

    res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[3].uuid}/${gameData.properties[10].uuid}`);
    expect(res.status).to.be(200);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Testing the travellog API as user "team 1"', () => {
    before(async () => {
      const res = await api.login('team1@ferropoly.ch');
      expect(res.status).to.be(200);
    })

    after(async () => {
      await api.logout();
    })

    it('should return the properties for team 1', async () => {
      const res = await api.get(`/travellog/${gameId}/${gameData.teams[1].uuid}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.length).to.be(3);
    })

    it('should not be possible to get the travellog of team 2', async () => {
      try {
        await api.get(`/travellog/${gameId}/${gameData.teams[2].uuid}`);
        expect().fail('Request should have failed with 401');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })
    it('should not be possible to get the complete travellog', async () => {
      try {
        await api.get(`/travellog/${gameId}`);
        expect().fail('Request should have failed with 401');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

  })

  describe('Testing the travellog API as admin', () => {
    before(async () => {
      const res = await api.login('demo@ferropoly.ch');
      expect(res.status).to.be(200);
    })

    after(async () => {
      await api.logout();
    })

    it('should return the travellog for team 1', async () => {
      const res = await api.get(`/travellog/${gameId}/${gameData.teams[1].uuid}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.length).to.be(3);
    })

    it('should return the travellog for all teams', async () => {
      const res = await api.get(`/travellog/${gameId}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.length).to.be(6);
    })

    it('should not be possible to get the travellog for an not existing game', async () => {
      try {
        await api.get(`/travellog/ddd`);
        expect().fail('Request should have failed with 401');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

  })
});
