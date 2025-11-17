/**
 *
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 17.11.2025
 **/

import {defineStore} from 'pinia'

export const useGameplayStore = defineStore('Gameplay', {
  state:   () => ({
    gameplay: {
      owner:      {
        organisatorEmail: '',
        organisatorName:  ''
      },
      admins:     {
        logins: []
      },
      scheduling: {
        gameDate:    undefined,
        gameStart:   undefined,
        gameEnd:     undefined,
        deleteTs:    undefined,
        gameEndTs:   undefined,
        gameStartTs: undefined,
      },
      gameParams: {
        presets:                   undefined,
        interestInterval:          0,
        interest:                  0,
        interestCyclesAtEndOfGame: 0,
        startCapital:              0,
        debtInterest:              0,
        housePrices:               0.5,
        properties:                {
          lowestPrice:                0,
          highestPrice:               0,
          numberOfPriceLevels:        0,
          numberOfPropertiesPerGroup: 0
        },
        rentFactors:               {
          noHouse:              0.2,
          oneHouse:             0.8,
          twoHouses:            2.5,
          threeHouses:          3.5,
          fourHouses:           4,
          hotel:                5,
          allPropertiesOfGroup: 2
        },
        chancellery:               {
          minLottery:       0,
          maxLottery:       0,
          minGambling:      0,
          maxGambling:      0,
          maxJackpotSize:   0,
          probabilityWin:   0.4,
          probabilityLoose: 0.5
        }
      },
      internal:   {
        finalized:               true,
        priceListPendingChanges: false,
        gameDataPublic:          false,
        isDemo:                  true,
        map:                     undefined,
        owner:                   undefined,
        gameId:                  undefined,
        creatingInstance:        undefined,
      },
      joining:    {
        possibleUntil: undefined,
        url:           undefined,
      },
      rules:      {
        version:   0,
        text:      undefined,
        changelog: [],
        date:      undefined,
      },
      log:        {
        priceListVersion: 0,
        created:          undefined,
        lastEdited:       undefined,
        priceListCreated: undefined,
      },
      gamename:   undefined,

    }
  }),
  getters: {},
  actions: {
    init(gameplay) {
      this.gameplay = gameplay;
    }
  }
})
