/**
 * The (new) tests for the market
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 09.09.2025
 **/

const expect             = require('expect.js');
const db                 = require('../../../../common/lib/ferropolyDb');
const teamModel          = require('../../../../common/models/teamModel');
const settings           = require('../../../../main/settings');
const unitTestGame       = require('../../../fixtures/unitTestGame');
const TestEmitter        = require('../../../fixtures/testEmitter');
const marketplace        = require('../../../../main/lib/accounting/marketplace');
const chancelleryAccount = require('../../../../main/lib/accounting/chancelleryAccount');
const propertyAccount    = require('../../../../main/lib/accounting/propertyAccount');
const teamAccount        = require('../../../../main/lib/accounting/teamAccount');
const propWrap           = require('../../../../main/lib/propertyWrapper');
const rankingList        = require('../../../../main/lib/reports/rankingList');
const teamAccountRepport = require('../../../../main/lib/reports/teamAccountReport');
const testEmitter        = new TestEmitter();
const gameId             = 'marketplace'
let mp                   = null;
let gameData             = null;

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

  describe('Getting the market place', () => {
    it('should return the same marketplace instance', async () => {
      const mp2 = marketplace.getMarketplace();
      expect(mp).to.be(mp2);
    })
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
    it('should be the start money on the bank', async () => {
      for (const team of gameData.teams) {
        let res = await teamAccount.getBalance(gameId, team.uuid);
        expect(res.asset).to.be(4000);
      }
    })

    it('should start the game', done => {
      testEmitter.fireEvent('start', {
        gameId,
        callback: async function (err) {
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
          catch (ex) {
            done(ex);
          }
        }
      })
    })
  })

  describe('Paying the first interest without any rents', () => {
    it('should pay the base rate', done => {
      testEmitter.fireEvent('interest', {
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
              expect(res.asset).to.be(8000);
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
    const assetBefore = await teamAccount.getBalance(gameId, teamId);
    const result      = await mp.buyProperty({
      gameId,
      teamId,
      propertyId
    });
    console.log(result);
    expect(result.amount).to.be(price);
    expect(result.property.location.name).to.be(name);
    expect(result.property.gamedata.buildings).to.be(0);
    const assetAfter = await teamAccount.getBalance(gameId, teamId);
    console.log(assetAfter);
    expect(assetAfter.asset + price).to.be(assetBefore.asset);
  }

  function verifyAssets(before, after, expectedGain) {
    console.log(before, after, expectedGain, after.asset - before.asset);
    expect(before.asset + expectedGain).to.be(after.asset);
  }

  describe('Teams are buying some properties', () => {
    it('should buy Ribellasca for team 0', async () => {
      await buyProperty(gameData.teams[0].uuid, gameData.properties[0].uuid, 'Ribellasca', 1000);
    })
    it('should not buy Ribellasca a second time for team 0', async () => {
      const result = await mp.buyProperty({
        gameId,
        teamId:     gameData.teams[0].uuid,
        propertyId: gameData.properties[0].uuid
      });
      console.log(result);
      expect(result.amount).to.be(0);
      expect(result.property.gamedata.buildingEnabled).to.be(false);
      expect(result.property.location.name).to.be('Ribellasca');
    })
    it('should buy Pampigny for team 0 (which makes a double)', async () => {
      await buyProperty(gameData.teams[0].uuid, gameData.properties[1].uuid, 'Pampigny-Sévery', 1000);
    })
    it('should buy Blonay for team 1', async () => {
      await buyProperty(gameData.teams[1].uuid, gameData.properties[15].uuid, 'Blonay', 2000);
    })
    it('should buy Mammern for team 2', async () => {
      await buyProperty(gameData.teams[2].uuid, gameData.properties[39].uuid, 'Mammern URh', 4000);
    })
    it('does not happen to team 3, they only pay chancellery (to get negative asset)', async () => {
      const res = await chancelleryAccount.gamble(gameData.gp, gameData.teams[3], -12000);
      console.log(res);
      const asset = await teamAccount.getBalance(gameId, gameData.teams[3].uuid);
      console.log(asset);
      expect(asset.asset).to.be(-4000);
    })
  })

  describe('paying the second interest, with rents', () => {
    const assetsBefore = new Map();
    const expectedGain = new Map();

    it('should be possible to collect the current values', async () => {
      for (const team of gameData.teams) {
        assetsBefore.set(team.uuid, await teamAccount.getBalance(gameId, team.uuid));
      }
      expectedGain.set(gameData.teams[0].uuid, 4000 + 2 * 200 + 2 * 200);
      expectedGain.set(gameData.teams[1].uuid, 4000 + 400);
      expectedGain.set(gameData.teams[2].uuid, 4000 + 800);
      expectedGain.set(gameData.teams[3].uuid, 4000 - (4000 * .2)); // negative saldo!
      expectedGain.set(gameData.teams[4].uuid, 4000);
      expectedGain.set(gameData.teams[5].uuid, 4000);
    })
    it('should pay the base rate plus rents', done => {
      testEmitter.fireEvent('interest', {
        gameId,
        callback: async function (err) {
          if (err) {
            console.error('should not happen', err);
            return done(err);
          }
          try {
            const assetsAfter = new Map();
            for (const team of gameData.teams) {
              let res = await teamAccount.getBalance(gameId, team.uuid);
              console.log(res);
              assetsAfter.set(team.uuid, await teamAccount.getBalance(gameId, team.uuid));

              verifyAssets(assetsBefore.get(team.uuid), assetsAfter.get(team.uuid), expectedGain.get(team.uuid));
            }
            done();
          }
          catch (ex) {
            done(ex);
          }
        }
      })
    })
    it('should create a new ranking list', async () => {
      const rl = await teamAccount.getRankingList(gameId);
      console.log(rl);
      for (const i in gameData.teams) {
        console.log(`----- Team ${i}`);
        const bookings = await teamAccount.getAccountStatement(gameId, gameData.teams[i].uuid);
        console.log(bookings);
      }
    })
  })

  describe('Buying houses for all properties', () => {

    it('should work for team 0, all houses together', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      const res         = await mp.buildHouses(gameId, gameData.teams[0].uuid);
      console.log(res);
      const assetAfter = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      console.log(assetBefore, assetAfter)
      expect(assetBefore.asset - 2 * 500).to.be(assetAfter.asset);

      const prop = await propWrap.getProperty(gameId, gameData.properties[0].uuid);
      console.log(prop);
      expect(prop.gamedata.buildings).to.be(1);
      expect(prop.gamedata.buildingEnabled).to.be(false);
    })

    it('should work for team 0, but nothing to buld', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      const res         = await mp.buildHouses(gameId, gameData.teams[0].uuid);
      console.log(res);
      const assetAfter = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      console.log(assetBefore, assetAfter)
      expect(assetBefore.asset).to.be(assetAfter.asset);

      const prop = await propWrap.getProperty(gameId, gameData.properties[0].uuid);
      console.log(prop);
      expect(prop.gamedata.buildings).to.be(1);
      expect(prop.gamedata.buildingEnabled).to.be(false);
    })

    it('should fail for team 2, trying to build on blonay (team 1)', async () => {
      try {
        const res = await mp.buildHouse(gameId, gameData.teams[2].uuid, gameData.properties[15].uuid);
        expect(res).to.be(1); // FAIL if we're here!
      }
      catch (err) {
        console.log('Expected error', err);
      }
      // Property should be untouched!
      const prop = await propWrap.getProperty(gameId, gameData.properties[15].uuid);
      console.log(prop);
      expect(prop.gamedata.buildings).to.be(0);
      expect(prop.gamedata.buildingEnabled).to.be(true);
    })

    it('should work for team 1, a single build', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const res         = await mp.buildHouse(gameId, gameData.teams[1].uuid, gameData.properties[15].uuid);
      console.log(res);
      const assetAfter = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      console.log(assetBefore, assetAfter)
      expect(assetBefore.asset - 1000).to.be(assetAfter.asset);

      const prop = await propWrap.getProperty(gameId, gameData.properties[15].uuid);
      console.log(prop);
      expect(prop.gamedata.buildings).to.be(1);
      expect(prop.gamedata.buildingEnabled).to.be(false);
    })

    it('should work for team 2, a single build', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      const res         = await mp.buildHouse(gameId, gameData.teams[2].uuid, gameData.properties[39].uuid);
      console.log(res);
      const assetAfter = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      console.log(assetBefore, assetAfter)
      expect(assetBefore.asset - 2000).to.be(assetAfter.asset);

      const prop = await propWrap.getProperty(gameId, gameData.properties[39].uuid);
      console.log(prop);
      expect(prop.gamedata.buildings).to.be(1);
      expect(prop.gamedata.buildingEnabled).to.be(false);
    })


    it('should work for team 5, but nothing to buld', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      const res         = await mp.buildHouses(gameId, gameData.teams[5].uuid);
      console.log(res);
      const assetAfter = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      console.log(assetBefore, assetAfter)
      expect(assetBefore.asset).to.be(assetAfter.asset);
    })
  })

  describe('buying a property, but fails', () => {
    it('should happen nothing if the owner tries to buy a property', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const res         = await mp.buyProperty({
        gameId,
        teamId:     gameData.teams[0].uuid,
        propertyId: gameData.properties[0].uuid
      });
      console.log(res);
      expect(res.amount).to.be(0);
      const assetAfter = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      console.log(assetBefore, assetAfter)
      expect(assetBefore.asset).to.be(assetAfter.asset);
    })

    it('should be paid a rent if a visitor tries to buy a property', async () => {
      const assetVisitorBefore  = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      const assetOwnerBefore    = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      const propertyAssetBefore = await propertyAccount.getBalance(gameId, gameData.properties[0].uuid);

      const res = await mp.buyProperty({
        gameId,
        teamId:     gameData.teams[5].uuid,
        propertyId: gameData.properties[0].uuid
      });

      const assetVisitorAfter  = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      const assetOwnerAfter    = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      const propertyAssetAfter = await propertyAccount.getBalance(gameId, gameData.properties[0].uuid);

      console.log(res);
      console.log(assetVisitorBefore, assetVisitorAfter);
      console.log(assetOwnerBefore, assetOwnerAfter);
      console.log(propertyAssetBefore, propertyAssetAfter);
      expect(assetVisitorBefore.asset - 2 * 800).to.be(assetVisitorAfter.asset);
      expect(assetOwnerBefore.asset + 2 * 800).to.be(assetOwnerAfter.asset);
      expect(propertyAssetBefore.balance + 2 * 800).to.be(propertyAssetAfter.balance);

      const prop = await propWrap.getProperty(gameId, gameData.properties[0].uuid);
      console.log(prop);
      expect(prop.gamedata.owner).to.be(gameData.teams[0].uuid);
    })
  })

  describe('Chancellery', () => {
    it('should pay or get the money by random', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      const result      = await mp.chancellery(gameId, gameData.teams[5].uuid);
      const assetAfter  = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      console.log(result, assetBefore, assetAfter);
      expect(assetBefore.asset + result.amount).to.be(assetAfter.asset);
    })
    it('should pay gambling money', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      const result      = await mp.chancelleryGamble(gameId, gameData.teams[5].uuid, 3333);
      const assetAfter  = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      console.log(result, assetBefore, assetAfter);
      expect(assetBefore.asset + 3333).to.be(assetAfter.asset);
    })
    it('should loose gambling money', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      const result      = await mp.chancelleryGamble(gameId, gameData.teams[5].uuid, -2222);
      const assetAfter  = await teamAccount.getBalance(gameId, gameData.teams[5].uuid);
      console.log(result, assetBefore, assetAfter);
      expect(assetBefore.asset - 2222).to.be(assetAfter.asset);
    })
  })

  describe('Manipulating Team accounts', () => {
    it('should be possible to add some money', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[4].uuid);
      const result      = await mp.manipulateTeamAccount(gameId, gameData.teams[4].uuid, 3000, 'Korrektur');
      const assetAfter  = await teamAccount.getBalance(gameId, gameData.teams[4].uuid);
      console.log(result, assetBefore, assetAfter);
      expect(assetBefore.asset + 3000).to.be(assetAfter.asset);
    })
    it('should be possible to reduce some money', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[4].uuid);
      const result      = await mp.manipulateTeamAccount(gameId, gameData.teams[4].uuid, -1200, 'Korrektur');
      const assetAfter  = await teamAccount.getBalance(gameId, gameData.teams[4].uuid);
      console.log(result, assetBefore, assetAfter);
      expect(assetBefore.asset - 1200).to.be(assetAfter.asset);
    })
  })

  describe('Reset a prperty over the market place', () => {
    it('should be possible to buy a property', async () => {
      const assetBefore = await teamAccount.getBalance(gameId, gameData.teams[4].uuid);
      const result      = await mp.buyProperty({
        gameId,
        teamId:     gameData.teams[4].uuid,
        propertyId: gameData.properties[22].uuid
      });
      console.log(result, assetBefore);
      const assetAfter = await teamAccount.getBalance(gameId, gameData.teams[4].uuid);
      console.log(result, assetBefore, assetAfter);
      expect(assetBefore.asset - 2500).to.be(assetAfter.asset);
    })
    it('should be possible to reset a property', async () => {
      const assetBefore = await propertyAccount.getBalance(gameId, gameData.properties[22].uuid);
      const result      = await mp.resetProperty(gameId, gameData.properties[22].uuid, 'unit test');
      const assetAfter  = await propertyAccount.getBalance(gameId, gameData.properties[22].uuid);
      console.log(result, assetBefore, assetAfter);
      expect(assetBefore.balance + 2500).to.be(assetAfter.balance);

      const prop = await propWrap.getProperty(gameId, gameData.properties[22].uuid);
      console.log(prop);
      expect(prop.gamedata.owner).to.be(undefined);
    })
  })

  describe('Game comes to an end', () => {
    const assetsBefore = new Map();
    const expectedGain = new Map();

    it('should be possible to collect the current values', async () => {
      for (const team of gameData.teams) {
        assetsBefore.set(team.uuid, await teamAccount.getBalance(gameId, team.uuid));
      }
      expectedGain.set(gameData.teams[0].uuid, 2 * (4000 + 2 * 800 + 2 * 800));
      expectedGain.set(gameData.teams[1].uuid, 2 * (4000 + 1600));
      expectedGain.set(gameData.teams[2].uuid, 2 * (4000 + 3200));
      expectedGain.set(gameData.teams[3].uuid, (4000 - 800 * .2) + 4000);
      expectedGain.set(gameData.teams[4].uuid, 2 * 4000);
      expectedGain.set(gameData.teams[5].uuid, 2 * 4000);
    })

    it('should pay the final rents', (done) => {
      testEmitter.fireEvent('end', {
        gameId,
        callback: done
      })
    })

    it('should fit with the gains per group', async () => {
      const assetsAfter = new Map();
      for (const team of gameData.teams) {
        assetsAfter.set(team.uuid, await teamAccount.getBalance(gameId, team.uuid));
      }

      for (const i in gameData.teams) {
        console.log(`----- team ${i}`);
        const id = gameData.teams[i].uuid;
        console.log(assetsBefore.get(id), assetsAfter.get(id), expectedGain.get(id));
        expect(assetsBefore.get(id).asset + expectedGain.get(id)).to.be(assetsAfter.get(id).asset)
      }
    })
  })

  describe('Getting the rankingList (from reports)', () => {
    it('should return the ranking list', async () => {
      const list = await rankingList.get(gameId);
      console.log(list);
      expect(list.length).to.be(8);
      // Header and footer: 1 Element
      expect(list[0].length).to.be(1);
      expect(list[7].length).to.be(1);
      // all others 3
      expect(list[1].length).to.be(3);
      expect(list[6].length).to.be(3);
    })

    it('should return the ranking list as Excel', async () => {
      const list = await rankingList.createXlsx(gameId);
      console.log(list);
      expect(list.data).to.be.a('object');
      expect(list.name).to.be.a('string');
    })
  })

  describe('Getting the teamAccountReport (from reports', () => {
    it('should return the team account report', async () => {
      const teams                   = await teamModel.getTeamsAsMap(gameId);
      teams[gameData.teams[0].uuid] = gameData.teams[0];
      const report                  = await teamAccountRepport.get(gameId, null, teams);
      console.log(report.length);
      expect(report.length).to.be(59);
    })
    it('should return the team account as Excel', async () => {
      const report = await teamAccountRepport.createXlsx(gameId);
      expect(report.data).to.be.a('object');
      expect(report.name).to.be.a('string');
    })
  })

})
