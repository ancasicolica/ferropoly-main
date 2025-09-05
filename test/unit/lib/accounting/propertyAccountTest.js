/**
 * Testing the property accounts
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.09.2025
 **/
const expect                 = require('expect.js');
const db                     = require('../../../../common/lib/ferropolyDb');
const settings               = require('../../../../main/settings');
const unitTestGame           = require('../../../fixtures/unitTestGame');
const propertyAccount = require('../../../../main/lib/accounting/propertyAccount');
const propWrap = require('../../../../main/lib/propertyWrapper');
const teamAccount = require('../../../../main/lib/accounting/teamAccount');
const {getSummary} = require('../../../../common/models/accounting/propertyTransaction');
const gameId = 'unit-test-property-account';
let gameData;

describe('Testing the propertyAccount', ()=> {

  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
  })

  after(async () => {
    //await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Buying a property', ()=> {

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

    it('should be possible for a free property (prop 0 / team 0)', async ()=> {
      const propertyToBuy = gameData.properties[0];
      await buyProperty(propertyToBuy, gameData.teams[0]);
      const prop = await propWrap.getProperty(gameId, propertyToBuy.uuid);
      await evaluateValue(propertyToBuy, prop.pricelist.rents.noHouse);
    })

    it('should be possible for a free property (prop 1 / team 0) - DOUBLE', async ()=> {
      const propertyToBuy = gameData.properties[1];
      await buyProperty(propertyToBuy, gameData.teams[0]);
      const prop = await propWrap.getProperty(gameId, propertyToBuy.uuid);
      // It's the double as the whole group belongs to the team
      await evaluateValue(propertyToBuy, prop.pricelist.rents.noHouse * 2);
      // Check also property 0
      await evaluateValue(gameData.properties[0], prop.pricelist.rents.noHouse * 2);
    })

    it('should be possible for a free property (prop 2 / team 1)', async ()=> {
      const propertyToBuy = gameData.properties[2];
      await buyProperty(propertyToBuy, gameData.teams[1]);
      const prop = await propWrap.getProperty(gameId, propertyToBuy.uuid);
      await evaluateValue(propertyToBuy, prop.pricelist.rents.noHouse);
    })

    it('should be possible for a free property (prop 3 / team 2)', async ()=> {
      const propertyToBuy = gameData.properties[3];
      await buyProperty(propertyToBuy, gameData.teams[2]);
      const prop = await propWrap.getProperty(gameId, propertyToBuy.uuid);
      await evaluateValue(propertyToBuy, prop.pricelist.rents.noHouse);
    })

    it('should not be possible for a already taken property', async ()=> {
      const res = await propertyAccount.buyProperty(gameData.gp, gameData.properties[0], gameData.teams[1]);
      console.log(res);
      expect(res).to.be(null);

      // Must still belong to team 0
      const prop = await propWrap.getProperty(gameId, gameData.properties[0].uuid);
      expect(prop.gamedata.owner).to.be(gameData.teams[0].uuid);
    })
  })

  describe('Charging rent', ()=> {
    it('should charge rent from team 1 to team 2 on prop 3', async ()=> {
      // Before the rent, the price of buying the property is in the books
      const propTransBefore =  await getSummary(gameId, gameData.properties[3].uuid );
      console.log(propTransBefore);
      expect(propTransBefore[0].balance).to.be(gameData.properties[3].pricelist.price * -1);

      const balanceTeam1Before = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const balanceTeam2Before = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      const res = await propertyAccount.chargeRent(gameData.gp, gameData.properties[3], gameData.teams[1].uuid);
      console.log(res);
      expect(res.property.uuid === gameData.properties[3].uuid);
      expect(res.owner === gameData.teams[2].uuid);
      expect(res.amount === gameData.properties[3].pricelist.rents.noHouse);

      const balanceTeam1After = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const balanceTeam2After = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);

      // Check if the transactions were made
      expect(balanceTeam1Before.asset - balanceTeam1After.asset).to.be(gameData.properties[3].pricelist.rents.noHouse);
      expect(balanceTeam2Before.asset - balanceTeam2After.asset).to.be(gameData.properties[3].pricelist.rents.noHouse * -1);

      const propTransAfter =  await getSummary(gameId, gameData.properties[3].uuid )
      console.log(propTransBefore, propTransAfter)
      expect(propTransAfter[0].balance - propTransBefore[0].balance).to.be(gameData.properties[3].pricelist.rents.noHouse);
    })

    it('should do nothing if the owning team is on the property', async ()=> {
      const propTransBefore =  await getSummary(gameId, gameData.properties[3].uuid );
      const balanceTeam2Before = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      const res = await propertyAccount.chargeRent(gameData.gp, gameData.properties[3], gameData.teams[2].uuid);
      expect(res.property.uuid === gameData.properties[3].uuid);
      expect(res.owner === gameData.teams[2].uuid);
      expect(res.amount === gameData.properties[3].pricelist.rents.noHouse);
      const balanceTeam2After = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);

      // No effect!
      expect(balanceTeam2Before.asset - balanceTeam2After.asset).to.be(0);
      const propTransAfter =  await getSummary(gameId, gameData.properties[3].uuid )
      console.log(propTransBefore, propTransAfter)
      expect(propTransAfter[0].balance - propTransBefore[0].balance).to.be(0);
    })
  })
})
