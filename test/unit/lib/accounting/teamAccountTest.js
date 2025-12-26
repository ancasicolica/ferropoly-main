/**
 * Testing the team account
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 08.09.2025
 **/
const expect                    = require('expect.js');
const db                        = require('../../../../common/lib/ferropolyDb');
const settings                  = require('../../../../main/settings');
const unitTestGame              = require('../../../fixtures/unitTestGame');
const teamAccount               = require('../../../../main/lib/accounting/teamAccount');
const {DateTime}                = require('luxon');
const {TEAM_TRANSACTION_MANUAL} = require('../../../../common/models/accounting/teamAccountTransactionTypes');
const gameId                    = 'unit-test-team-account';
let gameData;

describe('Testing the teamAccount', () => {

  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Testing negative balance', () => {

    it('should calculate an interest for negative accounts', async () => {
      let info = await teamAccount.chargeToBank({
        teamId: gameData.teams[0].uuid,
        gameId,
        amount: 10000,
        type:   TEAM_TRANSACTION_MANUAL
      });
      expect(info.amount).to.be(-10000);
      info = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      expect(info.asset).to.be(-10000);
      expect(info.count).to.be(1);

      info = await teamAccount.negativeBalanceHandling(gameId, gameData.teams[0].uuid, 20);
      expect(info.amount).to.be(2000);
      // IMPORTANT: this was only a calculation, no bookings done!
    })

    it('should not calculate an interest for positive accounts', async () => {
      let info = await teamAccount.receiveFromBank(gameData.teams[0].uuid, gameId, 20000, '', TEAM_TRANSACTION_MANUAL);
      expect(info.amount).to.be(20000);

      info = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      expect(info.asset > 0).to.be(true);
      expect(info.count).to.be(2);
      let assetBefore = info.asset;

      info = await teamAccount.negativeBalanceHandling(gameId, gameData.teams[0].uuid, 20);
      console.log(info);
      expect(info.amount).to.be(0);

      info = await teamAccount.getBalance(gameId, gameData.teams[0].uuid);
      console.log(info);
      expect(info.asset).to.be(assetBefore);
      expect(info.count).to.be(2);
    })
  })

  describe('Get the ranking list', () => {
    before(async () => {
      await teamAccount.receiveFromBank(gameData.teams[1].uuid, gameId, 15000, '', TEAM_TRANSACTION_MANUAL);
      await teamAccount.receiveFromChancellery(gameData.teams[2].uuid, gameId, 10000);
      await teamAccount.receiveFromBank(gameData.teams[3].uuid, gameId, 5000, '', TEAM_TRANSACTION_MANUAL);
    })
    it('should return the ranking list', async () => {
      let info = await teamAccount.getRankingList(gameId);
      console.log(info);
      expect(info.length).to.be(4);
      expect(info[0].asset).to.be(15000);
      expect(info[0].rank).to.be(1);
    })
  })

  describe('Get the account statements', () => {
    before(async () => {
      for (let i = 0; i < 10; i++) {
        await teamAccount.receiveFromBank(gameData.teams[4].uuid, gameId, 200, '', TEAM_TRANSACTION_MANUAL);
      }
    })
    it('should return all statements with no time limits', async () => {
      let info = await teamAccount.getAccountStatement(gameId, gameData.teams[4].uuid);
      console.log(info);
      expect(info.length).to.be(10);
      expect(info[0].transaction.amount).to.be(200);
      expect(info[0].gameId).to.be(gameId);
      expect(info[0].teamId).to.be(gameData.teams[4].uuid)
    })
    it('should return no statements with expired time limits', async () => {
      let info = await teamAccount.getAccountStatement(gameId, gameData.teams[4].uuid, DateTime.fromISO('2020-01-01'), DateTime.fromISO('2020-01-02'));
      console.log(info);
      expect(info.length).to.be(0);
    })
    it('should return all statements with correct time limits', async () => {
      let info = await teamAccount.getAccountStatement(gameId, gameData.teams[4].uuid, DateTime.fromISO('2020-01-01'), DateTime.fromISO('2050-01-02'));
      console.log(info);
      expect(info.length).to.be(10);
    })
  })

  describe('Charging money to another team', () => {
    it('must charge the amount', async () => {
      const team1Before = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const team2Before = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      console.log(team1Before, team2Before);

      // Team 1 pays Team 2
      let info = await teamAccount.chargeToAnotherTeam({
        gameId,
        debitorTeamId:  gameData.teams[1].uuid,
        creditorTeamId: gameData.teams[2].uuid,
        info:           'test',
        amount:         1000
      });

      expect(info.amount).to.be(1000);

      const team1After = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const team2After = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);

      expect(team1After.asset + 1000).to.be(team1Before.asset);
      expect(team2After.asset - 1000).to.be(team2Before.asset);

      const team1Statement = await teamAccount.getAccountStatement(gameId, gameData.teams[1].uuid);
      const team1Booking   = team1Statement.slice(-1)[0];
      console.log(team1Statement, team1Statement[1].transaction)
      console.log('xx', team1Booking);
      expect(team1Booking.transaction.origin.uuid).to.be(gameData.teams[2].uuid);
      expect(team1Booking.transaction.amount).to.be(-1000);
      expect(team1Booking.transaction.info).to.be('test');

      const team2Statement = await teamAccount.getAccountStatement(gameId, gameData.teams[2].uuid);
      const team2Booking   = team2Statement.slice(-1)[0];
      console.log(team2Statement, team2Statement[1].transaction)
      console.log('yy', team2Booking);
      expect(team2Booking.transaction.origin.uuid).to.be(gameData.teams[1].uuid);
      expect(team2Booking.transaction.amount).to.be(1000);
      expect(team2Booking.transaction.info).to.be('test');
    })

    it('happens nothing with value 0', async () => {
      const team1Before = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const team2Before = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);
      console.log(team1Before, team2Before);

      // Team 1 pays Team 2
      let info = await teamAccount.chargeToAnotherTeam({
        gameId,
        debitorTeamId:  gameData.teams[1].uuid,
        creditorTeamId: gameData.teams[2].uuid,
        info:           'test',
        amount:         0
      });

      expect(info.amount).to.be(0);

      const team1After = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      const team2After = await teamAccount.getBalance(gameId, gameData.teams[2].uuid);

      expect(team1After.asset).to.be(team1Before.asset);
      expect(team2After.asset).to.be(team2Before.asset);
    })

    it('goes wrong if the amount is missing', done => {
      teamAccount.chargeToAnotherTeam({
        gameId,
        debitorTeamId:  gameData.teams[1].uuid,
        creditorTeamId: gameData.teams[2].uuid,
        info:           'test',
        type:           TEAM_TRANSACTION_MANUAL
      }).then(() => {
          done(new Error('should not happen'));
        }
      ).catch(() => {
        done()
      })
    })
    it('goes wrong if the teamId is invalid', done => {
      teamAccount.chargeToAnotherTeam({
        gameId,
        debitorTeamId:  gameData.teams[1].uuid,
        creditorTeamId: gameData.teams[2],
        info:           'test',
        amount:         1000,
        type:           TEAM_TRANSACTION_MANUAL
      }).then(() => {
          done(new Error('should not happen'));
        }
      ).catch(() => {
        done()
      })
    })
  })

  describe('Paying interests', () => {
    it('should work for a positive amount', async () => {
      const team1Before = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      await teamAccount.payInterest(gameData.teams[1].uuid, gameId, 1000)
      const team1After = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);

      expect(team1After.asset - team1Before.asset).to.be(1000);
    })
    it('should work for an amount of 0', async () => {
      const team1Before = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      await teamAccount.payInterest(gameData.teams[1].uuid, gameId, 0)
      const team1After = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);

      expect(team1After.asset - team1Before.asset).to.be(0);
    })
    it('should work for a negative amount', async () => {
      const team1Before = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);
      await teamAccount.payInterest(gameData.teams[1].uuid, gameId, -1000)
      const team1After = await teamAccount.getBalance(gameId, gameData.teams[1].uuid);

      expect(team1After.asset - team1Before.asset).to.be(-1000);
    })
  })
});
