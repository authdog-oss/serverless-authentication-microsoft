'use strict';

import {Profile, Provider} from 'serverless-authentication';

class MicrosoftProvider extends Provider {
  signin({scope = 'wl.basic', state}, callback) {
    let options = Object.assign(
      {scope, state},
      {signin_uri: 'https://login.live.com/oauth20_authorize.srf', response_type: 'code'}
    );
    super.signin(options, callback);
  }

  callback(event, callback) {
    var options = {
      authorization_uri: 'https://login.live.com/oauth20_token.srf',
      profile_uri: 'https://apis.live.net/v5.0/me',
      profileMap: mapProfile,
      authorizationMethod: 'POST'
    };
    super.callback(event, options, {authorization: {grant_type: 'authorization_code'}}, callback);
  }
}

function mapProfile(response) {
  return new Profile({
    id: response.id,
    name: response.name,
    email: response.emails && response.emails.preferred ? response.emails.preferred : null,
    picture: 'https://apis.live.net/v5.0/' + response.id + '/picture',
    provider: 'microsoft',
    _raw: response
  });
}

export function signin(config, options, callback) {
  (new MicrosoftProvider(config)).signin(options, callback);
}

export function callback(event, config, callback) {
  (new MicrosoftProvider(config)).callback(event, callback);
}