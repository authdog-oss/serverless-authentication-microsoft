import { Profile, Provider } from 'serverless-authentication'

function mapProfile(response) {
  const overwrites = {
    email:
      response.emails && response.emails.preferred
        ? response.emails.preferred
        : null,
    picture: `https://apis.live.net/v5.0/${response.id}/picture`,
    provider: 'microsoft'
  }

  return new Profile(Object.assign(response, overwrites))
}

class MicrosoftProvider extends Provider {
  signinHandler({ scope = 'wl.basic', state }) {
    const options = Object.assign(
      { scope, state },
      {
        signin_uri: 'https://login.live.com/oauth20_authorize.srf',
        response_type: 'code'
      }
    )

    return super.signin(options)
  }

  callbackHandler(event) {
    const options = {
      authorization_uri: 'https://login.live.com/oauth20_token.srf',
      profile_uri: 'https://apis.live.net/v5.0/me',
      profileMap: mapProfile,
      authorizationMethod: 'POST'
    }

    return super.callback(
      event,
      options,
      { authorization: { grant_type: 'authorization_code' } }
    )
  }
}

const signinHandler = (config, options) =>
  new MicrosoftProvider(config).signinHandler(options)

const callbackHandler = (event, config) =>
  new MicrosoftProvider(config).callbackHandler(event)

exports.signinHandler = signinHandler
exports.callbackHandler = callbackHandler
