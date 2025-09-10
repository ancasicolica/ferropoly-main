/**
 * Testing the accessor
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 10.09.2025
 **/

const expect        = require('expect.js');
const db            = require('../../../common/lib/ferropolyDb');
const gameplayModel = require('../../../common/models/gameplayModel');
const settings      = require('../../../main/settings');
const unitTestGame  = require('../../fixtures/unitTestGame');
const accessor      = require('../../../main/lib/accessor');
const gameId        = 'accessor-test'
let gameData        = null;
const adminMail     = 'demo@ferropoly.ch';
const admin2Mail    = 'demo2@ferropoly.ch';
const user1Mail     = 'team1@ferropoly.ch';

describe('Testing the accessor', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    await gameplayModel.setAdmins(gameId, adminMail, [admin2Mail]);
    console.log(gameData);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })

  describe('Admin testing', () => {
    it('should be possible for the admin to access the game', (done) => {
      accessor.verify(adminMail, gameId, accessor.admin)
        .then(() => {
          done();
        })
        .catch(ex => {
          done(ex);
        })
    })
    it('should be possible for the admin 2 to access the game', (done) => {
      accessor.verify(admin2Mail, gameId, accessor.admin)
        .then(() => {
          done();
        })
        .catch(ex => {
          done(ex);
        })
    })
    it('should NOT be possible for the user 1 to access the game', (done) => {
      accessor.verify(user1Mail, gameId, accessor.admin)
        .then(() => {
          done(new Error('This should not be possible'));
        })
        .catch(ex => {
          done();
        })
    })
    it('should NOT be possible for a not existing game', (done) => {
      accessor.verify(adminMail, 'any-id', accessor.admin)
        .then(() => {
          done(new Error('This should not be possible'));
        })
        .catch(ex => {
          done();
        })
    })
  })

  describe('User testing', () => {

    it('should be possible for the admin to access the game', (done) => {
      accessor.verifyPlayer(adminMail, gameId, gameData.teams[0].uuid).then(() => {
        done();
      }).catch((err) => {
        done(err);
      })
    })
    it('should be possible for the owner to access the game', (done) => {
      accessor.verifyPlayer('team0@ferropoly.ch', gameId, gameData.teams[0].uuid).then(() => {
        done();
      }).catch((err) => {
        done(err);
      })
    })
    it('should be possible for a team member to access the game', (done) => {
      accessor.verifyPlayer('team0.member@ferropoly.ch', gameId, gameData.teams[0].uuid).then(() => {
        done();
      }).catch((err) => {
        done(err);
      })
    })
    it('should NOT be possible for another team to access the game', (done) => {
      accessor.verifyPlayer('team1@ferropoly.ch', gameId, gameData.teams[0].uuid).then(() => {
        done(new Error('This should not be possible'));
      }).catch((err) => {
        done();
      })
    })
    it('should NOT be possible for another team member  to access the game', (done) => {
      accessor.verifyPlayer('team0.member@ferropoly.ch', gameId, gameData.teams[1].uuid).then(() => {
        done(new Error('This should not be possible'));
      }).catch((err) => {
        done();
      })
    })
    it('should NOT be possible for a not existing game', (done) => {
      accessor.verifyPlayer('demo@ferropoly.ch', 'any', gameData.teams[0].uuid).then(() => {
        done(new Error('This should not be possible'));
      }).catch((err) => {
        done();
      })
    })

  })
})
