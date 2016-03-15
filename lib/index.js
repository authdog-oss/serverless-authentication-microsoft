'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signin = signin;
exports.callback = callback;

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _serverlessAuthentication = require('serverless-authentication');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function signin(config, options, callback) {
  var params = {
    client_id: config.id,
    redirect_uri: config.redirect_uri,
    scope: options.scope || 'wl.basic',
    response_type: 'code'
  };
  var url = _serverlessAuthentication.utils.urlBuilder('https://login.live.com/oauth20_authorize.srf', params);
  callback(null, { url: url });
}

function callback(event, config, callback) {
  _async2.default.waterfall([function (callback) {
    var payload = {
      client_id: config.id,
      redirect_uri: config.redirect_uri,
      client_secret: config.secret,
      code: event.code,
      grant_type: 'authorization_code'
    };
    _request2.default.post({ url: 'https://login.live.com/oauth20_token.srf', form: payload }, callback);
  }, function (response, data, callback) {
    var d = JSON.parse(data);
    var url = _serverlessAuthentication.utils.urlBuilder('https://apis.live.net/v5.0/me', { access_token: d.access_token });
    _request2.default.get(url, function (err, response, data) {
      if (!err) {
        callback(null, mapProfile(JSON.parse(data)));
      } else {
        callback(err);
      }
    });
  }], function (err, data) {
    callback(err, data);
  });
}

function mapProfile(response) {
  return new _serverlessAuthentication.Profile({
    id: response.id,
    name: response.name,
    email: response.emails.preferred,
    picture: 'https://apis.live.net/v5.0/' + response.id + '/picture',
    provider: 'microsoft',
    _raw: response
  });
}