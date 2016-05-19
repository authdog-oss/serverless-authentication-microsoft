'use strict';

const chai = require('chai');

process.env.PROVIDER_MICROSOFT_ID = 'fb-microsoft-id';
process.env.PROVIDER_MICROSOFT_SECRET = 'fb-microsoft-secret';
process.env.REDIRECT_CLIENT_URI = 'http://localhost:3000/auth/{provider}/';
process.env.REDIRECT_URI = 'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/{provider}';
process.env.TOKEN_SECRET = 'token-secret-123';

chai.config.includeStack = true;

global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;