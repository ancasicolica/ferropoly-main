/**
 * The account for the chancellery ("Chance / Kanzlei"): negative intersts are deposed
 * here, lucky winners get the pot then.
 *
 * The questions where teams can loose or earn money are not (??) part of this chancellery,
 * this goes to the bank. An alternative would be, that if a team looses money in this games,
 * the money comes into this pot. Todo: check the money flow for the questions
 * Created by kc on 20.04.15.
 */

const chancelleryTransaction = require('../../../common/models/accounting/chancelleryTransaction');
const gameLog                = require('../gameLog');
const teamAccount            = require('./teamAccount');
const _                      = require('lodash');
const moment                 = require('moment');
const chancelleryActions     = require('../../../components/checkin-datastore/lib/chancellery/actions');
const logger                 = require('../../../common/lib/logger').getLogger('chancelleryAccount');
let ferroSocket;
let jackpotFull              = {};

/**
 * Internal function: Books the chancellery event in the chancellery and the teams account
 * @param gameplay
 * @param team
 * @param info
 * @param callback
 */
function bookChancelleryEvent(gameplay, team, info, callback) {
  if (!gameplay || !team || !info) {
    return callback(new Error('invalid params in bookChancelleryEvent'));
  }

  /**
   * The internal callbackhandler, sending the new balance to all teams of a game
   * @param err
   */
  function bookCallback(err) {
    if (!ferroSocket) {
      // No socket, just return
      return callback(err);
    }

    chancelleryTransaction.getBalance(gameplay.internal.gameId).then(info => {
      if (!err) {
        if (info.balance > gameplay.gameParams.chancellery.maxJackpotSize) {
          logger.info(`${_.get(gameplay, 'internal.gameId', 'n/a')}: Jackpot is too large, increased chance for winning!`, {gameId: _.get(gameplay, 'internal.gameId', 'n/a')});
          jackpotFull[gameplay.internal.gameId] = true;
        } else {
          jackpotFull[gameplay.internal.gameId] = false;
        }
        if (ferroSocket) {
          ferroSocket.emitToGame(gameplay.internal.gameId, 'checkinStore', chancelleryActions.setAsset(info.balance));
          ferroSocket.emitToAdmins(gameplay.internal.gameId, 'admin-chancelleryAccount', {balance: info.balance});
        }
      }
      callback();
    });
  }

  if (info.amount > 0) {
    // Positive amount: only bank is involved EXCEPT it is the jackpot
    if (info.jackpot) {
      return teamAccount.receiveFromChancellery(team.uuid, gameplay.internal.gameId, info.amount, info.infoText, function (err) {
        if (err) {
          return callback(err);
        }
        let entry         = new chancelleryTransaction.Model();
        entry.gameId      = gameplay.internal.gameId;
        entry.transaction = {
          origin: {
            uuid: team.uuid
          },
          amount: Math.abs(info.amount) * (-1),
          info  : info.infoText
        };

        chancelleryTransaction
          .book(entry)
          .then(() => {
            bookCallback();
          })
          .catch(bookCallback);
      });
    } else {
      return teamAccount.receiveFromBank(team.uuid, gameplay.internal.gameId, info.amount, info.infoText, function (err) {
        return bookCallback(err);
      });
    }
  } else {
    // Negative amount: team is charged, amount goes to chancellery
    return teamAccount.chargeToChancellery({
      teamId: team.uuid,
      gameId: gameplay.internal.gameId,
      amount: info.amount,
      info  : info.infoText
    }, function (err) {
      if (err) {
        return callback(err);
      }
      let entry         = new chancelleryTransaction.Model();
      entry.gameId      = gameplay.internal.gameId;
      entry.transaction = {
        origin: {
          uuid: team.uuid
        },
        amount: Math.abs(info.amount),
        info  : info.infoText
      };

      chancelleryTransaction
        .book(entry)
        .then(() => {
          bookCallback();
        }).catch(bookCallback);
    });
  }
}

/**
 * Play chancellery, a random amount is won or lost. This can also be the jackpot
 * @param gameplay
 * @param team
 * @param callback
 */
function playChancellery(gameplay, team, callback) {
  if (!gameplay || !team) {
    return callback(new Error('invalid params in playChancellery'));
  }
  let min         = gameplay.gameParams.chancellery.minLottery || 1000;
  let max         = gameplay.gameParams.chancellery.maxLottery || 5000;
  let retVal      = {};
  retVal.amount   = Math.floor((Math.random() * (max - min + 1) + min) / 1000) * 1000;
  retVal.infoText = 'Chance/Kanzlei: ';

  let actionRand = _.random(0, jackpotFull[gameplay.internal.gameId] ? 1.2 : 1, true);
  if (actionRand > (gameplay.gameParams.chancellery.probabilityWin + gameplay.gameParams.chancellery.probabilityLoose)) {
    retVal.infoText = 'Parkplatzgewinn';
    retVal.jackpot  = true;
    getBalance(gameplay.internal.gameId, function (err, info) {
      if (err) {
        return callback(err);
      }
      if (info.balance === 0) {
        // Parkplatz is empty, we have to play another round!
        return playChancellery(gameplay, team, callback);
      }
      retVal.amount = info.balance;
      bookChancelleryEvent(gameplay, team, retVal, function (err) {
        if (err) {
          return callback(err, retVal);
        }
        return gameLog.addEntry({
            gameId   : gameplay.internal.gameId,
            category : gameLog.CAT_CHANCELLERY,
            saveTitle: `"${_.get(team, 'data.name', 'unbekannt')}" gewinnen den Parkplatz: ${info.balance} Fr.`,
            options  : {
              teamId: team.uuid
            }
          },
          function (err) {
            return callback(err, retVal);
          });
      });
    });
  } else {
    if (actionRand < gameplay.gameParams.chancellery.probabilityLoose) {
      retVal.amount *= (-1);
      retVal.infoText += ' Verlust';
    } else {
      retVal.infoText += 'Gewinn';
    }
    bookChancelleryEvent(gameplay, team, retVal, function (err) {
      return callback(err, retVal);
    });
  }
}

// Gambling: the team sets a value and wins it or looses it. Winning it is taken from bank,
// loosing it goes to the chancellery
function gamble(gameplay, team, amount, callback) {
  let retVal = {
    amount  : amount,
    infoText: 'Chance/Kanzlei (Gambling)'
  };
  bookChancelleryEvent(gameplay, team, retVal, function (err) {
    return callback(err, retVal);
  });
}

/**
 * Pays a given amount to the chancellery, "Parkplatz"
 * @param gameplay
 * @param team
 * @param amount
 * @param text
 * @param callback
 */
function payToChancellery(gameplay, team, amount, text, callback) {
  let retVal = {
    amount  : Math.abs(amount) * (-1),
    infoText: text
  };
  bookChancelleryEvent(gameplay, team, retVal, function (err) {
    return callback(err, retVal);
  });
}

/**
 * Gets the balance
 * @param gameId
 * @param callback callback
 */
function getBalance(gameId, callback) {
  chancelleryTransaction.getBalance(gameId).then(info => {
    if (!info || !info.balance) {
      return callback(null, {balance: 0});
    }
    callback(null, {balance: info.balance});
  }).catch(callback);
}

/**
 * Returns all entries of the chancellery
 * @param gameId
 * @param callback
 */
function getAccountStatement(gameId, callback) {
  if (!gameId) {
    return callback(new Error('no gameId supplied'));
  }
  chancelleryTransaction.getEntries(gameId, undefined, moment()).then(data => {
    callback(null, data);
  }).catch(callback);
}


module.exports = {
  playChancellery    : playChancellery,
  getAccountStatement: getAccountStatement,
  getBalance         : getBalance,
  gamble             : gamble,
  payToChancellery   : payToChancellery,


  init: function () {
    ferroSocket = require('../ferroSocket').get();

    if (!ferroSocket) {
      return;
    }
    ferroSocket.on('player-connected', function (data) {
      if (!ferroSocket) {
        return;
      }

      getBalance(data.gameId, function (err, info) {
        if (err) {
          logger.error(`${data.gameId}: Error in chancelleryAccount.init`, err);
          return;
        }
        ferroSocket.emitToTeam(data.gameId, data.teamId, 'checkinStore', chancelleryActions.setAsset(info.balance));

        logger.debug(`${data.gameId}: ChancelleryAccount Socket connected`, {
          info,
          gameId: data.gameId,
          teamId: data.teamId
        });
      });
    });
  }
};
