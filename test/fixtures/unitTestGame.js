/**
 * Creates and deletes the game structure for a unit test game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 04.09.2025
 **/

const gameplayModel              = require('../../common/models/gameplayModel');
const teamModel                  = require('../../common/models/teamModel');
const propertyModel              = require('../../common/models/propertyModel');
const schedulerEventModel        = require('../../common/models/schedulerEventModel');
const picBucketModel             = require('../../common/models/picBucketModel');
const travelLogModel             = require('../../common/models/travelLogModel');
const gameLogModel               = require('../../common/models/gameLogModel');
const rulesModel                 = require('../../common/models/rulesModel');
const chancelleryTransaction     = require('../../common/models/accounting/chancelleryTransaction');
const propertyAccountTransaction = require('../../common/models/accounting/propertyTransaction');
const teamAccountTransaction     = require('../../common/models/accounting/teamAccountTransaction');
const unitTestProperties         = require('./properties.json');
const {DateTime}                 = require('luxon');


const createGame = async function (gameId = 'unit-test', options = {}) {

  const exists = gameplayModel.checkIfGameIdExists(gameId);
  if (exists) {
    console.log(`Data with gameId = ${gameId} exists, deleting!`);
    await cleanUpGame(gameId);
  }

  console.log(`CREATING new gameplay ${gameId}`);
  const gp = await gameplayModel.createGameplay({
    map:       'sbb', ownerEmail: 'demo@ferropoly.ch', name: gameId, gameId: gameId,
    gameDate:  options.gameDate || DateTime.now().toJSDate(),
    gameStart: options.gameStart || '03:00',
    gameEnd:   options.gameEnd || '23:00'
  });
  await gameplayModel.saveNewPriceListRevision(gp);
  await gameplayModel.finalize(gameId, 'demo@ferropoly.ch');

  const team0 = await teamModel.createTeam({
    data: {
      name:       'Team 0',
      members:    ['team0.member@ferropoly.ch'],
      teamLeader: {email: 'team0@ferropoly.ch'}
    }
  }, gameId);
  const team1 = await teamModel.createTeam({data: {name: 'Team 1', teamLeader: {email: 'team1@ferropoly.ch'}}}, gameId);
  const team2 = await teamModel.createTeam({data: {name: 'Team 3', teamLeader: {email: 'team2@ferropoly.ch'}}}, gameId);
  const team3 = await teamModel.createTeam({data: {name: 'Team 3', teamLeader: {email: 'team3@ferropoly.ch'}}}, gameId);
  const team4 = await teamModel.createTeam({data: {name: 'Team 4', teamLeader: {email: 'team4@ferropoly.ch'}}}, gameId);
  const team5 = await teamModel.createTeam({data: {name: 'Team 5', teamLeader: {email: 'team5@ferropoly.ch'}}}, gameId);

  const properties = [];
  for (let prop of unitTestProperties) {
    properties.push(await propertyModel.addPropertyForUnitTest(gameId, prop));
  }
  properties.sort((a, b) => {
    return a.pricelist.position < b.pricelist.position ? -1 : 0
  })


  return {gp, teams: [team0, team1, team2, team3, team4, team5], properties};
}

const cleanUpGame = async function (gameId = 'unit-test') {
  await gameplayModel.removeGameplay({internal: {gameId: gameId}});
  await teamModel.deleteAllTeams(gameId);
  await propertyModel.removeAllPropertiesFromGameplay(gameId);
  await propertyAccountTransaction.dumpAccounts(gameId);
  await teamAccountTransaction.dumpAccounts(gameId)
  await chancelleryTransaction.dumpChancelleryData(gameId);
  await schedulerEventModel.dumpEvents(gameId);
  await picBucketModel.deletePicBucket(gameId);
  await travelLogModel.deleteAllEntries(gameId);
  await gameLogModel.deleteAllEntries(gameId);
  await rulesModel.deleteRules(gameId);
}

module.exports = {
  createGame,
  cleanUpGame
}
