"use strict";

let config = require('serverless-authentication').config;
let auth = require('../lib');

describe('Microsoft authentication', () => {
  describe('Test Microsoft authentication', () => {
    it('Test signin', () => {
      let providerConfig = config('microsoft');
      auth.signin(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://login.live.com/oauth20_authorize.srf?client_id=fb-microsoft-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&scope=wl.basic&response_type=code');
      });
    });
  });
});