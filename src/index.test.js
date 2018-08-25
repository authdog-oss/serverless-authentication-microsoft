const { config } = require('serverless-authentication')
const nock = require('nock')
const authentication = require('./index')

describe('Microsoft authentication', () => {
  beforeAll(() => {
    process.env.PROVIDER_MICROSOFT_ID = 'microsoft-mock-id'
    process.env.PROVIDER_MICROSOFT_SECRET = 'microsoft-mock-secret'
    process.env.REDIRECT_CLIENT_URI = 'http://localhost:3000/auth/{provider}/'
    process.env.REDIRECT_URI =
      'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/{provider}'
    process.env.TOKEN_SECRET = 'token-secret-123'
  })

  describe('Signin', () => {
    it('tests signin with default params', async () => {
      const providerConfig = config({ provider: 'microsoft' })
      const data = await authentication.signinHandler(providerConfig, {})
      expect(data.url).toBe(
        'https://login.live.com/oauth20_authorize.srf?client_id=microsoft-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic'
      )
    })

    it('tests signin with scope and state params', async () => {
      const providerConfig = config({ provider: 'microsoft' })
      const data = await authentication.signinHandler(providerConfig, {
        scope: 'wl.basic wl.emails',
        state: '123456'
      })
      expect(data.url).toBe(
        'https://login.live.com/oauth20_authorize.srf?client_id=microsoft-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic wl.emails&state=123456'
      )
    })

    it('tests signin with default params', async () => {
      const providerConfig = config({ provider: 'microsoft' })
      const data = await authentication.signinHandler(providerConfig, {})
      expect(data.url).toBe(
        'https://login.live.com/oauth20_authorize.srf?client_id=microsoft-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/microsoft&response_type=code&scope=wl.basic'
      )
    })
  })

  describe('Callback', () => {
    beforeAll(() => {
      const providerConfig = config({ provider: 'microsoft' })
      nock('https://login.live.com')
        .post(
          '/oauth20_token.srf',
          ({ client_id, redirect_uri, client_secret, code }) =>
            (client_id =
              providerConfig.id &&
              redirect_uri === providerConfig.redirect_uri &&
              client_secret === providerConfig.secret &&
              code === 'code')
        )
        .reply(200, {
          access_token: 'access-token-123'
        })

      nock('https://apis.live.net')
        .get('/v5.0/me')
        .query({ access_token: 'access-token-123' })
        .reply(200, {
          id: 'user-id-1',
          name: 'Eetu Tuomala',
          emails: {
            preferred: 'email@test.com'
          },
          picture: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
        })
    })

    it('should return profile', async () => {
      const providerConfig = config({ provider: 'microsoft' })
      const profile = await authentication.callbackHandler(
        { code: 'code', state: 'state' },
        providerConfig
      )

      expect(profile.id).toBe('user-id-1')
      expect(profile.name).toBe('Eetu Tuomala')
      expect(profile.email).toBe('email@test.com')
      expect(profile.picture).toBe(
        'https://apis.live.net/v5.0/user-id-1/picture'
      )
      expect(profile.provider).toBe('microsoft')
      expect(profile.at_hash).toBe('access-token-123')
    })
  })
})
