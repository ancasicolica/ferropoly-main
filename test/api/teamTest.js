/**
 * Testing the /team route
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 03.10.2025
 **/


const expect       = require('expect.js');
const api          = require('../fixtures/apiTest');
const unitTestGame = require('../fixtures/unitTestGame');
const db           = require('../../common/lib/ferropolyDb');
const settings     = require('../../main/settings');
const _            = require('lodash');

let gameData = null;
const gameId = 'team-test';

describe('Testing the /team route', () => {
  before(async () => {
    await db.init(settings);
    gameData = await unitTestGame.createGame(gameId);
    api.resetClient();
    const gcRes = await api.post('/gamecache/refresh');
    expect(gcRes.status).to.be(200);
    const login = await api.login('team1@ferropoly.ch');
    expect(login.status).to.be(200);
  })

  after(async () => {
    await unitTestGame.cleanUpGame(gameId);
    await db.close();
  })


  it('should return the page for the team', async () => {
    const res = await api.get(`/team/edit/${gameId}/${gameData.teams[1].uuid}`);
    console.log(res.data);
    expect(res.status).to.be(200);
  })

  it('should not be possible to get the team data of a non existing game', async () => {
    try {
      await api.get(`/team/edit/nada/${gameData.teams[1].uuid}`);
      expect().fail('Request should have failed with 403');
    }
    catch (err) {
      expect(err.response && err.response.status).to.be(403);
    }
  })

  it('should not be possible to get the team data of another team', async () => {
    try {
      await api.get(`/team/edit/${gameId}/${gameData.teams[2].uuid}`);
      expect().fail('Request should have failed with 403');
    }
    catch (err) {
      expect(err.response && err.response.status).to.be(403);
    }
  })

  it('should be possible to add a user, a known one', async () => {
    const res = await api.post(`/team/members/${gameId}/${gameData.teams[1].uuid}`, {newMemberLogin: 'team8@ferropoly.ch'})
    console.log(res.data);
    expect(res.status).to.be(200);

    const t = _.find(res.data.members, {'login': 'team8@ferropoly.ch'});
    expect(t.login).to.be('team8@ferropoly.ch')
    expect(t.personalData.forename).to.be('Thomas')

  })

  it('should be possible to add a user, an unknown one', async () => {
    const res = await api.post(`/team/members/${gameId}/${gameData.teams[1].uuid}`, {newMemberLogin: 'niemand@ferropoly.ch'})
    console.log(res.data);
    expect(res.status).to.be(200);
    const t = _.find(res.data.members, {'login': 'niemand@ferropoly.ch'});
    expect(t.login).to.be('niemand@ferropoly.ch')
    expect(t.personalData).to.be(undefined)
  })


  it('should be possible to remove a user', async () => {
    // add first
    const res = await api.post(`/team/members/${gameId}/${gameData.teams[1].uuid}`, {newMemberLogin: 'remover@ferropoly.ch'})
    console.log(res.data);
    expect(res.status).to.be(200);
    const t = _.find(res.data.members, {'login': 'remover@ferropoly.ch'});
    expect(t.login).to.be('remover@ferropoly.ch')

    const remove = await api.delete(`/team/members/${gameId}/${gameData.teams[1].uuid}`, {memberToDelete: 'remover@ferropoly.ch'})
    console.log(remove.data);
    expect(remove.status).to.be(200);
    const t1 = _.find(remove.data.members, {'login': 'remover@ferropoly.ch'});
    expect(t1).to.be(undefined)
  })


  it('should be possible to get the members', async () => {
    let res = await api.post(`/team/members/${gameId}/${gameData.teams[1].uuid}`, {newMemberLogin: 'niemand@ferropoly.ch'})
    console.log(res.data);
    expect(res.status).to.be(200);
    const t = _.find(res.data.members, {'login': 'niemand@ferropoly.ch'});
    expect(t.login).to.be('niemand@ferropoly.ch')

    res = await api.get(`/team/members/${gameId}/${gameData.teams[1].uuid}`);
    console.log(res.data);
    const t1 = _.find(res.data.members, {'login': 'niemand@ferropoly.ch'});
    expect(t1.login).to.be('niemand@ferropoly.ch')
  })


});
