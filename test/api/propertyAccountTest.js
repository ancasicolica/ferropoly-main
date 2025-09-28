/**
 * This is a test for the property account route
 * IMPORTANT: as the property account is already tested intensely in the unit test, we focus on API issues
 * only, neither creating a complex gameplay nor checking the values of the accounting. It's the API that
 * matters.
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.09.2025
 **/

const expect         = require('expect.js');
const api            = require('../fixtures/apiTest');
const unitTestGame   = require('../fixtures/unitTestGame');
const db             = require('../../common/lib/ferropolyDb');
const settings       = require('../../main/settings');

let gameData = null;
const gameId = 'properties-test';

describe('Testing the /propertyAccount route', () => {
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

    res = await api.get(`/marketplace/payRents/${gameId}`);
    expect(res.data.status).to.be('ok');
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Testing the properties API as admin', () => {
    before(async () => {
      const res = await api.login('demo@ferropoly.ch');
      expect(res.status).to.be(200);
    })

    after(async () => {
      await api.logout();
    })

    it('should return the rent register for team 1', async ()=> {
      const res = await api.get(`/propertyAccount/getRentRegister/${gameId}/${gameData.teams[1].uuid}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.register.length).to.be(3);
      expect(res.data.totalAmount).to.be(600);
      expect(res.data.teamId).to.be(gameData.teams[1].uuid);
    })

    it('should not be possible to get register for a nonexisting game', async ()=> {
      try {
        await api.get(`/propertyAccount/getRentRegister/nafa/${gameData.teams[2].uuid}`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should not be possible to get the register for a nonexisting team', async ()=> {
      try {
        const info = await api.get(`/propertyAccount/getRentRegister/${gameId}/aaa`);
        console.log(info);
        expect().fail('Request should have failed with 400');
      }
      catch (err) {
        console.log(err);
        expect(err.response && err.response.status).to.be(400);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should return the account statement for a property with entries', async ()=> {
      const res = await api.get(`/propertyAccount/getAccountStatement/${gameId}/${gameData.properties[0].uuid}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.register.length).to.be(2);
    })

    it('should return an empty account statement for a property without entries', async ()=> {
      const res = await api.get(`/propertyAccount/getAccountStatement/${gameId}/${gameData.properties[20].uuid}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.register.length).to.be(0);
    })
    it('should return an empty account statement for a not existing property', async ()=> {
      const res = await api.get(`/propertyAccount/getAccountStatement/${gameId}/dddd}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.register.length).to.be(0);
    })

    it('should not be possible to get account statement for a nonexisting game', async ()=> {
      try {
        await api.get(`/propertyAccount/getAccountStatement/ddds/dddd}`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should return the account statement for a game', async ()=> {
      const res = await api.get(`/propertyAccount/getAccountStatement/${gameId}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.register.length).to.be(12);
    })

    it('should return the profitability for a game', async ()=> {
      const res = await api.get(`/propertyAccount/propertyProfitability/${gameId}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.info.length).to.be(6);
    })

    it('should send a 403 if the game does not exist', async ()=> {
      try {
        await api.get(`/propertyAccount/propertyProfitability/ff`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should return the profitability for the props of a team', async ()=> {
      const res = await api.get(`/propertyAccount/propertyProfitability/${gameId}/${gameData.teams[1].uuid}`);
      console.log(res.data.info);
      expect(res.status).to.be(200);
      expect(res.data.info.length).to.be(3);
      expect(res.data.info[0].propertyId).to.be.a('string');
    })

    it('should return the profitability for the props of a team, even there are none', async ()=> {
      const res = await api.get(`/propertyAccount/propertyProfitability/${gameId}/${gameData.teams[4].uuid}`);
      console.log(res.data.info);
      expect(res.status).to.be(200);
      expect(res.data.info.length).to.be(0);
    })

    it('should return the profitability for the props of a team, even the team des not exist', async ()=> {
      const res = await api.get(`/propertyAccount/propertyProfitability/${gameId}/none`);
      console.log(res.data.info);
      expect(res.status).to.be(200);
      expect(res.data.info.length).to.be(0);
    })

    it('should send a 403 if the game does not exist', async ()=> {
      try {
        await api.get(`/propertyAccount/propertyProfitability/ff/none`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })
  })

  describe('Testing the properties API as user "team 1"', () => {
    before(async () => {
      const res = await api.login('team1@ferropoly.ch');
      expect(res.status).to.be(200);

    })

    after(async () => {
      await api.logout();
    })

    it('should not return the rent register for team 1, even its ours', async ()=> {
          try {
        await api.get(`/propertyAccount/getRentRegister/${gameId}/${gameData.teams[1].uuid}`);

        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should not be possible to get register for a nonexisting game', async ()=> {
      try {
        await api.get(`/propertyAccount/getRentRegister/nafa/${gameData.teams[2].uuid}`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should not be possible to get the register for a nonexisting team', async ()=> {
      try {
        const info = await api.get(`/propertyAccount/getRentRegister/${gameId}/aaa`);
        console.log(info);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        console.log(err);
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should not be possible to get account statement', async ()=> {
      try {
        await api.get(`/propertyAccount/getAccountStatement/${gameId}/dddd}`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })


    it('should send a 403 if the game does not exist', async ()=> {
      try {
        await api.get(`/propertyAccount/propertyProfitability/ff`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should send a 403 if the game does not exist', async ()=> {
      try {
        await api.get(`/propertyAccount/propertyProfitability/ff/none`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })
  })
});
