/**
 * Testing the property accounts
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.09.2025
 **/
const expect             = require('expect.js');
const db                 = require('../../../../common/lib/ferropolyDb');
const settings           = require('../../../../main/settings');
const unitTestGame       = require('../../../fixtures/unitTestGame');
const propertyAccount    = require('../../../../main/lib/accounting/propertyAccount');
const propWrap           = require('../../../../main/lib/propertyWrapper');
const teamAccount        = require('../../../../main/lib/accounting/teamAccount');
const {getSummary}       = require('../../../../common/models/accounting/propertyTransaction');
const {getPropertyValue} = require('../../../../main/lib/accounting/propertyAccount');
const gameId             = 'unit-test-property-account';
let gameData;

describe('Testing the propertyAccount', () => {

  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Buying a property', () => {
    /**
     * Buy a property - check if the property is bought
     * @param property
     * @param team
     * @return {Promise<void>}
     */
    async function buyProperty(property, team) {
      const res = await propertyAccount.buyProperty(gameData.gp, property, team);
      console.log(res);
      expect(res.amount).to.be(property.pricelist.price);

      const prop = await propWrap.getProperty(gameId, property.uuid);
      console.log(prop);
      expect(prop.gamedata.buildingEnabled).to.be(false);
      expect(prop.gamedata.buildings).to.be(0);
      expect(prop.gamedata.owner).to.be(team.uuid);
    }

    async function evaluateValue(property, expectedValue) {
      const val = await propertyAccount.getPropertyValue(gameData.gp, property);
      console.log(val);
      expect(val.uuid).to.be(property.uuid);
      expect(val.property).to.be(property.uuid);
      expect(val.amount).to.be(expectedValue);
    }

    it('should be possible for a free property (prop 0 / team 0)', async () => {
      const propertyToBuy = gameData.properties[0];
      await buyProperty(propertyToBuy, gameData.teams[0]);
      const prop = await propWrap.getProperty(gameId, propertyToBuy.uuid);
      await evaluateValue(propertyToBuy, prop.pricelist.rents.noHouse);
    })

    it('should be possible for a free property (prop 1 / team 0) - DOUBLE', async () => {
      const propertyToBuy = gameData.properties[1];
      await buyProperty(propertyToBuy, gameData.teams[0]);
      const prop = await propWrap.getProperty(gameId, propertyToBuy.uuid);
      // It's the double as the whole group belongs to the team
      await evaluateValue(propertyToBuy, prop.pricelist.rents.noHouse * 2);
      // Check also property 0
      await evaluateValue(gameData.properties[0], prop.pricelist.rents.noHouse * 2);
    })

    it('should be possible for a free property (prop 2 / team 1)', async () => {
      const propertyToBuy = gameData.properties[2];
      await buyProperty(propertyToBuy, gameData.teams[1]);
      const prop = await propWrap.getProperty(gameId, propertyToBuy.uuid);
      await evaluateValue(propertyToBuy, prop.pricelist.rents.noHouse);
    })

    it('should be possible for a free property (prop 3 / team 2)', async () => {
      const propertyToBuy = gameData.properties[3];
      await buyProperty(propertyToBuy, gameData.teams[2]);
      const prop = await propWrap.getProperty(gameId, propertyToBuy.uuid);
      await evaluateValue(propertyToBuy, prop.pricelist.rents.noHouse);
    })

    it('should not be possible for a already taken property', async () => {
      const res = await propertyAccount.buyProperty(gameData.gp, gameData.properties[0], gameData.teams[1]);
      console.log(res);
      expect(res).to.be(null);

      // Must still belong to team 0
      const prop = await propWrap.getProperty(gameId, gameData.properties[0].uuid);
      expect(prop.gamedata.owner).to.be(gameData.teams[0].uuid);
    })

    it('should fail if there is no gameId', async () => {
      const res = await propertyAccount.buyProperty({}, gameData.properties[6], gameData.teams[1]);
      console.log(res);
      expect(res).to.be(null);
    })
  })

  describe('Charging rent', () => {
    it('should charge rent from team 1 to team 2 on prop 3', async () => {
      // Before the rent, the price of buying the property is in the books
      const propTransBefore = await getSummary(gameId, gameData.properties[3].uuid);
      console.log(propTransBefore);
      expect(propTransBefore[0].balance).to.be(gameData.properties[3].pricelist.price * -1);

      const balanceTeam1Before = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const balanceTeam2Before = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      const res                = await propertyAccount.chargeRent(gameData.gp, gameData.properties[3], gameData.teams[1].uuid);
      console.log(res);
      expect(res.property.uuid === gameData.properties[3].uuid);
      expect(res.owner === gameData.teams[2].uuid);
      expect(res.amount === gameData.properties[3].pricelist.rents.noHouse);

      const balanceTeam1After = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const balanceTeam2After = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);

      // Check if the transactions were made
      expect(balanceTeam1Before.asset - balanceTeam1After.asset).to.be(gameData.properties[3].pricelist.rents.noHouse);
      expect(balanceTeam2Before.asset - balanceTeam2After.asset).to.be(gameData.properties[3].pricelist.rents.noHouse * -1);

      const propTransAfter = await getSummary(gameId, gameData.properties[3].uuid)
      console.log(propTransBefore, propTransAfter)
      expect(propTransAfter[0].balance - propTransBefore[0].balance).to.be(gameData.properties[3].pricelist.rents.noHouse);
    })

    it('should do nothing if the owning team is on the property', async () => {
      const propTransBefore    = await getSummary(gameId, gameData.properties[3].uuid);
      const balanceTeam2Before = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      const res                = await propertyAccount.chargeRent(gameData.gp, gameData.properties[3], gameData.teams[2].uuid);
      expect(res.property.uuid === gameData.properties[3].uuid);
      expect(res.owner === gameData.teams[2].uuid);
      expect(res.amount === gameData.properties[3].pricelist.rents.noHouse);
      const balanceTeam2After = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);

      // No effect!
      expect(balanceTeam2Before.asset - balanceTeam2After.asset).to.be(0);
      const propTransAfter = await getSummary(gameId, gameData.properties[3].uuid)
      console.log(propTransBefore, propTransAfter)
      expect(propTransAfter[0].balance - propTransBefore[0].balance).to.be(0);
    })

    it('should do nothing if the property belongs nobody', async () => {

      const balanceTeam2Before = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      const res                = await propertyAccount.chargeRent(gameData.gp, gameData.properties[12], gameData.teams[2].uuid);
      expect(res.property.uuid === gameData.properties[12].uuid);
      expect(res.owner === gameData.teams[2].uuid);
      expect(res.amount === gameData.properties[12].pricelist.rents.noHouse);
      const balanceTeam2After = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);

      // No effect!
      expect(balanceTeam2Before.asset - balanceTeam2After.asset).to.be(0);
      const propTransAfter = await getSummary(gameId, gameData.properties[12].uuid)

      expect(propTransAfter.length).to.be(0);
    })
  })

  describe('Resetting a property', () => {
    it('should have no effect on an unused property', async () => {
      const prop                  = gameData.properties[19];
      const buildingEnabledBefore = prop.gamedata.buildingEnabled;
      const buildingsBefore       = prop.gamedata.buildings;
      const ownerBefore           = prop.gamedata.owner;
      const balanceBefore         = await propertyAccount.getBalance(gameId, prop.uuid);
      expect(buildingsBefore).to.be(undefined);

      await propertyAccount.resetProperty(gameId, prop, 'nicht gebraucht');

      const balanceAfter = await propertyAccount.getBalance(gameId, prop.uuid);

      const updatedProp = await propWrap.getProperty(gameId, prop.uuid);
      expect(updatedProp.gamedata.buildingEnabled).to.be(buildingEnabledBefore);
      expect(updatedProp.gamedata.buildings).to.be(0);
      expect(updatedProp.gamedata.owner).to.be(ownerBefore);
      expect(balanceBefore.balance).to.be(balanceAfter.balance);
    });

    it('should reset a used property', async () => {

      const prop = gameData.properties[19];
      const res  = await propertyAccount.buyProperty(gameData.gp, prop, gameData.teams[0]);
      console.log(res);
      expect(res.amount).to.be(prop.pricelist.price);

      prop.gamedata.buildingEnabled = true;
      const res1                    = await propertyAccount.buyBuilding(gameData.gp, prop, gameData.teams[0]);
      expect(res1.success).to.be(true);
      await propWrap.allowBuilding(gameId);

      const prop2 = await propWrap.getProperty(gameId, prop.uuid);
      console.log(prop2, prop2.gamedata);
      expect(prop2.gamedata.buildings).to.be(1);
      expect(prop2.gamedata.owner).to.be(gameData.teams[0].uuid);


      await propertyAccount.resetProperty(gameId, prop, 'falsch gebucht');

      const balanceAfter = await propertyAccount.getBalance(gameId, prop.uuid);
      const updatedProp  = await propWrap.getProperty(gameId, prop.uuid);
      expect(updatedProp.gamedata.buildingEnabled).to.be(false);
      expect(updatedProp.gamedata.buildings).to.be(0);
      expect(updatedProp.gamedata.owner).to.be(undefined);
      expect(balanceAfter.balance).to.be(0);
    });

  })

  describe('Buying buildings', () => {
    let testProperty = null;
    before(async () => {
      testProperty = gameData.properties[15];
      console.log('Preparing: buy a property');
      const res = await propertyAccount.buyProperty(gameData.gp, testProperty, gameData.teams[0]);
      expect(res.amount).to.be(testProperty.pricelist.price);
    });
    after(async () => {
      console.log('cleaning up');
      await propertyAccount.resetProperty(gameId, testProperty, 'Reset nach Test');
    })
    it('should fail if this is the wrong team', async () => {
      const res = await propertyAccount.buyBuilding(gameData.gp, testProperty, gameData.teams[1]);
      expect(res.success).to.be(false);
    })
    it('should fail if building is not enabled', async () => {
      testProperty.gamedata.buildingEnabled = undefined;
      let res                               = await propertyAccount.buyBuilding(gameData.gp, testProperty, gameData.teams[0]);
      expect(res.success).to.be(false);
      testProperty.gamedata.buildingEnabled = false;
      res                                   = await propertyAccount.buyBuilding(gameData.gp, testProperty, gameData.teams[0]);
      expect(res.success).to.be(false);
    })


    it('should work if building is enabled, up to a hotel but fails then, the value of the property is according to the houses', async () => {
      /**
       * Builds a specified number of buildings on a property within a game and validates the process.
       *
       * @param {Object} prop - The property object on which buildings are to be constructed.
       * @param {number} nbHouses - The number of houses/buildings to be built on the property.
       * @param success
       * @return {Object} The updated property object after the construction process completes.
       */
      async function build(prop, nbHouses, success = true) {
        prop.gamedata.buildingEnabled = true;
        res                           = await propertyAccount.buyBuilding(gameData.gp, prop, gameData.teams[0]);
        expect(res.success).to.be(success);

        prop = await propWrap.getProperty(gameId, testProperty.uuid);
        expect(prop.gamedata.buildings).to.be(nbHouses);
        expect(prop.gamedata.buildingEnabled).to.be(false);
        return prop;
      }

      // IMPORTANT: THIS IS TESTED AGAINST THE REFERENCE PRICELIST, attached in the fixtures!
      let value = await getPropertyValue(gameData.gp, testProperty);
      expect(value.amount).to.be(400);

      // 1st House
      testProperty.gamedata.buildingEnabled = true;
      let res                               = await propertyAccount.buyBuilding(gameData.gp, testProperty, gameData.teams[0]);
      expect(res.success).to.be(true);

      let prop = await propWrap.getProperty(gameId, testProperty.uuid);
      expect(prop.gamedata.buildings).to.be(1);
      expect(prop.gamedata.buildingEnabled).to.be(false);

      value = await getPropertyValue(gameData.gp, prop);
      expect(value.amount).to.be(1600);

      // 2nd House and so on
      prop  = await build(prop, 2);
      value = await getPropertyValue(gameData.gp, prop);
      expect(value.amount).to.be(5000);

      prop  = await build(prop, 3);
      value = await getPropertyValue(gameData.gp, prop);
      expect(value.amount).to.be(7000);

      prop  = await build(prop, 4);
      value = await getPropertyValue(gameData.gp, prop);
      expect(value.amount).to.be(8000);

      prop  = await build(prop, 5);
      value = await getPropertyValue(gameData.gp, prop);
      expect(value.amount).to.be(10000);

      // Fails with a hotel
      await build(prop, 5, false);
    })
  })

  describe('Testing Interest and Rent register should succeed', () => {

    it('should be 0 when there are no properties', async () => {
      const info = await propertyAccount.getRentRegister(gameData.gp, gameData.teams[4]);
      console.log(info);
      expect(info.register.length).to.be(0);
      expect(info.totalAmount).to.be(0);
      expect(info.teamId).to.be(gameData.teams[4].uuid);
    })

    it('should fit if we buy Hasliberg', async () => {
      // This is "Hasliberg Reuti" in the reference price list
      let info = await propertyAccount.buyProperty(gameData.gp, gameData.properties[26], gameData.teams[4])
      console.log(info);
      expect(info.amount).to.be(3000)

      info = await propertyAccount.getRentRegister(gameData.gp, gameData.teams[4]);
      console.log(info);
      expect(info.register.length).to.be(1);
      expect(info.totalAmount).to.be(600);
      expect(info.teamId).to.be(gameData.teams[4].uuid);
    })
    it('should still fit if we build a house in Hasliberg', async () => {
      // This is "Hasliberg Reuti" in the reference price list
      const prop                    = await propWrap.getProperty(gameId, gameData.properties[26].uuid);
      prop.gamedata.buildingEnabled = true;
      let res                       = await propertyAccount.buyBuilding(gameData.gp, prop, gameData.teams[4]);
      console.log(res);

      let info = await propertyAccount.getRentRegister(gameData.gp, gameData.teams[4]);
      console.log(info);
      expect(info.register.length).to.be(1);
      expect(info.totalAmount).to.be(2400);
      expect(info.teamId).to.be(gameData.teams[4].uuid);
    })

    it('should fit after buying the second property of the same group', async () => {
      // This is "Les Plans-sur-Bex, village" in the reference price list
      let info = await propertyAccount.buyProperty(gameData.gp, gameData.properties[27], gameData.teams[4])
      console.log(info);
      expect(info.amount).to.be(3000)

      info = await propertyAccount.getRentRegister(gameData.gp, gameData.teams[4]);
      console.log(info);
      expect(info.register.length).to.be(2);
      // Now it is the double amount, as we have both properties of the group!
      expect(info.totalAmount).to.be(2400 * 2 + 600 * 2);
      expect(info.teamId).to.be(gameData.teams[4].uuid);
    })

    it('should pay this value when paying interest to the property account', async () => {
      // DEPENDS on previous test!
      let info = await propertyAccount.getRentRegister(gameData.gp, gameData.teams[4]);
      info     = await propertyAccount.payInterest(gameData.gp, info.register);
      console.log(info);
      // 2 as there are two properties
      expect(info.bookings).to.be(2);
      info = await propertyAccount.getBalance(gameId, gameData.properties[26].uuid);
      console.log(info)
      // Hasliberg: buy -3000, buyHouse -1500, rent 4800 (2400 * 2) = 300
      expect(info.balance).to.be(300);
      expect(info.entries).to.be(3);

      // Les Plans: buy -3000, rent 1200 (600 * 2) = -1800
      info = await propertyAccount.getBalance(gameId, gameData.properties[27].uuid);
      console.log(info)
      expect(info.balance).to.be(-1800);
      expect(info.entries).to.be(2);

      info = await propertyAccount.getPropertyProfitability(gameId, gameData.properties[27].uuid);
      console.log(info);
      expect(info[0].balance).to.be(-1800);
    })

    it('should return a valid account statement for all props', async ()=> {
      let info = await propertyAccount.getAccountStatement(gameId, null);
      console.log(info);
      // this returns ALL account statements from all teams!!
      expect(info.length > 4).to.be(true);
    })

    it('should return a valid account statement for a single property', async ()=> {
      let info = await propertyAccount.getAccountStatement(gameId, gameData.properties[26].uuid);
      console.log(info);
      // 1x buy, 1x house, 1x interest => 3 entries
      expect(info.length).to.be(3);
    })
  })
  describe('some various parameter tests', () => {
    it('should throw an exeption with wrong params in getPropertyProfitability', () => {
      propertyAccount.getPropertyProfitability({}, '1234')
        .then(() => {
          expect(0).to.be(1);
        })
        .catch(ex => {
          console.log(ex);
        })
      propertyAccount.getPropertyProfitability(gameId, {})
        .then(() => {
          expect(0).to.be(1);
        })
        .catch(ex => {
          console.log(ex);
        })
    })
    it('should throw an exeption with wrong params in getBalance', () => {
      propertyAccount.getBalance({}, '1234')
        .then(() => {
          expect(0).to.be(1);
        })
        .catch(ex => {
          console.log(ex);
        })
      propertyAccount.getBalance(gameId, {})
        .then(() => {
          expect(0).to.be(1);
        })
        .catch(ex => {
          console.log(ex);
        })
    })
  })
})
