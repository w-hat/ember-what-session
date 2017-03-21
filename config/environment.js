/* eslint-env node */

'use strict';

module.exports = function(environment, appConfig) {
  const whatSession = {
    providers: buildUrls(appConfig),
    fields: {},
    //tokenUrl: '/token',
  };
  return { whatSession };
};

function buildUrls(appConfig) {
  const whatSession = appConfig.whatSession;
  const appProviders = whatSession && whatSession.providers;
  const redirect = whatSession && (whatSession.redirect ||
                       whatSession.redirectBase || whatSession.redirect_base);
  if (appProviders && redirect) {
    if (!appProviders.all) { appProviders.all = {} };
    appProviders.all.redirect = redirect;
  }
  const all = Object.assign({}, defaults.all, appProviders && appProviders.all);
  let providers = {};
  for (let key in appProviders) {
    if (key === 'all') { continue; }
    const options = Object.assign({}, all, defaults[key], appProviders[key]);
    providers[key] = { url: buildUrl(key, options) };
  }
  return providers;
}

function buildUrl(key, options) {
  let url = options.baseUrl + '?';
  url += 'response_type=' + options.response_type;
  const client_id = options.client_id || options.id || options.clientId 
                                      || options.app_id || options.appId;
  if (client_id) {
    url += '&client_id=' + client_id;
  }
  const redirect_base = options.redirect || options.redirectBase
                                         || options.redirect_base;
  const redirect_uri = options.redirect_uri || options.redirectUri ||
        (redirect_base && (redirect_base + '/auth/callback/' + key));
  if (redirect_uri) {
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
  }
  if (options.display) {
    url += '&display=' + options.display;
  }
  if (options.scope) {
    url += '&scope=' + encodeURIComponent(options.scope);
  }
  if (options.approval_prompt) {
    url += '&approval_prompt=' + options.approval_prompt;
  }
  return url;
}

const defaults = {
  all: {
    redirectBase: 'http://localhost:4200',
    response_type: 'code',
  },
  facebook: {
    baseUrl: 'https://www.facebook.com/dialog/oauth',
    display: 'popup',
    scope: 'email',
  },
  google: {
    baseUrl: 'https://accounts.google.com/o/oauth2/auth',
    scope: 'profile email',
    approval_prompt: 'auto',
  },
  github: {
    baseUrl: 'https://github.com/login/oauth/authorize',
    scope: 'user:email',
  }
};
