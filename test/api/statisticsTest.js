/**
 * testing the /statistics API
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 01.10.2025
 **/


const expect         = require('expect.js');
const api            = require('../fixtures/apiTest');
const unitTestGame   = require('../fixtures/unitTestGame');
const db             = require('../../common/lib/ferropolyDb');
const settings       = require('../../main/settings');

let gameData = null;
const gameId = 'static-test';

describe('Testing the /statistics route', () => {
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

  describe('Testing as an administrator', ()=> {
    before(async ()=> {
      const login = await api.login('demo@ferropoly.ch');
      expect(login.status).to.be(200);
    })
    after(async ()=> {
      await api.logout();
    })

    it('should return the ranking list for the game', async ()=> {
      const res = await api.get(`/statistics/rankinglist/${gameId}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.ranking).to.be.a('array');
      expect(res.data.ranking.length).to.be(6);
    })

    it('should not be possible to get ranking list for a non existing game', async ()=> {
      try {
        await api.get(`/statistics/rankinglist/nada`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })


    it('should return the income for all teams', async ()=> {
      const res = await api.get(`/statistics/income/${gameId}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.info).to.be.a('array');
      expect(res.data.info.length).to.be(6);
      expect(res.data.info[0].register.length).to.be(0);
      expect(res.data.info[1].register.length).to.be(3);
      expect(res.data.info[1].totalAmount).to.be(600);
      expect(res.data.info[1].teamId).to.be(gameData.teams[1].uuid);
    })

    it('should not be possible to get the income for a non existing game', async ()=> {
      try {
        await api.get(`/statistics/income/nada`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })


    it('should return the income for a single team', async ()=> {
      const res = await api.get(`/statistics/income/${gameId}/${gameData.teams[1].uuid}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.info.register.length).to.be(3);
      expect(res.data.info.totalAmount).to.be(600);
      expect(res.data.info.teamId).to.be(gameData.teams[1].uuid);
    })

    it('should not be possible to get the income for a non existing game for a team', async ()=> {
      try {
        await api.get(`/statistics/income/nada/${gameData.teams[1].uuid}`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should not be possible to get the income for a non existing team', async ()=> {
      try {
        await api.get(`/statistics/income/${gameId}/ff`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(404);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })
  })


  describe('Testing as an uawe', ()=> {
    before(async ()=> {
      const login = await api.login('team1@ferropoly.ch');
      expect(login.status).to.be(200);
    })
    after(async ()=> {
      await api.logout();
    })


    it('should not be possible to get ranking list as a user', async ()=> {
      try {
        await api.get(`/statistics/rankinglist/${gameId}`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })


    it('should not be possible to get the income as auser', async ()=> {
      try {
        await api.get(`/statistics/income/${gameId}`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })


    it('should return the income for a MY team', async ()=> {
      const res = await api.get(`/statistics/income/${gameId}/${gameData.teams[1].uuid}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.info.register.length).to.be(3);
      expect(res.data.info.totalAmount).to.be(600);
      expect(res.data.info.teamId).to.be(gameData.teams[1].uuid);
    })

    it('should not be possible to get the income for another team', async ()=> {
      try {
        await api.get(`/statistics/income/nada/${gameData.teams[2].uuid}`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should not be possible to get the income for a non existing game for a team', async ()=> {
      try {
        await api.get(`/statistics/income/nada/${gameData.teams[1].uuid}`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should not be possible to get the income for a non existing team', async ()=> {
      try {
        await api.get(`/statistics/income/${gameId}/ff`);
        expect().fail('Request should have failed with 500');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })
  })



});
