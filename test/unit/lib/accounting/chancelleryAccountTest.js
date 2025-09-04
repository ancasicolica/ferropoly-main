/**
 * Test for the chancellery account
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.09.2025
 **/
const expect                 = require('expect.js');
const chancelleryAccount     = require('../../../../main/lib/accounting/chancelleryAccount');
const teamAccountTransaction = require('../../../../common/models/accounting/teamAccountTransaction');
const chancelleryTransaction = require('../../../../common/models/accounting/chancelleryTransaction');
const db                     = require('../../../../common/lib/ferropolyDb');
const settings               = require('./../../../../main/settings');
const unitTestGame           = require('../../../fixtures/unitTestGame');

let gameData;
const gameId = 'unit-test-chancellery'
describe('Chancellery Account Tests', () => {

  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    chancelleryAccount.init();
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Gambling during the game', () => {

    it('Gambling: winning 1000 works', async () => {
      const result = await chancelleryAccount.gamble(gameData.gp, gameData.teams[1], 1000);
      expect(result.amount).to.be(1000);

      const transactions = await teamAccountTransaction.getEntries(gameId, gameData.teams[1].uuid);
      expect(transactions.length).to.be(1);
      expect(transactions[0].transaction.amount).to.be(1000);
      expect(transactions[0].transaction.parts.length).to.be(0);
      expect(transactions[0].transaction.info).to.be.a('string');

      // Generates NO Entry
      const chances = await chancelleryTransaction.getEntries(gameId);
      expect(chances.length).to.be(0);

      // Check the balance of the team
      const balance = await teamAccountTransaction.getBalance(gameId, gameData.teams[1].uuid);
      expect(balance.asset).to.be(1000);
    });

    it('Gambling: winning 6000 works a second time', async () => {
      const result = await chancelleryAccount.gamble(gameData.gp, gameData.teams[1], 6000);
      expect(result.amount).to.be(6000);

      const transactions = await teamAccountTransaction.getEntries(gameId, gameData.teams[1].uuid);
      expect(transactions.length).to.be(2);
      expect(transactions[1].transaction.amount).to.be(6000);
      expect(transactions[1].transaction.parts.length).to.be(0);
      expect(transactions[1].transaction.info).to.be.a('string');

      // Generates NO Entry
      const chances = await chancelleryTransaction.getEntries(gameId);
      expect(chances.length).to.be(0);

      // Check the balance of the team
      const balance = await teamAccountTransaction.getBalance(gameId, gameData.teams[1].uuid);
      expect(balance.asset).to.be(7000);
    });

    it('Gambling: loosing 4000 works', async () => {
      const result = await chancelleryAccount.gamble(gameData.gp, gameData.teams[1], -4000);
      expect(result.amount).to.be(-4000);

      const transactions = await teamAccountTransaction.getEntries(gameId, gameData.teams[1].uuid);
      expect(transactions.length).to.be(3);
      expect(transactions[2].transaction.amount).to.be(-4000);
      expect(transactions[2].transaction.parts.length).to.be(0);
      expect(transactions[2].transaction.info).to.be.a('string');

      // Generates an Entry
      const chances = await chancelleryTransaction.getEntries(gameId);
      expect(chances.length).to.be(1);

      // Check the balance of the team
      const balance = await teamAccountTransaction.getBalance(gameId, gameData.teams[1].uuid);
      expect(balance.asset).to.be(3000);
    });
  });


  describe('Playing the chancellery generates random data', () => {

    /**
     * This is the core chance function, called multiple times as it is random if we win or lose!
     * @return {Promise<void>}
     */
    async function chance() {
      const startChanceBalance = await chancelleryTransaction.getBalance(gameId);
      const startTeamBalance   = await teamAccountTransaction.getBalance(gameId, gameData.teams[2].uuid);
      const startChanceEntries = await chancelleryTransaction.getEntries(gameId);

      const result = await chancelleryAccount.playChancellery(gameData.gp, gameData.teams[2]);
      const amount = result.amount;
      expect(amount).to.be.a('number');
      console.log(`Gambling amount was ${amount}`);
      console.log('sss', result)
      const jackpot = result.jackpot || false;

      // Generates only an Entry if amount is negative OR it is the parking lot
      const chances = await chancelleryTransaction.getEntries(gameId);
      expect(chances.length).to.be((amount > 0 && !jackpot) ? startChanceEntries.length : startChanceEntries.length + 1);

      // Check the balance of the team
      const balance = await teamAccountTransaction.getBalance(gameId, gameData.teams[2].uuid);
      expect(balance.asset).to.be(startTeamBalance.asset + amount);

      // Check the balance of chance
      const chanceBalance = await chancelleryTransaction.getBalance(gameId);
      console.log('chanceBalance', chanceBalance);
      if (jackpot) {
        expect(chanceBalance.balance).to.be(0);
      } else {
        expect(chanceBalance.balance).to.be(amount > 0 ? startChanceBalance.balance : startChanceBalance.balance - amount);
      }
    }

    it('is a first round for team 2', chance);
    it('is a second round for team 2', chance);
    it('is a third round for team 2', chance);
    it('is a fourth round for team 2', chance);
    it('is a fifth round for team 2', chance);
    it('is a sixth round for team 2', chance);
    it('is a eighth round for team 2', chance);
    it('is a ninth round for team 2', chance);
    it('is a tenth round for team 2', chance);
    it('is a eleventh round for team 2', chance);
    it('is a twelve round for team 2', chance);

  });

  describe('We can pay to the Parkplatz (even if we do not know why???)', ()=> {
    it('should create a chancellery booking', async () => {
      const startChanceBalance = await chancelleryTransaction.getBalance(gameId);
      const startTeamBalance = await teamAccountTransaction.getBalance(gameId, gameData.teams[2].uuid);
      const info = await chancelleryAccount.payToChancellery(gameData.gp, gameData.teams[2], 5000, 'custom text');
      const chanceBalance = await chancelleryTransaction.getBalance(gameId);
      const teamBalance = await teamAccountTransaction.getBalance(gameId, gameData.teams[2].uuid);

      expect(chanceBalance.balance).to.be(startChanceBalance.balance + 5000);
      expect(teamBalance.asset).to.be(startTeamBalance.asset - 5000);
    })
  })

  describe('Getting all entries of the chancellery', () => {
    it('should return all entries', async () => {
      const statement = await chancelleryAccount.getAccountStatement(gameId);
      const chanceEntries = await chancelleryTransaction.getEntries(gameId);

      // Should be of course the same number on both ways
      expect(statement.length).to.be(chanceEntries.length);
    })
  })

  describe('Getting the balance of the chancellery', () => {
    it('should be the same as for the accounting', async () => {
      const a = await chancelleryAccount.getBalance(gameId);
      const b = await chancelleryTransaction.getBalance(gameId);

      // Should be of course the same number on both ways
      expect(a.balance).to.be(b.balance);
    })
  })

});
