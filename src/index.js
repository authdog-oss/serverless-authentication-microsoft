'use strict';

import { Profile, Provider } from 'serverless-authentication';

function mapProfile(response) {
  return new Profile({
    id: response.id,
    name: response.name,
    email: response.emails && response.emails.preferred ? response.emails.preferred : null,
    picture: `https://apis.live.net/v5.0/${response.id}/picture`,
    provider: 'microsoft',
    _raw: response
  });
}

class MicrosoftProvider extends Provider {
  signinHandler({ scope = 'wl.basic', state }, callback) {
    const options = Object.assign(
      { scope, state },
      { signin_uri: 'https://login.live.com/oauth20_authorize.srf', response_type: 'code' }
    );

    super.signin(options, callback);
  }

  callbackHandler(event, callback) {
    const options = {
      authorization_uri: 'https://login.live.com/oauth20_token.srf',
      profile_uri: 'https://apis.live.net/v5.0/me',
      profileMap: mapProfile,
      authorizationMethod: 'POST'
    };

    super.callback(
      event,
      options,
      { authorization: { grant_type: 'authorization_code' } },
      callback
    );
  }
}

export function signinHandler(config, options, callback) {
  (new MicrosoftProvider(config)).signinHandler(options, callback);
}

export function callbackHandler(event, config, callback) {
  (new MicrosoftProvider(config)).callbackHandler(event, callback);
}
