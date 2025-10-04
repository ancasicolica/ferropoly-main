/**
 * testing the /teamAccount route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.10.2025
 **/



const expect        = require('expect.js');
const api           = require('../fixtures/apiTest');
const unitTestGame  = require('../fixtures/unitTestGame');
const db            = require('../../common/lib/ferropolyDb');
const settings      = require('../../main/settings');

let gameData = null;
const gameId = 'static-test';

describe('Testing the /teamAccount route', () => {
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

  describe('using the route as ADMIN', ()=> {
    before(async ()=> {
      const login = await api.login('demo@ferropoly.ch');
      expect(login.status).to.be(200);
    })
    after(async ()=> {
      await api.logout();
    })

    it('should return the account data for team 1', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/${gameData.teams[1].uuid}`);
      expect(res.status).to.be(200);
      for(a of res.data.accountData) {
        expect(a.teamId).to.be(gameData.teams[1].uuid);
      }
      expect(res.data.accountData.length).to.be(8);
      console.log(res.data);
    })

    it('should return all the account data for team 1 using extreme dates', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/${gameData.teams[1].uuid}/2020-01-01/2050-12-31`);
      expect(res.status).to.be(200);
      for(a of res.data.accountData) {
        expect(a.teamId).to.be(gameData.teams[1].uuid);
      }
      expect(res.data.accountData.length).to.be(8);
      console.log(res.data);
    })

    it('should return all the account data for team 1 using only start', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/${gameData.teams[1].uuid}/2020-01-01`);
      expect(res.status).to.be(200);
      for(a of res.data.accountData) {
        expect(a.teamId).to.be(gameData.teams[1].uuid);
      }
      expect(res.data.accountData.length).to.be(8);
      console.log(res.data);
    })

    it('should return empty account data for team 1 using dates in past', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/${gameData.teams[1].uuid}/2020-01-01/2024-12-31`);
      expect(res.status).to.be(200);
      for(a of res.data.accountData) {
        expect(a.teamId).to.be(gameData.teams[1].uuid);
      }
      expect(res.data.accountData.length).to.be(0);
      console.log(res.data);
    })

    it('should return empty account data for team 1 using dates in future', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/${gameData.teams[1].uuid}/2050-01-01/2060-12-31`);
      expect(res.status).to.be(200);
      for(a of res.data.accountData) {
        expect(a.teamId).to.be(gameData.teams[1].uuid);
      }
      expect(res.data.accountData.length).to.be(0);
      console.log(res.data);
    })

    it('should return empty account data for team 1 using start in future', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/${gameData.teams[1].uuid}/2050-01-01`);
      expect(res.status).to.be(200);
      for(a of res.data.accountData) {
        expect(a.teamId).to.be(gameData.teams[1].uuid);
      }
      expect(res.data.accountData.length).to.be(0);
      console.log(res.data);
    })



    it('should return the account data for all teams', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/all`);
      expect(res.status).to.be(200);
      expect(res.data.accountData.length).to.be(27);
      console.log(res.data);
    })

    it('should return the account data for team 1', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/cf}`);
      expect(res.status).to.be(200);
      console.log(res.data);
      expect(res.data.accountData.length).to.be(0);

    })

    it('should fail with a 401 with an invalid gameId,', async () => {
      try {
        await api.get(`/teamAccount/get/dd/sss`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

  })

  describe('using the route as TEAM', ()=> {
    before(async ()=> {
      const login = await api.login('team1@ferropoly.ch');
      expect(login.status).to.be(200);
    })
    after(async ()=> {
      await api.logout();
    })

    it('should return the account data for team 1', async()=> {
      const res = await api.get(`/teamAccount/get/${gameId}/${gameData.teams[1].uuid}`);
      expect(res.status).to.be(200);
      for(a of res.data.accountData) {
        expect(a.teamId).to.be(gameData.teams[1].uuid);
      }
      expect(res.data.accountData.length).to.be(8);
      console.log(res.data);
    })
    it('should fail with a 401 when trying to get the data for another team', async () => {
      try {
        await api.get(`/teamAccount/get/${gameId}/${gameData.teams[2].uuid}`);
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
