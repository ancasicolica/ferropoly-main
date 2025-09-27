/**
 * Testing the pic bucket API (only on ferropoly instance, not on google)
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 27.09.2025
 **/

const expect       = require('expect.js');
const api          = require('../fixtures/apiTest');
const unitTestGame = require('../fixtures/unitTestGame');
const db           = require('../../common/lib/ferropolyDb');
const settings     = require('../../main/settings');
const picBucketModel = require('../../common/models/picBucketModel');

let gameData = null;
const gameId = 'picbucket-test';

describe('Testing the /picbucket route', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    api.resetClient();
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })


  describe('Testing the pic bucket API as user', () => {
    before(async () => {
      const res = await api.login('team1@ferropoly.ch');
      expect(res.status).to.be(200);
      const gcRes = await api.post('/gamecache/refresh');
      expect(gcRes.status).to.be(200);
    })

    after(async () => {
      await api.logout();
    })

    let requestId = null;
    let picId = null;

    it('should announce a new picture for my own team', async ()=> {
      const testMessage = 'just checking';
      const result = await api.post(`/picbucket/announce/${gameId}/${gameData.teams[1].uuid}`, {propertyId: '', message:testMessage, position: {}, lastModfiedDate: ''})
      expect(result.status).to.be(200);
      console.log(result.data);
      requestId = result.data.id;
      expect(result.data.id).to.be.a('string');
      expect(result.data.uploadUrl).to.be.a('string');
      expect(result.data.thumbnailUrl).to.be.a('string');

      const picInfo = await picBucketModel.findPicById(requestId);
      console.log(picInfo);
      expect(picInfo.position.lat).to.be(0);
      expect(picInfo.position.lng).to.be(0);
      expect(picInfo.position.accuracy).to.be(10000);
      expect(picInfo.uploaded).to.be(false);
      expect(picInfo.gameId).to.be(gameId);
      expect(picInfo.message).to.be(testMessage);
      expect(picInfo.url).to.be.a('string');
      expect(picInfo.url).to.be.a('string');
      expect(picInfo.propertyId).to.be('');
      expect(picInfo.user).to.be('team1@ferropoly.ch');
    })

    it ('should confirm the previous pic', async ()=> {
      const result = await api.post(`/picbucket/confirm/${requestId}`, {position: {lat:'47.320352', lng:'8.794484', accuracy:'10'}});
      expect(result.status).to.be(200);
      const picInfo = await picBucketModel.findPicById(requestId);
      console.log(picInfo);
      expect(picInfo.position.lat).to.be(47.320352);
      expect(picInfo.position.lng).to.be(8.794484);
      expect(picInfo.position.accuracy).to.be(10);
      expect(picInfo.uploaded).to.be(true);
      expect(picInfo.gameId).to.be(gameId);
      expect(picInfo.url).to.be.a('string');
      expect(picInfo.url).to.be.a('string');
      expect(picInfo.propertyId).to.be('');
      expect(picInfo.user).to.be('team1@ferropoly.ch');
      // Google location
      expect(picInfo.location.results.length > 0).to.be(true);
      expect(picInfo.location.status).to.be('OK');
    })


    it('should not announce a new picture for another team', async ()=> {
      try {
        await api.post(`/picbucket/announce/${gameId}/${gameData.teams[2].uuid}`, {propertyId: '', message:'', position: {}, lastModfiedDate: ''})
        expect().fail('Request should have failed with 401');
      }
      catch (err) {
        expect(err.response && err.response.status).to.be(401);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it('should not confirm a rubbish id', async ()=> {
      try {
        const res = await api.post(`/picbucket/confirm/${gameData.teams[2].uuid}`, {});
        console.log(res);
        expect().fail('Request should have failed with 404');
      }
      catch (err) {
        console.log(err);
        expect(err.response && err.response.status).to.be(404);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it ('should return the images of my team', async ()=> {
      const result = await api.get(`/picbucket/${gameId}/${gameData.teams[1].uuid}`);
      console.log(result.data);
      expect(result.status).to.be(200);
      expect(result.data.length).to.be(1);
      expect(result.data[0].teamId).to.be(gameData.teams[1].uuid);
      picId = result.data[0]._id;
    })


    it ('should be possible to assign the image to a property', async ()=> {
      const result = await api.post(`/picbucket/assign/${picId}`, {propertyId: gameData.properties[0].uuid});
      console.log(result.data);
      expect(result.status).to.be(200);

      const picInfo = await picBucketModel.findPicById(picId);
      console.log(picInfo);
      expect(picInfo.propertyId).to.be(gameData.properties[0].uuid);
      expect(picInfo.user).to.be('team1@ferropoly.ch');
    })

    it ('should not return the images of another team', async ()=> {
      try {
        const res = await api.get(`/picbucket/${gameId}/${gameData.teams[0].uuid}`);
        console.log(res);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        console.log(err);
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })

    it ('should not return all images as the game is running', async ()=> {
      try {
        const res = await api.get(`/picbucket/${gameId}`);
        console.log(res);
        expect().fail('Request should have failed with 403');
      }
      catch (err) {
        console.log(err);
        expect(err.response && err.response.status).to.be(403);
        expect(err.response.data).to.have.key('message');
        console.log(err.response.data.message);
      }
    })
  })

  describe('Testing the picBucket API as admin', ()=> {
    before(async () => {
      const res = await api.login('demo@ferropoly.ch');
      expect(res.status).to.be(200);
    })

    after(async () => {
      await api.logout();
    })

    let picId = null;

    it ('should return all images', async ()=> {
      const res = await api.get(`/picbucket/${gameId}`);
      console.log(res.data);
      expect(res.data.length).to.be(1);
      expect(res.data[0].user).to.be('team1@ferropoly.ch');
      picId = res.data[0]._id;
    })

    it ('should should be possible to assing an image', async ()=> {
      const result = await api.post(`/picbucket/assign/${picId}`, {propertyId: gameData.properties[1].uuid});
      console.log(result.data);
      expect(result.status).to.be(200);

      const picInfo = await picBucketModel.findPicById(picId);
      console.log(picInfo);
      expect(picInfo.propertyId).to.be(gameData.properties[1].uuid);
      expect(picInfo.user).to.be('team1@ferropoly.ch');
    })
  })
});
