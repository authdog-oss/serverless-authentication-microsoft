'use strict';

import { Profile, Provider } from 'serverless-authentication';

function mapProfile(response) {
  const overwrites = {
    email: response.emails && response.emails.preferred ? response.emails.preferred : null,
    picture: `https://apis.live.net/v5.0/${response.id}/picture`,
    provider: 'microsoft'
  };

  return new Profile(Object.assign(response, overwrites));
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

const signinHandler = (config, options, callback) =>
  (new MicrosoftProvider(config)).signinHandler(options, callback);

const callbackHandler = (event, config, callback) =>
  (new MicrosoftProvider(config)).callbackHandler(event, callback);

exports.signinHandler = signinHandler;
exports.signin = signinHandler; // old syntax, remove later
exports.callbackHandler = callbackHandler;
exports.callback = callbackHandler; // old syntax, remove later
