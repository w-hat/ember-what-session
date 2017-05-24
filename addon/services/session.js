import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Service.extend({
  token: null,
  
  claims: Ember.computed('token', function() {
    return getClaims(this.get('token'));
  }),
  
  authenticate(provider, username, password, windo) {
    const session = this.session || this;
    const url = session.get('providers')[provider].url;
    if (url.match(/^\//)) {
      const data = { username, password };
      Ember.$.ajax({ url, data }).then(res => {
        localStorage.setItem('what-session-token', JSON.stringify(res.token));
      });
    } else {
      const options = 'left='+(screen.width /2 - 250)+
                      ',top='+(screen.height/2 - 250)+',width=500,height=500';
      (windo || window).open(url, 'what-session-popup', options).focus();
    }
  },
  
  deauthenticate() {
    const session = this.session || this;
    localStorage.removeItem('what-session-token');
    setHeader('');
    session.set('token', null);
  },
  
  refresh() {
    const session = this.session || this;
    const token = JSON.parse(localStorage.getItem('what-session-token'));
    if (!token || isExpired(token)) {
      session.deauthenticate();
    } else {
      setHeader(token);
      session.set('token', token);
    }
  },
  
  init() {
    this._super(...arguments);
    const session = this;
    const config = getOwner(session).resolveRegistration('config:environment');
    const providers = config && config.whatSession.providers;
    session.set('providers', providers);
    session.refresh();
    Ember.$(window).on('storage.what-session-token', function(/* event */) {
      session.refresh();
    });
  }
});


function setHeader(token) {
  Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    const bearer = (token ? 'Bearer ' + token : '');
    jqXHR.setRequestHeader("Authorization", bearer);
  });
}

function getClaims(token) {
  if (token) {
    const claims64 = token.split('.')[1].replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(claims64));
  } else {
    return {};
  }
}

function isExpired(token) {
  const claims = getClaims(token);
  return claims.exp && (claims.exp < (Date.now() / 1000));
}

