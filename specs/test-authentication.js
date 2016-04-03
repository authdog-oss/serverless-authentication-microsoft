"use strict";

let config = require('serverless-authentication').config;
let auth = require('../lib');

describe('Microsoft authentication', () => {
  describe('Test Microsoft authentication', () => {
    it('tests signin with default params', () => {
      let providerConfig = config('microsoft');
      auth.signin(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://login.live.com/oauth20_authorize.srf?client_id=fb-microsoft-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic');
      });
    });

    it('tests signin with scope and state params', () => {
      let providerConfig = config('microsoft');
      auth.signin(providerConfig, {scope: 'wl.basic wl.emails', state: '123456'}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://login.live.com/oauth20_authorize.srf?client_id=fb-microsoft-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic wl.emails&state=123456');
      });
    });
  });
});