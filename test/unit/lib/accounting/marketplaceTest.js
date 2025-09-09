/**
 * The (new) tests for the market
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 09.09.2025
 **/

const expect             = require('expect.js');
const db                 = require('../../../../common/lib/ferropolyDb');
const settings           = require('../../../../main/settings');
const unitTestGame       = require('../../../fixtures/unitTestGame');
const TestEmitter        = require('../../../fixtures/testEmitter');
const gameCache          = require('../../../../main/lib/gameCache');
const marketplace        = require('../../../../main/lib/accounting/marketplace');
const {DateTime}         = require('luxon');
const chancelleryAccount = require('../../../../main/lib/accounting/chancelleryAccount');
const teamAccount        = require('../../../../main/lib/accounting/teamAccount');

const testEmitter = new TestEmitter();
const gameId      = 'marketplace'
let mp            = null;
let gameData      = null;

/*
 These are probably the most complex tests here: every step depends on the one before, as we simulate a game.
 Testing a single step is therefore not possible
 */
describe('Testing the marketplace', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    mp       = marketplace.createMarketplace(testEmitter);

    // Set the game params for the game
    console.log(gameData.gp);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Preparing a game', () => {

    it('should be no money on the accounts before the game', async () => {
      for (const team of gameData.teams) {
        let res = await teamAccount.getBalance(gameId, team.uuid);
        expect(res.asset).to.be(0);
      }


    })

    it('should pay the prestart values', done => {
      testEmitter.fireEvent('prestart', {
        gameId,
        callback: async function (err) {
          if (err) {
            console.error('should not happen', err);
            return done(err);
          }
          try {
            for (const team of gameData.teams) {
              let res = await teamAccount.getBalance(gameId, team.uuid);
              console.log(res);
              expect(res.asset).to.be(4000);
            }
            done(err);
          }
          catch (ex) {
            done(ex);
          }
        }
      })
    })
  })

  describe('Starting the game', () => {
    it('should be the start money on the bank', async ()=> {
      for (const team of gameData.teams) {
        let res = await teamAccount.getBalance(gameId, team.uuid);
        expect(res.asset).to.be(4000);
      }
    })

    it('should start the game', done => {
      testEmitter.fireEvent('start', {
        gameId,
        callback: async function(err) {
          if (err) {
            console.error('should not happen', err);
            return done(err);
          }
          try {
            for (const team of gameData.teams) {
              let res = await teamAccount.getBalance(gameId, team.uuid);
              expect(res.asset).to.be(4000);
            }
            done();
          }
          catch(ex) {
            done(ex);
          }

        }
      })
    })
  })

  describe('Paying the first interest without any rents', ()=> {
    it('should pay the base rate', done => {
      testEmitter.fireEvent('interest', {
        gameId,
        callback: async function(err) {
          if (err) {
            console.error('should not happen', err);
            return done(err);
          }
          try {
            for (const team of gameData.teams) {
              let res = await teamAccount.getBalance(gameId, team.uuid);
              console.log(res);
              expect(res.asset).to.be(8000);
            }
            done();
          }
          catch(ex) {
            done(ex);
          }

        }
      })
    })
    })

  /**
   * Facilitates the purchase of a property within the game for a specific team.
   *
   * @param {string} teamId - The unique identifier for the team making the purchase.
   * @param {string} propertyId - The unique identifier for the property being purchased.
   * @param {string} name - The expected name of the property being purchased.
   * @param {number} price - The expected price of the property.
   * @return {Promise<void>} Resolves once the property purchase process is completed and assertions are validated.
   */
  async function buyProperty(teamId, propertyId, name, price) {
    const result = await mp.buyProperty({
      gameId,
      teamId,
      propertyId
    });
    console.log(result);
    expect(result.amount).to.be(price);
    expect(result.property.location.name).to.be(name);
    expect(result.property.gamedata.buildings).to.be(0);
  }

  describe('Teams are buying some properties', ()=> {
    it('should buy Ribellasca for team 0', async ()=> {
      await buyProperty(gameData.teams[0].uuid,gameData.properties[0].uuid, 'Ribellasca', 1000);
    })
    it('should not buy Ribellasca a second time for team 0', async ()=> {
      const result = await mp.buyProperty({ gameId, teamId: gameData.teams[0].uuid, propertyId: gameData.properties[0].uuid });
      console.log(result);
      expect(result.amount).to.be(0);
      expect(result.property.gamedata.buildingEnabled).to.be(false);
      expect(result.property.location.name).to.be('Ribellasca');
    })
    it('should buy Pampigny for team 0 (which makes a double)', async ()=> {
      await buyProperty(gameData.teams[0].uuid,gameData.properties[1].uuid, 'Pampigny-Sévery', 1000);
    })
    it('should buy Blonay for team 1', async ()=> {
      await buyProperty(gameData.teams[1].uuid,gameData.properties[15].uuid, 'Blonay', 2000);
    })
    it('should buy Mammern for team 2', async ()=> {
      await buyProperty(gameData.teams[2].uuid,gameData.properties[39].uuid, 'Mammern URh', 4000);
    })
  })
})
