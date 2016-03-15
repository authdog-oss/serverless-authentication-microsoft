'use strict';

import async from 'async';
import request from 'request';
import {utils, Profile} from 'serverless-authentication';

export function signin(config, options, callback) {
  let params = {
    client_id: config.id,
    redirect_uri: config.redirect_uri,
    scope: options.scope || 'wl.basic',
    response_type: 'code'
  };
  let url = utils.urlBuilder('https://login.live.com/oauth20_authorize.srf', params);
  callback(null, {url: url});
}

export function callback(event, config, callback) {
  async.waterfall([
    (callback) => {
      let payload = {
        client_id: config.id,
        redirect_uri: config.redirect_uri,
        client_secret: config.secret,
        code: event.code,
        grant_type: 'authorization_code'
      };
      request.post({url: 'https://login.live.com/oauth20_token.srf', form: payload}, callback);
    },
    (response, data, callback) => {
      let d = JSON.parse(data);
      let url = utils.urlBuilder('https://apis.live.net/v5.0/me', {access_token: d.access_token});
      request.get(url, (err, response, data) => {
        if(!err) {
          callback(null, mapProfile(JSON.parse(data)));
        } else {
          callback(err);
        }
      });
    }
  ], (err, data) => {
    callback(err, data);
  });
}

function mapProfile(response) {
  return new Profile({
    id: response.id,
    name: response.name,
    email: response.emails.preferred,
    picture: 'https://apis.live.net/v5.0/'+response.id+'/picture',
    provider: 'microsoft',
    _raw: response
  });
}