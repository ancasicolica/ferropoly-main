/**
 * This is the ferropoly socket to the main game
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 16.12.21
 **/

import {io} from 'socket.io-client';
import EventEmitter from '../common/lib/eventEmitter'
import {useTeamAccountStore} from './store/TeamAccountStore';
import {usePropertyStore} from './store/PropertyStore';
import {usePicBucketStore} from './store/PicBucketStore';
import {useTravelLogStore} from './store/TravelLogStore';
import {getMapRoutesInstance} from './MapRoutes';
import {useGameLogStore} from './store/GameLogStore';
import {useChancelleryStore} from './store/ChancelleryStore';

class FerropolySocket extends EventEmitter {
  constructor(options) {
    super();
    let self        = this;
    this.socket     = io(options.url);
    this.store      = options.store;
    this.options    = options;
    this.logEnabled = true;
    this.connected  = false;

    console.log('Socket created');

    this.handlers = this.getHandlers();

    this.socket.on('connect', () => {
      console.log('socket.io connect');
      self.connected = true;
    })
    this.socket.on('disconnect', () => {
      console.log('socket.io disconnect');
      self.emit('disconnected');
      self.connected = false;
    })

    // Handler for all events
    this.socket.onAny((eventName, msg) => {
      if (self.handlers[eventName]) {
        self.logSocketEvent(eventName, msg);
        self.handlers[eventName](msg);
      } else if (this.logEnabled) {
        console.warn(`Unhandled socket.io event: ${eventName}`, msg);
      }
    })
  }

  /**
   * Returns the handlers
   * ®returns {}
   */
  getHandlers() {
    let self = this;
    return {
      'identify':              () => {
        console.log('identify', self.options);
        self.socket.emit('identify', {
          user:      self.options.user,
          teamId:    self.options.teamId,
          authToken: self.options.authToken,
          gameId:    self.options.gameId
        })
      },
      'welcome':               () => {
        console.log('Welcome!');
      },
      'initialized':           (msg) => {
        if (msg.isPlayer) {
          console.log('PLAYER socket initialized');
        }
        if (msg.isAdmin) {
          console.log('ADMIN socket initialized');
        }
        self.emit('connected');
      },
      'building-allowed':      () => {
        // Building is allowed again, no payload. This is for general purpose
        // Payload: none
        this.emit('building-allowed');
      },
      'team-property-update':  msg => {
        // A property was updated, info only relevant for teams
        // Payload: updated property
        usePropertyStore().updateProperty(msg);
      },
      'team-property-account': msg => {
        // A new entry for the property account (a booking) for a teams property.
        // Payload: property and transaction (part of only, for maintaining privacy)
        usePropertyStore().updateTransactions(msg.property.uuid, [msg.transaction]).catch(err => {
          console.error(err);
        })
      },
      'team-account':          msg => {
        // A new account information for a team
        if (msg.cmd === 'onTransaction') {
          useTeamAccountStore().loadTeamAccountEntries(msg.data.gameId, msg.data.teamId)
            .catch(err => {
              console.error(err)
            });
        } else {
          console.warn('Unhandled command for admin-teamAccount', msg);
        }
      },
      'admin-teamAccount':     msg => {
        if (msg.cmd === 'onTransaction') {
          useTeamAccountStore().loadTeamAccountEntries(msg.data.gameId, msg.data.teamId)
            .catch(err => {
              console.error(err)
            });
        } else {
          console.warn('Unhandled command for admin-teamAccount', msg);
        }
      },
      'admin-propertyAccount': msg => {
        if (msg.cmd === 'buildingBuilt' || msg.cmd === 'propertyBought' || msg.cmd === 'propertyReset' || msg.cmd === 'rent') {
          usePropertyStore().updateProperty(msg.property)
        } else {
          console.warn('Unhandled command for admin-propertyAccount', msg);
        }
        //  self.store.dispatch({type: 'fetchRankingList'});
        //  self.store.dispatch({type: 'propertyRegister/updatePropertyInPricelist', property: msg.property});
      },
      'chancellery-balance':   msg => {
        // Info about
        useChancelleryStore().setBalance(msg.balance);
      },
      'admin-properties':      msg => {
        console.warn('Message should be handled 2', msg);
      },
      'admin-marketplace':     msg => {
        console.warn('Message should be handled 3', msg);
      },
      'admin-rents-paid':      msg => {
        console.warn('Message should be handled 4', msg);
      },
      'game-log':              msg => {
        useGameLogStore().addLogEntry(msg);
      },
      'player-position':       msg => {
        console.log('PLAYER position', msg);
        useTravelLogStore().addLogEntries([msg]);
        getMapRoutesInstance().refreshRoutes();
      },
      'pic':                   msg => {
        console.log('new pic', msg);
        usePicBucketStore().addPicture(msg);
      },
      'general':               msg => {
        if (msg.cmd === 'rentsPaid') {
          usePropertyStore().update().catch(err => {
            console.error(err);
          });
        } else {
          console.log('not handled in general socket', msg);
        }
      }
    };
  }

  /**
   * Allows the addition of an additional handler for an event which is not of a generic nature:
   * e.g. in CheckIn we have additional things to do as in reception and vice versa.
   * @param channel
   * @param handler
   */
  addAdditionalHandler(channel, handler) {
    let self = this;
    if (self.handlers[channel]) {
      let oldHandler         = self.handlers[channel];
      self.handlers[channel] = (msg) => {
        oldHandler(msg);
        handler(msg);
      }
    }
  }

  /**
   * Central logging function
   * @param channel
   * @param payload
   */
  logSocketEvent(channel, payload) {
    if (this.logEnabled) {
      console.info(`Socket data for ${channel}`, payload);
    }
  }

  /**
   * Emits a payload to the game through a specified channel.
   *
   * @param {string} channel - The channel to emit the payload to.
   * @param {*} payload - The data payload to be emitted.
   * @returns {boolean} - Returns true if the payload was successfully emitted, false otherwise.
   */
  emitToGame(channel, payload = {}) {
    let self = this;
    if (!self.connected) {
      console.log('socket is disconnected', channel, payload);
      return false;
    }
    this.logSocketEvent(channel, payload);
    self.socket.emit(channel, payload);
    return true;
  }
}

export {FerropolySocket};
