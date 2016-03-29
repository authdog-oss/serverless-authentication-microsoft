'use strict';

import async from 'async';
import request from 'request';
import {utils, Profile} from 'serverless-authentication';

export function signin({id, redirect_uri}, {scope = 'wl.basic', state}, callback) {
  let params = {
    client_id: id,
    redirect_uri,
    scope,
    response_type: 'code'
  };
  
  if(state) {
    params.state = state;
  }

  let url = utils.urlBuilder('https://login.live.com/oauth20_authorize.srf', params);
  callback(null, {url: url});
}

export function callback({code, state}, {id, redirect_uri, secret}, callback) {
  async.waterfall([
    (callback) => {
      let payload = {
        client_id: id,
        redirect_uri,
        client_secret: secret,
        code,
        grant_type: 'authorization_code'
      };
      request.post({url: 'https://login.live.com/oauth20_token.srf', form: payload}, callback);
    },
    (response, accessData, callback) => {
      let {access_token} = JSON.parse(accessData);
      let url = utils.urlBuilder('https://apis.live.net/v5.0/me', {access_token});
      request.get(url, (err, response, profileData) => {
        if(!err) {
          callback(null, mapProfile(JSON.parse(profileData)));
        } else {
          callback(err);
        }
      });
    }
  ], (err, data) => {
    callback(err, data, state);
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