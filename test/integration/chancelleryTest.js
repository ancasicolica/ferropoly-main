/**
 *
 * Created by kc on 29.04.15.
 */
'use strict';


var expect = require('expect.js');
var _ = require('lodash');

var db = require('./../../common/lib/ferropolyDb');
var gameCache = require('../../main/lib/gameCache');
var marketplace = require('../../main/lib/accounting/marketplace').createMarketplace(null);
var teamAccount = require('../../main/lib/accounting/teamAccount');
var chancelleryAccount = require('../../main/lib/accounting/chancelleryAccount');

var ct = require('../../common/models/accounting/chancelleryTransaction');
var settings = require('./../../main/settings');

var gameId;
var gameData;
var chancellery = {};

function handleLotteryResult(teamIndex, info) {
  console.log(info);
  gameData.teams[teamIndex].expectedMoney += info.amount;
  if (info.amount !== 0) {
    gameData.teams[teamIndex].expectedEntries++;
  }
  if (info.jackpot) {
    chancellery.expectedMoney -= info.amount;
  }
  else if (info.amount < 0) {
    chancellery.expectedMoney += Math.abs(info.amount);
  }
  console.log(chancellery);
}

describe('Chancellery tests', function () {
  this.timeout(5000);
  before(function (done) {
    require('../fixtures/demoGamePlay').createDemo({}, function (err, res) {
      gameId = res.gameId;
      db.init(settings, function (err) {
        gameCache.getGameData(gameId, function (err, gd) {
          if (err) {
            console.error(err);
            done(err);
          }
          gameData = {
            gameplay: gd.gameplay,
            teams: _.values(gd.teams)
          };
          chancellery.expectedMoney = 0;

          for (var i = 0; i < gameData.teams.length; i++) {
            gameData.teams[i].expectedMoney = 0;
            gameData.teams[i].expectedEntries = 0;
          }
          done();
        });
      });
    });
  });

  after(function(done) {
    db.close(function(err) {
      done(err);
    })
  });

  describe('Playing the lottery', function () {
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it (using marketplace interface)', function (done) {
      marketplace.chancellery(gameData.gameplay.internal.gameId, gameData.teams[0].uuid, function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it (using marketplace interface)', function (done) {
      marketplace.chancellery(gameData.gameplay.internal.gameId, gameData.teams[0].uuid, function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it (using marketplace interface)', function (done) {
      marketplace.chancellery(gameData.gameplay.internal.gameId, gameData.teams[0].uuid, function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it (using marketplace interface)', function (done) {
      marketplace.chancellery(gameData.gameplay.internal.gameId, gameData.teams[0].uuid, function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it (using marketplace interface)', function (done) {
      marketplace.chancellery(gameData.gameplay.internal.gameId, gameData.teams[0].uuid, function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        console.log(chancellery);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it (using marketplace interface)', function (done) {
      marketplace.chancellery(gameData.gameplay.internal.gameId, gameData.teams[0].uuid, function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it (using marketplace interface)', function (done) {
      marketplace.chancellery(gameData.gameplay.internal.gameId, gameData.teams[0].uuid, function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        expect(info.infoText).to.be.a('string');
        expect(info.amount).to.be.a('number');
        handleLotteryResult(0, info);
        console.log(chancellery);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        done(err);
      })
    });
    it('should do it', function (done) {
      chancelleryAccount.playChancellery(gameData.gameplay, gameData.teams[0], function (err, info) {
        handleLotteryResult(0, info);
        console.log(chancellery);
        done(err);
      })
    });
  });
  describe('Verify the accounts', function () {
    it('should have the correct value on the users account', function (done) {
      teamAccount.getBalance(gameId, gameData.teams[0].uuid, function (err, info) {
        expect(info.asset).to.be(gameData.teams[0].expectedMoney);
        expect(info.count).to.be(gameData.teams[0].expectedEntries);
        done(err);
      });
    });
    it('should have the correct value on the chancellery account', function (done) {
      chancelleryAccount.getBalance(gameId,  function (err, info) {
        expect(info.balance).to.be(chancellery.expectedMoney);
       // expect(info.entries).to.be(gameData.teams[0].expectedEntries);
        done(err);
      });
    });
  });
  describe('Gambling', function() {
    it('should add some money if they win', function(done){
      chancelleryAccount.gamble(gameData.gameplay, gameData.teams[1], 12000, function(err, info){
        expect(info.amount).to.be(12000);
        expect(info.infoText).to.be.a('string');
        gameData.teams[1].expectedMoney = 12000;
        gameData.teams[1].expectedEntries++;
        done(err);
      });
    });
    it('should subtract some money if they loose', function(done){
      chancelleryAccount.gamble(gameData.gameplay, gameData.teams[1], -8000, function(err, info){
        expect(info.amount).to.be(-8000);
        expect(info.infoText).to.be.a('string');
        gameData.teams[1].expectedMoney = 4000;
        gameData.teams[1].expectedEntries++;
        chancellery.expectedMoney += 8000;
        done(err);
      });
    });
    it('should add some money if they win (marketplace interface)', function(done){
      marketplace.chancelleryGamble(gameData.gameplay.internal.gameId, gameData.teams[1].uuid, 5555, function(err, info){
        expect(info.amount).to.be(5555);
        expect(info.infoText).to.be.a('string');
        gameData.teams[1].expectedMoney += 5555;
        gameData.teams[1].expectedEntries++;
        done(err);
      });
    });
    it('should subtract some money if they loose (marketplace interface)', function(done){
      marketplace.chancelleryGamble(gameData.gameplay.internal.gameId, gameData.teams[1].uuid, -1235, function(err, info){
        expect(info.amount).to.be(-1235);
        expect(info.infoText).to.be.a('string');
        gameData.teams[1].expectedMoney -= 1235;
        gameData.teams[1].expectedEntries++;
        chancellery.expectedMoney += 1235;
        done(err);
      });
    });
    describe('checking the accounts', function() {
      it('should have the correct value on the users account', function (done) {
        teamAccount.getBalance(gameId, gameData.teams[1].uuid, function (err, info) {
          expect(info.asset).to.be(gameData.teams[1].expectedMoney);
          expect(info.count).to.be(gameData.teams[1].expectedEntries);
          done(err);
        });
      });
      it('should have the correct value on the chancellery account', function (done) {
        chancelleryAccount.getBalance(gameId,  function (err, info) {
          expect(info.balance).to.be(chancellery.expectedMoney);
           done(err);
        });
      });
    });
  });
});
