/**
 * Fixtures and helpers for the API testing
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 14.09.2025
 **/

const axios     = require('axios');
const {wrapper} = require('axios-cookiejar-support');
const tough     = require('tough-cookie');
const settings  = require('../../main/settings');

const jar     = new tough.CookieJar();
let client;
let authToken = '';

module.exports = {

  resetClient: function () {
    console.log('Resetting client');
    client = wrapper(axios.create({
      baseURL:         settings.server.url,
      withCredentials: true,
      jar
    }));
  },

  login: async function (username = 'demo@ferropoly.ch', password = '12345678') {
    if (!client) {
      this.resetClient();
    }

    const res = await client.post(`${settings.server.url}/login`, {username, password});
    console.log(`Login with ${username} and ${password}, status: ${res.status} `);

    const resAuthtoken = await client.get(`${settings.server.url}/authToken`);
    console.log(`Got authToken: ${resAuthtoken.data.authToken}`);
    authToken = resAuthtoken.data.authToken;
    return res;
  },

  logout: async function () {
    if (!client) {
      throw 'no client';
    }
    return await client.post(`${settings.server.url}/logout`);
  },

  get:  async function (path) {
    if (!client) {
      throw 'no client';
    }
    return await client.get(`${settings.server.url}${path}`);
  },
  post: async function (path, data, _authToken = undefined) {
    if (!client) {
      throw 'no client';
    }
    data = data || {};
    if (_authToken) {
      data.authToken = _authToken;
    } else {
      data.authToken = authToken;
    }
    return await client.post(`${settings.server.url}${path}`, data);
  },
  delete: async function (path, data, _authToken = undefined) {
    if (!client) {
      throw 'no client';
    }
    data = data || {};
    if (_authToken) {
      data.authToken = _authToken;
    } else {
      data.authToken = authToken;
    }
    return await client.delete(`${settings.server.url}${path}`, {data});
  }
};
