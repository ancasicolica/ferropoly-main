/**
 * Testing the /marketplace route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.09.2025
 **/
const expect       = require('expect.js');
const api          = require('../fixtures/apiTest');
const unitTestGame = require('../fixtures/unitTestGame');
const db           = require('../../common/lib/ferropolyDb');
const settings     = require('../../main/settings');

let gameData = null;
const gameId = 'basic-test';

describe('Testing the /marketplace route', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    api.resetClient();
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })


  describe('Testing the marketplace API', () => {
    describe('with a valid user', () => {
      before(async () => {
        const res = await api.login();
        expect(res.status).to.be(200);
        const gcRes = await api.post('/gamecache/refresh');
        expect(gcRes.status).to.be(200);
      })

      after(async () => {
        await api.logout();
      })
      it('should buy property 0 for team 1', async () => {
        const res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[1].uuid}/${gameData.properties[0].uuid}`);
        console.log(res);
        expect(res.data.result.amount).to.be(1000);
        expect(res.data.result.property.uuid).to.be(gameData.properties[0].uuid);
      })

      it('should buy property 1 for team 2', async () => {
        const res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[2].uuid}/${gameData.properties[1].uuid}`);
        console.log(res);
        expect(res.data.result.amount).to.be(1000);
        expect(res.data.result.property.uuid).to.be(gameData.properties[1].uuid);
      })

      it('should buy property 2 for team 2', async () => {
        const res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[2].uuid}/${gameData.properties[2].uuid}`);
        console.log(res.data);
        console.log(`Owner is ${gameData.teams[2].uuid}`);
        expect(res.data.result.amount).to.be(1000);
        expect(res.data.result.property.uuid).to.be(gameData.properties[2].uuid);
      })

      it('should not buy property 2 for team 3 (pay rent instead)', async () => {
        const res = await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[3].uuid}/${gameData.properties[2].uuid}`);
        console.log(res.data);
        expect(res.data.result.amount).to.be(200);
        expect(res.data.result.owner).to.be(gameData.teams[2].uuid);
        expect(res.data.result.property.uuid).to.be(gameData.properties[2].uuid);
      })

      it('should not buy a property for an invalid game', async () => {
        try {
          await api.post(`/marketplace/buyProperty/nonono/${gameData.teams[3].uuid}/${gameData.properties[2].uuid}`);
          expect().fail('Request should have failed with 403');
        }
        catch (err) {
          expect(err.response && err.response.status).to.be(403);
          expect(err.response.data).to.have.key('message');
          console.log(err.response.data.message);
        }
      })

      it('should not buy a property for an invalid team', async () => {
        try {
          await api.post(`/marketplace/buyProperty/${gameId}/nobody/${gameData.properties[2].uuid}`);
          expect().fail('Request should have failed with 403');
        }
        catch (err) {
          expect(err.response && err.response.status).to.be(500);
          expect(err.response.data).to.have.key('message');
          console.log(err.response.data.message);
        }
      })

      it('should not buy an invalid property', async () => {
        try {
          await api.post(`/marketplace/buyProperty/${gameId}/${gameData.teams[3].uuid}/nirgendwo`);
          expect().fail('Request should have failed with 403');
        }
        catch (err) {
          expect(err.response && err.response.status).to.be(500);
          expect(err.response.data).to.have.key('message');
          console.log(err.response.data.message);
        }
      })

      it('should not build any houses when there are no properties', async () => {
        const res = await api.post(`/marketplace/buildHouses/${gameId}/${gameData.teams[0].uuid}`);
        expect(res.data.result.amount).to.be(0);
        expect(res.data.result.log.length).to.be(0);
      })

      it('should fail building houses for a non existing game', async () => {
        try {
          await api.post(`/marketplace/buildHouses/nonsense/${gameData.teams[0].uuid}`);
          expect().fail('Request should have failed with 403');
        }
        catch (err) {
          expect(err.response && err.response.status).to.be(403);
          expect(err.response.data).to.have.key('message');
          console.log(err.response.data.message);
        }
      })

      it('should fail building houses for a non existing team', async () => {
        try {
          await api.post(`/marketplace/buildHouses/${gameId}/not-a-team`);
          expect().fail('Request should have failed with 403');
        }
        catch (err) {
          console.log(err);
          expect(err.response && err.response.status).to.be(500);
          expect(err.response.data).to.have.key('message');
          console.log(err.response.data.message);
        }
      })

      it('should not build a house yet', async () => {
        const res = await api.post(`/marketplace/buildHouses/${gameId}/${gameData.teams[1].uuid}`);
        expect(res.data.result.amount).to.be(0);
        expect(res.data.result.log.length).to.be(0);
      })

      it('should pay the rents (debugging API)', async () => {
        const res = await api.get(`/marketplace/payRents/${gameId}`);
        expect(res.data.status).to.be('ok');
      })

      it('should build one house for team 1', async () => {
        const res = await api.post(`/marketplace/buildHouses/${gameId}/${gameData.teams[1].uuid}`);
        console.log(res.data);
        expect(res.data.result.amount).to.be(-500);
        expect(res.data.result.log.length).to.be(1);
      })

      it('should build two houses for team 2', async () => {
        const res = await api.post(`/marketplace/buildHouses/${gameId}/${gameData.teams[2].uuid}`);
        console.log(res.data);
        expect(res.data.result.amount).to.be(-1000);
        expect(res.data.result.log.length).to.be(2);
      })

      it('should not more houses for team 2 now', async () => {
        const res = await api.post(`/marketplace/buildHouses/${gameId}/${gameData.teams[2].uuid}`);
        console.log(res.data);
        expect(res.data.result.amount).to.be(0);
        expect(res.data.result.log.length).to.be(0);
      })

      it('should pay the rents a second time (debugging API)', async () => {
        const res = await api.get(`/marketplace/payRents/${gameId}`);
        expect(res.data.status).to.be('ok');
      })

      it('should build a single house for team 2', async()=> {
        const res = await api.post(`/marketplace/buildHouse/${gameId}/${gameData.teams[2].uuid}/${gameData.properties[1].uuid}`);
        console.log(res.data);
        expect(res.data.result.amount).to.be(-500);
      })

      it('should build only one house for team 2', async () => {
        const res = await api.post(`/marketplace/buildHouses/${gameId}/${gameData.teams[2].uuid}`);
        console.log(res.data);
        expect(res.data.result.amount).to.be(-500);
        expect(res.data.result.log.length).to.be(1);
      })

      it('should not build a house on a property not belonging the team', async()=> {
        try {
          await api.post(`/marketplace/buildHouse/${gameId}/${gameData.teams[2].uuid}/${gameData.properties[0].uuid}`);
          expect().fail('Request should have failed with 403');
        }
        catch (err) {
          expect(err.response && err.response.status).to.be(500);
          expect(err.response.data).to.have.key('message');
          console.log(err.response.data.message);
        }
      })

      it('should not build a house of an invalid team', async()=> {
        try {
          await api.post(`/marketplace/buildHouse/${gameId}/noteam/${gameData.properties[0].uuid}`);
          expect().fail('Request should have failed with 403');
        }
        catch (err) {
          expect(err.response && err.response.status).to.be(500);
          expect(err.response.data).to.have.key('message');
          console.log(err.response.data.message);
        }
      })

      it('should not build a house in an invalid game', async () => {
        try {
          await api.post(`/marketplace/buildHouse/nonono/${gameData.teams[3].uuid}/${gameData.properties[2].uuid}`);
          expect().fail('Request should have failed with 403');
        }
        catch (err) {
          expect(err.response && err.response.status).to.be(403);
          expect(err.response.data).to.have.key('message');
          console.log(err.response.data.message);
        }
      })

    })

  })
});
