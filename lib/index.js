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

function signin(_ref, _ref2, callback) {
  var id = _ref.id;
  var redirect_uri = _ref.redirect_uri;
  var _ref2$scope = _ref2.scope;
  var scope = _ref2$scope === undefined ? 'wl.basic' : _ref2$scope;
  var state = _ref2.state;

  var params = {
    client_id: id,
    redirect_uri: redirect_uri,
    scope: scope,
    response_type: 'code'
  };

  if (state) {
    params.state = state;
  }

  var url = _serverlessAuthentication.utils.urlBuilder('https://login.live.com/oauth20_authorize.srf', params);
  callback(null, { url: url });
}

function callback(_ref3, _ref4, callback) {
  var code = _ref3.code;
  var state = _ref3.state;
  var id = _ref4.id;
  var redirect_uri = _ref4.redirect_uri;
  var secret = _ref4.secret;

  _async2.default.waterfall([function (callback) {
    var payload = {
      client_id: id,
      redirect_uri: redirect_uri,
      client_secret: secret,
      code: code,
      grant_type: 'authorization_code'
    };
    _request2.default.post({ url: 'https://login.live.com/oauth20_token.srf', form: payload }, callback);
  }, function (response, accessData, callback) {
    var _JSON$parse = JSON.parse(accessData);

    var access_token = _JSON$parse.access_token;

    var url = _serverlessAuthentication.utils.urlBuilder('https://apis.live.net/v5.0/me', { access_token: access_token });
    _request2.default.get(url, function (err, response, profileData) {
      if (!err) {
        callback(null, mapProfile(JSON.parse(profileData)));
      } else {
        callback(err);
      }
    });
  }], function (err, data) {
    callback(err, data, state);
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