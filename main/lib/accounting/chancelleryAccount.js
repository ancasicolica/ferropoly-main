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
const chancelleryActions     = require('../../../components/checkin-datastore/lib/chancellery/actions');
const {DateTime}             = require('luxon');
const chancelleryTexts       = require('../../lib/ChancelleryTexts.json');
const logger                 = require('../../../common/lib/logger').getLogger('chancelleryAccount');
let ferroSocket;
let jackpotFull              = {};

/**
 * Internal function: Books the chancellery event in the chancellery and the teams account
 * @param gameplay
 * @param team
 * @param info
 */
async function bookChancelleryEvent(gameplay, team, info) {
  if (!gameplay || !team || !info) {
    throw new Error('invalid params in bookChancelleryEvent');
  }

  /**
   * The internal callbackhandler, sending the new balance to all teams of a game
   */
  async function bookCallback() {
    if (!ferroSocket) {
      // No socket, just return
      return;
    }

    const info = await chancelleryTransaction.getBalance(gameplay.internal.gameId);

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

  if (info.amount > 0) {
    // Positive amount: only bank is involved EXCEPT it is the jackpot
    if (info.jackpot) {
      await teamAccount.receiveFromChancellery(team.uuid, gameplay.internal.gameId, info.amount, info.infoText);

      let entry         = new chancelleryTransaction.Model();
      entry.gameId      = gameplay.internal.gameId;
      entry.transaction = {
        origin: {
          uuid: team.uuid
        },
        amount: Math.abs(info.amount) * (-1),
        info:   info.infoText
      };
      await chancelleryTransaction.book(entry);
      return bookCallback();
    } else {
      await teamAccount.receiveFromBank(team.uuid, gameplay.internal.gameId, info.amount, info.infoText);
      return bookCallback();
    }
  } else {
    // Negative amount: team is charged, amount goes to chancellery
    await teamAccount.chargeToChancellery({
      teamId: team.uuid,
      gameId: gameplay.internal.gameId,
      amount: info.amount,
      info:   info.infoText
    });

    let entry         = new chancelleryTransaction.Model();
    entry.gameId      = gameplay.internal.gameId;
    entry.transaction = {
      origin: {
        uuid: team.uuid
      },
      amount: Math.abs(info.amount),
      info:   info.infoText
    };

    await chancelleryTransaction.book(entry);
    return bookCallback();
  }
}

/**
 * Play chancellery, a random amount is won or lost. This can also be the jackpot
 * @param gameplay
 * @param team
 * @param callback
 */
async function playChancellery(gameplay, team, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in playChancellery');
    return callback(new Error('no callback'));
  }

  if (!gameplay || !team) {
    throw new Error('invalid params in playChancellery');
  }
  let min         = gameplay.gameParams.chancellery.minLottery || 1000;
  let max         = gameplay.gameParams.chancellery.maxLottery || 5000;
  let retVal      = {};
  retVal.amount   = Math.floor((Math.random() * (max - min + 1) + min) / 1000) * 1000;
  retVal.infoText = '';

  let actionRand = _.random(0, jackpotFull[gameplay.internal.gameId] ? 1.2 : 1, true);
  if (actionRand > (gameplay.gameParams.chancellery.probabilityWin + gameplay.gameParams.chancellery.probabilityLoose)) {
    retVal.infoText = 'Parkplatzgewinn';
    retVal.jackpot  = true;
    const info      = await getBalance(gameplay.internal.gameId);

    if (info.balance === 0) {
      // Parkplatz is empty, we have to play another round!
      return await playChancellery(gameplay, team);
    }
    retVal.amount = info.balance;
    await bookChancelleryEvent(gameplay, team, retVal);

    await gameLog.addEntry({
      gameId:    gameplay.internal.gameId,
      category:  gameLog.CAT_CHANCELLERY,
      saveTitle: `"${_.get(team, 'data.name', 'unbekannt')}" gewinnen den Parkplatz: ${info.balance} Fr.`,
      options:   {
        teamId: team.uuid
      }
    });
    return retVal;
  } else {
    if (actionRand < gameplay.gameParams.chancellery.probabilityLoose) {
      retVal.amount *= (-1);
      retVal.infoText = _.sample(chancelleryTexts.loose);
    } else {
      retVal.infoText = _.sample(chancelleryTexts.win);
    }
    await bookChancelleryEvent(gameplay, team, retVal);
    return retVal;
  }
}

// Gambling: the team sets a value and wins it or loses it. Winning it is taken from the bank,
//  losing it goes to the chancellery
async function gamble(gameplay, team, amount, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in gamble');
    return callback(new Error('no callback'));
  }

  let retVal = {
    amount:   amount,
    infoText: 'Chance/Kanzlei (Gambling)'
  };
  await bookChancelleryEvent(gameplay, team, retVal);
  return retVal;
}

/**
 * Pays a given amount to the chancellery, "Parkplatz"
 * @param gameplay
 * @param team
 * @param amount
 * @param text
 * @param callback
 */
async function payToChancellery(gameplay, team, amount, text, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in payToChancellery');
    return callback(new Error('no callback'));
  }

  let retVal = {
    amount:   Math.abs(amount) * (-1),
    infoText: text
  };
  await bookChancelleryEvent(gameplay, team, retVal);
  return retVal;
}

/**
 * Gets the balance
 * @param gameId
 * @param callback callback
 */
async function getBalance(gameId, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in getBalance');
    return callback(new Error('no callback'));
  }

  const info = await chancelleryTransaction.getBalance(gameId);

  if (!info || !info.balance) {
    return {balance: 0};
  }
  return {balance: info.balance};
}

/**
 * Returns all entries of the chancellery
 * @param gameId
 * @param callback
 */
async function getAccountStatement(gameId, callback) {
  if (callback) {
    logger.info('>>>>>>>>  No more callbacks in getAccountStatement');
    return callback(new Error('no callback'));
  }

  if (!gameId) {
    throw new Error('no gameId supplied');
  }
  return await chancelleryTransaction.getEntries(gameId, undefined, DateTime.now());
}


module.exports = {
  playChancellery:     playChancellery,
  getAccountStatement: getAccountStatement,
  getBalance:          getBalance,
  gamble:              gamble,
  payToChancellery:    payToChancellery,


  init: function () {
    ferroSocket = require('../ferroSocket').get();

    if (!ferroSocket) {
      return;
    }
    ferroSocket.on('player-connected', async function (data) {
      if (!ferroSocket) {
        return;
      }

      const info = await getBalance(data.gameId);

      ferroSocket.emitToTeam(data.gameId, data.teamId, 'checkinStore', chancelleryActions.setAsset(info.balance));

      logger.debug(`${data.gameId}: ChancelleryAccount Socket connected`, {
        info,
        gameId: data.gameId,
        teamId: data.teamId
      });
    });

  }
};
