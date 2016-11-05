import Ember from 'ember';

const { getOwner } = Ember;

function setHeader(token) {
  Ember.$.ajaxPrefilter(function(options, originalOptions, jqXHR) {
    jqXHR.setRequestHeader("Authorization", 'Bearer ' + token);
  });
}

export default Ember.Service.extend({
  store: Ember.inject.service(),
  token: null,
  fields: {},
  
  authenticate(provider) {
    const config = getOwner(this).resolveRegistration('config:environment');
    const url = config && config.whatSession.providers[provider].url;
    const options = 'left=' + (screen.width /2 - 250) +
                    ',top=' + (screen.height/2 - 250) + ',width=500,height=500';
    window.open(url, 'what-session-popup', options).focus();
  },
  
  deauthenticate() {
    localStorage.removeItem('what-session-token');
    setHeader('');
    const session = (this.session ? this.session : this);
    session.set('token', null);
    session.set('claims', null);
    for (let key in session.get('fields')) { session.set(key, null); }
  },
  
  refresh() {
    const token = JSON.parse(localStorage.getItem('what-session-token'));
    if (!token) {
      this.deauthenticate();
      return;
    }
    try {
      const claims64 = token.split('.')[1].replace('-', '+').replace('_', '/');
      const claims = JSON.parse(window.atob(claims64));
      if (claims.exp && (claims.exp < (Date.now() / 1000))) {
        throw new Error('Expired token.');
      }
      setHeader(token);
      this.set('token', token);
      this.set('claims', claims);
      const fields = this.get('fields');
      const store = this.get('store');
      for (let key in fields) {
        const id = claims[fields[key]];
        const value = (store ? store.findRecord(key, id) : id);
        this.set(key, value);
      }
    } catch (e) {
      console.log('Token error:', token, e);
      this.deauthenticate();
    }
  },
  
  can(permission) {
    const claims = this.get('claims');
    const permissions = claims && (claims.can || claims.permissions);
    //return permissions && permissions.includes(permission);
    let can = false;
    if (permissions) {
      for (let i = 0; i < permissions.length; i++) {
        if (permissions[i] === permission) { can = true; break; }
      }
    }
    return can;
  },
  
  init() {
    this._super(...arguments);
    const session = this;
    const config = getOwner(this).resolveRegistration('config:environment');
    this.set('fields', config && config.whatSession.fields);
    session.refresh();
    Ember.$(window).on('storage.what-session-token', function(/* event */) {
      session.refresh();
    });
  }
});
