/**
 * Tests for the gameCache
 * Created by kc on 22.04.15.
 */

const expect       = require('expect.js');
const db           = require('../../../common/lib/ferropolyDb');
const settings     = require('../../../main/settings');
const unitTestGame = require('../../fixtures/unitTestGame');
const gameCache = require('../../../main/lib/gameCache');
const {DateTime} = require('luxon');


const gameData = new Map();
const gameId1 = 'game-cache-1';
const gameId2 = 'game-cache-2';
const gameId3 = 'game-cache-3';
const gameId4 = 'game-cache-4';
const gameId5 = 'game-cache-5';
describe('Game Cache Tests', () => {
  before(async () => {
    await db.init(settings);
    gameData.set(gameId1, await unitTestGame.createGame(gameId1, {gameDate: DateTime.now().minus({days: 1})}));
    gameData.set(gameId2, await unitTestGame.createGame(gameId2, {gameDate: DateTime.now().minus({days: 0})}));
    gameData.set(gameId3, await unitTestGame.createGame(gameId3, {gameDate: DateTime.now().plus({days: 1})}));
    console.log(gameData);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId1);
    await unitTestGame.cleanUpGame(gameId2);
    await unitTestGame.cleanUpGame(gameId3);
    await unitTestGame.cleanUpGame(gameId4);
    await unitTestGame.cleanUpGame(gameId5);
    await db.close();
  })

  describe('Refreshing the cache', ()=> {
    it('should work', async ()=> {
      let info = await gameCache.refreshCache();
      console.log(info);

      const cache = gameCache.getCache();
      expect(cache.get(gameId1)).to.be(undefined);
      expect(cache.get(gameId2)).not.to.be(undefined);
      expect(cache.get(gameId3)).to.be(undefined);
      expect(cache.get(gameId4)).to.be(undefined);
    })

    it('works with a game newly added', async ()=> {
      gameData.set(gameId4, await unitTestGame.createGame(gameId4, {gameDate: DateTime.now().minus({days: 0})}));

      await gameCache.refreshCache();
      const cache = gameCache.getCache();
      expect(cache.get(gameId1)).to.be(undefined);
      expect(cache.get(gameId2)).not.to.be(undefined);
      expect(cache.get(gameId3)).to.be(undefined);
      expect(cache.get(gameId4)).not.to.be(undefined);
    })

    it ('should be possible to get a game of today', async ()=> {
       const gp2 = await gameCache.getGameData(gameId2);
       console.log(gp2);
       expect(gp2.gameplay.internal.gameId).to.be(gameId2);
    })

    it ('should also be possible to get any game', async ()=> {
       const gp1 = await gameCache.getGameData(gameId1);
       console.log(gp1);
       expect(gp1.gameplay.internal.gameId).to.be(gameId1);

       // Should not be in the cache afterward
      const cache = gameCache.getCache();
      expect(cache.get(gameId1)).to.be(undefined);
    })

    it('should add a todays game to the cache by getting it', async ()=> {
      gameData.set(gameId5, await unitTestGame.createGame(gameId5, {gameDate: DateTime.now().minus({days: 0})}));

       const gp1 = await gameCache.getGameData(gameId5);
       console.log(gp1);
       expect(gp1.gameplay.internal.gameId).to.be(gameId5);

       // Should be in the cache afterward
      const cache = gameCache.getCache();
      expect(cache.get(gameId5)).not.to.be(undefined);
    })
  })
})
