"use strict";

const config = require('serverless-authentication').config;
const auth = require('../lib');
const nock = require('nock');
const expect = require('chai').expect;

describe('Microsoft authentication', () => {
  describe('Signin', () => {
    it('tests signin with default params', () => {
      const providerConfig = config('microsoft');
      auth.signinHandler(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://login.live.com/oauth20_authorize.srf?client_id=fb-microsoft-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic');
      });
    });

    it('tests signin with scope and state params', () => {
      const providerConfig = config('microsoft');
      auth.signinHandler(providerConfig, {scope: 'wl.basic wl.emails', state: '123456'}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://login.live.com/oauth20_authorize.srf?client_id=fb-microsoft-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic wl.emails&state=123456');
      });
    });

    it('tests signin with default params', () => {
      const providerConfig = config('microsoft');
      auth.signin(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://login.live.com/oauth20_authorize.srf?client_id=fb-microsoft-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic');
      });
    });
  });

  describe('Callback', () => {
    before(() => {
      const providerConfig = config('microsoft');
      nock('https://login.live.com')
        .post('/oauth20_token.srf')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://apis.live.net')
        .get('/v5.0/me')
        .query({access_token: 'access-token-123'})
        .reply(200, {
          id: 'user-id-1',
          name: 'Eetu Tuomala',
          emails: {
            preferred: 'email@test.com'
          },
          picture: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
        });
    });

    it('should return profile', (done) => {
      const providerConfig = config('microsoft');
      auth.callbackHandler({code: 'code', state: 'state'}, providerConfig, (err, profile) => {
        expect(profile.id).to.equal('user-id-1');
        expect(profile.name).to.equal('Eetu Tuomala');
        expect(profile.email).to.equal('email@test.com');
        expect(profile.picture).to.equal('https://apis.live.net/v5.0/user-id-1/picture');
        expect(profile.provider).to.equal('microsoft');
        done(err);
      })
    });
  });

  describe('Old callback', () => {
    before(() => {
      const providerConfig = config('microsoft');
      nock('https://login.live.com')
        .post('/oauth20_token.srf')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://apis.live.net')
        .get('/v5.0/me')
        .query({access_token: 'access-token-123'})
        .reply(200, {
          id: 'user-id-1',
          name: 'Eetu Tuomala',
          emails: {
            preferred: 'email@test.com'
          },
          picture: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
        });
    });

    it('should return profile', (done) => {
      const providerConfig = config('microsoft');
      auth.callback({code: 'code', state: 'state'}, providerConfig, (err, profile) => {
        expect(profile.id).to.equal('user-id-1');
        expect(profile.name).to.equal('Eetu Tuomala');
        expect(profile.email).to.equal('email@test.com');
        expect(profile.picture).to.equal('https://apis.live.net/v5.0/user-id-1/picture');
        expect(profile.provider).to.equal('microsoft');
        done(err);
      })
    });
  });
});