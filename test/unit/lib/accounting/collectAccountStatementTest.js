/**
 * Tests the collect Account Statement
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 05.09.2025
 **/
const expect                 = require('expect.js');
const collectAccountStatement = require('../../../../main/lib/accounting/collectAccountStatement');
const db                     = require('../../../../common/lib/ferropolyDb');
const settings               = require('./../../../../main/settings');
const unitTestGame           = require('../../../fixtures/unitTestGame');
const chancelleryAccount = require('../../../../main/lib/accounting/chancelleryAccount');
const gameId = 'unit-test-collect-account';
let gameData;

describe('collectAccountStatement Testing', ()=> {

  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    chancelleryAccount.init();
    // Create some bookings
    await chancelleryAccount.gamble(gameData.gp, gameData.teams[1], 1000);
    await chancelleryAccount.gamble(gameData.gp, gameData.teams[1], 3000);
    await chancelleryAccount.gamble(gameData.gp, gameData.teams[1], 4000);
    await chancelleryAccount.gamble(gameData.gp, gameData.teams[1], 5000);
    await chancelleryAccount.gamble(gameData.gp, gameData.teams[1], -3000);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  it('should have 5 transactions for team 1',  async ()=> {
    const res = await collectAccountStatement({params: {gameId: gameId, teamId: gameData.teams[1].uuid}});
    console.log(res);
    expect(res.accountData.length).to.be(5);
    expect(res.accountData[4].balance).to.be(10000);
  })

  it('should have 0 transactions for team 1 in the past',  async ()=> {
    const res = await collectAccountStatement({params: {gameId: gameId, teamId: gameData.teams[1].uuid}, query:{start: '2020-01-01', end: '2020-01-02'}});
    console.log(res);
    expect(res.accountData.length).to.be(0);
  })

  it('should have 5 transactions for team 1 over all the time',  async ()=> {
    const res = await collectAccountStatement({params: {gameId: gameId, teamId: gameData.teams[1].uuid}, query:{start: '2020-01-01', end: '2040-01-02'}});
    console.log(res);
    expect(res.accountData.length).to.be(5);
  })

  it('should have 0 transactions for team 0',  async ()=> {
    const res = await collectAccountStatement({params: {gameId: gameId, teamId: gameData.teams[0].uuid}});
    console.log(res);
    expect(res.accountData.length).to.be(0);
  })
})
