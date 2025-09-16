/**
 * Testing the chancellery route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 14.09.2025
 **/

const expect                 = require('expect.js');
const api                    = require('../fixtures/apiTest');
const unitTestGame           = require('../fixtures/unitTestGame');
const db                     = require('../../common/lib/ferropolyDb');
const settings               = require('../../main/settings');
const teamAccount            = require('../../main/lib/accounting/teamAccount');
const chancelleryTransaction = require('../../common/models/accounting/chancelleryTransaction');


let gameData = null;
const gameId = 'basic-test';

describe('/chancellery testing', () => {

  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('with a valid user', () => {
    before(async () => {
      const res = await api.login();
      expect(res.status).to.be(200);
      const gcRes = await api.post('/gamecache/refresh');
      expect(gcRes.status).to.be(200);
    })

    after(async () => {
      await api.logout();
    })

    it('should have a balance of 0 at the beginning', async () => {
      const res = await api.get(`/chancellery/balance/${gameId}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.balance).to.be(0);
    })

    it('should also no entries at the beginning', async () => {
      const res = await api.get(`/chancellery/account/statement/${gameId}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.entries.length).to.be(0);
    })


    it('should return an error when getting the balance for an inexisting game', async () => {
      try {
        await api.get(`/chancellery/balance/nogame`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should return an error when getting the entries for an inexisting game', async () => {
      try {
        await api.get(`/chancellery/account/statement/nogame`);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    async function playChancellery() {
      const teamAssetBefore        = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      const chancelleryAssetBefore = await chancelleryTransaction.getBalance(gameId);
      const res                    = await api.post(`/chancellery/play/${gameId}/${gameData.teams[0].uuid}`);
      console.log(res.data);
      expect(res.status).to.be(200);
      expect(res.data.result.amount).to.be.a('number');
      expect(res.data.result.infoText).to.be.a('string');

      const teamAssetAfter        = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      const chancelleryAssetAfter = await chancelleryTransaction.getBalance(gameId);
      console.log(teamAssetBefore, teamAssetAfter);
      console.log(chancelleryAssetBefore, chancelleryAssetAfter);
      if (res.data.result.amount < 0) {
        expect(chancelleryAssetAfter.balance).to.be(chancelleryAssetBefore.balance - res.data.result.amount);
      } else if (res.data.result.jackpot) {
        expect(chancelleryAssetAfter.balance).to.be(0);
      } else {
        expect(chancelleryAssetAfter.balance).to.be(chancelleryAssetBefore.balance);
      }
      expect(teamAssetAfter.asset).to.be(teamAssetBefore.asset + res.data.result.amount);
    }

    it('Should play the chancellery, 1st', playChancellery)
    it('Should play the chancellery, 2nd', playChancellery)
    it('Should play the chancellery, 3rd', playChancellery)
    it('Should play the chancellery, 4th', playChancellery)
    it('Should play the chancellery, 5th', playChancellery)
    it('Should play the chancellery, 6th', playChancellery)
    it('Should play the chancellery, 7th', playChancellery)
    it('Should play the chancellery, 8th', playChancellery)

    it('should return the chancellery balance with the correct amount', async () => {
      const chancelleryAssetBefore = await chancelleryTransaction.getBalance(gameId);
      const res                    = await api.get(`/chancellery/balance/${gameId}`);
      console.log(res.data, chancelleryAssetBefore);
      expect(res.status).to.be(200);
      expect(res.data.balance).to.be(chancelleryAssetBefore.balance);
    })

    async function gamble(gameId, teamId, amount) {
      const teamAssetBefore        = await teamAccount.getBalance(gameId, teamId);
      const chancelleryAssetBefore = await chancelleryTransaction.getBalance(gameId);
      const res                    = await api.post(`/chancellery/gamble/${gameId}/${teamId}`, {amount: amount});
      console.log(res.data);

      const teamAssetAfter        = await teamAccount.getBalance(gameId, teamId);
      const chancelleryAssetAfter = await chancelleryTransaction.getBalance(gameId);
      console.log(teamAssetBefore, teamAssetAfter);
      console.log(chancelleryAssetBefore, chancelleryAssetAfter);
      if (amount < 0) {
        expect(chancelleryAssetAfter.balance).to.be(chancelleryAssetBefore.balance - res.data.result.amount);
      } else if (res.data.result.jackpot) {
        expect(chancelleryAssetAfter.balance).to.be(0);
      } else {
        expect(chancelleryAssetAfter.balance).to.be(chancelleryAssetBefore.balance);
      }
      expect(teamAssetAfter.asset).to.be(teamAssetBefore.asset + res.data.result.amount);
    }

    it('should be possible to win money', async () => {
      await gamble(gameId, gameData.teams[0].uuid, 1000);
    })
    it('should be possible to loose money', async () => {
      await gamble(gameId, gameData.teams[0].uuid, -2000);
    })
    it('should fail to win money with a wrong gameId', async () => {
      try {
        await gamble('nogame', gameData.teams[0].uuid, 1000);
        expect().fail('Request should have failed with 403');

      }
      catch(e)
      {
        console.log(e);
        expect(e.response.status).to.be(403);
      }
    })
    it('should fail to win money with a wrong teamId', async () => {
      try {
        await gamble(gameId, 'bla', 1000);
        expect().fail('Request should have failed with 403');

      }
      catch(e)
      {
        console.log(e);
        expect(e.response.status).to.be(404);
      }
    })


  })

})
