/**
 * Negative tests for the marketplace
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 09.09.2025
 **/


const expect             = require('expect.js');
const db                 = require('../../../../common/lib/ferropolyDb');
const settings           = require('../../../../main/settings');
const unitTestGame       = require('../../../fixtures/unitTestGame');
const TestEmitter        = require('../../../fixtures/testEmitter');
const marketplace        = require('../../../../main/lib/accounting/marketplace');
const {DateTime}         = require('luxon');
const teamAccount        = require('../../../../main/lib/accounting/teamAccount');

const testEmitter = new TestEmitter();
const gameId      = 'marketplace'
let mp            = null;
let gameData      = null;

/*
 These are probably the most complex tests here: every step depends on the one before, as we simulate a game.
 Testing a single step is therefore not possible
 */
describe('Testing the marketplace in a negative manner', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId, {
      gameDate: DateTime.now().plus({days: 1}
      )});
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

    it('should not pay the prestart values (not open)', done => {
      testEmitter.fireEvent('prestart', {
        gameId,
        callback: async function (err) {
          if (err) {
            console.error('This error is expected', err);
          }
          try {
            expect(err).not.to.be(null);
            for (const team of gameData.teams) {
              let res = await teamAccount.getBalance(gameId, team.uuid);
              console.log(res);
              expect(res.asset).to.be(0);
            }
            done();
          }
          catch (ex) {
            done(ex);
          }
        }
      })
    })
  })

})
