/**
 * Testing the /storno route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 14.12.2025
 **/
const expect       = require('expect.js');
const api          = require('../fixtures/apiTest');
const unitTestGame = require('../fixtures/unitTestGame');
const db           = require('../../common/lib/ferropolyDb');
const settings     = require('../../main/settings');
const teamAccount  = require('../../main/lib/accounting/teamAccount');

let gameData = null;
const gameId = 'basic-test';

describe('Testing the /storno route', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    api.resetClient();
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })


  describe('Testing the storno API', () => {

    before(async () => {
      const res = await api.login();
      expect(res.status).to.be(200);
      const gcRes = await api.post('/gamecache/refresh');
      expect(gcRes.status).to.be(200);
    })

    after(async () => {
      await api.logout();
    })

    it('should buy a property for team A and revert it immediately', async () => {
      const teamAId       = gameData.teams[1].uuid;
      const propertyId    = gameData.properties[0].uuid;
      const balanceBefore = await teamAccount.getBalance(gameId, teamAId);

      let res = await api.post(`/marketplace/buyProperty/${gameId}/${teamAId}/${propertyId}`);
      console.log(res.data);
      expect(res.data.result.amount).to.be(1000);
      expect(res.data.result.property.uuid).to.be(gameData.properties[0].uuid);

      // buying a property
      const balance2 = await teamAccount.getBalance(gameId, teamAId);
      expect(balance2.asset - balanceBefore.asset).to.be(-1000)

      res = await api.post(`/storno/${gameId}/${propertyId}`, {reason: 'unit test'});
      console.log(res.data);
      expect(res.data.transactionNb).to.be(1);

      // Same as at the start
      const balance3 = await teamAccount.getBalance(gameId, teamAId);
      expect(balance3.asset - balanceBefore.asset).to.be(0)
    })

    /**
     * Executes a storno (reversal) round involving two teams and a property. The method encompasses
     * property purchases, rent payments, house building, reversal of property transactions, and account balance checks.
     *
     * @param {string} teamAId - The identifier for Team A.
     * @param {string} propertyId - The identifier of the property involved in the transaction.
     * @param {string} teamBId - The identifier for Team B.
     * @return {Promise<void>} A promise representing the asynchronous operation of the storno process.
     */
    async function runStornoRound(teamAId, propertyId, teamBId) {
      // make sure a positive saldo is here
      await api.get(`/marketplace/payRents/${gameId}`);

      const balanceBeforeA = await teamAccount.getBalance(gameId, teamAId);

      let res = await api.post(`/marketplace/buyProperty/${gameId}/${teamAId}/${propertyId}`);
      console.log(res.data);
      expect(res.data.result.amount).to.be(1000);
      expect(res.data.result.property.uuid).to.be(propertyId);

      // buying a property: checking
      const balanceA2 = await teamAccount.getBalance(gameId, teamAId);
      expect(balanceA2.asset - balanceBeforeA.asset).to.be(-1000)
      console.log(balanceA2);


      // Paying rents
      await api.get(`/marketplace/payRents/${gameId}`);
      const balanceA3 = await teamAccount.getBalance(gameId, teamAId);
      console.log(balanceA3);
      expect(balanceA3.asset - balanceA2.asset).to.be(4200);

      // build a house
      const resBuild = await api.post(`/marketplace/buildHouses/${gameId}/${teamAId}`);
      expect(resBuild.data.result.amount).to.be(-500);
      expect(resBuild.data.result.log.length).to.be(1);

      const balanceA4 = await teamAccount.getBalance(gameId, teamAId);
      expect(balanceA4.asset - balanceA3.asset).to.be(-500);

      // Team B is buying rent
      const balanceBeforeB = await teamAccount.getBalance(gameId, teamBId);
      const resBuyB        = await api.post(`/marketplace/buyProperty/${gameId}/${teamBId}/${propertyId}`);
      console.log(resBuyB.data);
      expect(resBuyB.data.result.amount).to.be(800);

      const balanceA5 = await teamAccount.getBalance(gameId, teamAId);
      expect(balanceA5.asset - balanceA4.asset).to.be(800);


      res = await api.post(`/storno/${gameId}/${propertyId}`, {reason: 'unit test'});
      console.log(res.data);

      // Only the Startgeld should be on the account of A
      const balanceEndA = await teamAccount.getBalance(gameId, teamAId);
      expect(balanceEndA.asset - balanceBeforeA.asset).to.be(4000);

      const balanceEndB = await teamAccount.getBalance(gameId, teamBId);
      //const entries     = await teamAccount.getAccountStatement(gameId, teamBId);
      //console.log(entries);
      expect(balanceEndB.asset - balanceBeforeB.asset).to.be(0);
    }

    it('should buy a property for team A and team B pays rent, then revert it', async () => {
      const teamAId    = gameData.teams[0].uuid;
      const teamBId    = gameData.teams[1].uuid;
      const propertyId = gameData.properties[1].uuid;
      await runStornoRound(teamAId, propertyId, teamBId);
    })

    it('should buy SAME property for team A and team B pays rent, then revert it again', async () => {
      const teamAId    = gameData.teams[0].uuid;
      const teamBId    = gameData.teams[1].uuid;
      const propertyId = gameData.properties[1].uuid;
      await runStornoRound(teamAId, propertyId, teamBId);
    })


  })
});
