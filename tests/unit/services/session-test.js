/*global localStorage: false*/

import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

const jQuery = Ember.$;

moduleFor('service:session', 'Unit | Service | session', {
  afterEach() {
    Ember.$ = jQuery;
    localStorage.removeItem('what-session-token');
  },
});

test('It should exist.', function(assert) {
  const service = this.subject();
  assert.ok(service);
});

test('It should have an authenticate method.', function(assert) {
  const service = this.subject();
  assert.ok(service.authenticate, 'authenticate should exist');
  assert.equal(typeof service.authenticate, 'function');
  assert.equal(service.authenticate.length, 4);
});

test('It should open a popup for authentication', function(assert) {
  const service = this.subject();
  let inFocus = false;
  service.set('providers', {
    'arimaa': { 'url': 'https://arimaa.com/oauth' }
  });
  const windo = {
    open(url, name, options) {
      assert.equal(url, 'https://arimaa.com/oauth');
      assert.equal(name, 'what-session-popup');
      assert.equal(typeof options, 'string');
      return {
        focus() { inFocus = true; }
      };
    }
  };
  service.authenticate('arimaa', null, null, windo);
  assert.ok(inFocus);
});

test('It should not use a popup for local authentication', function(assert) {
  const service = this.subject();
  let ajaxCalled = false;
  service.set('providers', { 'local': { 'url': '/mytoken' } });
  const windo = { open() { assert.ok(false, 'Should not call open.'); } };
  Ember.$ = {
    ajax(options) {
      ajaxCalled = true;
      assert.equal(options.url, '/mytoken');
      assert.ok(options.data);
      assert.equal(options.data.redirect_uri, undefined);
      assert.equal(options.data.username, 'AlphaGo');
      assert.equal(options.data.password, 'OneWithTheSt0nes');
      return {
        then: function(callback) {
          assert.ok(callback, "The ajax promise should be given a callback.");
          callback({"token": "json.eyJ3ZWIiOiJ3ZWIifQ.token"});
        },
      };
    },
  };
  assert.equal(localStorage.getItem('what-session-token'), null);
  service.authenticate('local', 'AlphaGo', 'OneWithTheSt0nes', windo);
  assert.ok(ajaxCalled, 'Ember.$.ajax should be called.');
  assert.equal(localStorage.getItem('what-session-token'),
               "\"json.eyJ3ZWIiOiJ3ZWIifQ.token\"");
});

test('It should have an deauthenticate method.', function(assert) {
  const service = this.subject();
  assert.ok(service.deauthenticate, 'deauthenticate should exist');
  assert.equal(typeof service.deauthenticate, 'function');
  assert.equal(service.deauthenticate.length, 0);
  localStorage.setItem('what-session-token', 'OJWb5e8SG8c');
  service.set('token', 'OJWb5e8SG8c');
  service.deauthenticate();
  assert.equal(localStorage.getItem('what-session-token'), null);
  assert.equal(service.get('token'), null);
});

test('It should load the token from localStorage on init.', function(assert) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                "eyJ2IjoiTUFfMlVNWXBFaEEifQ." +
                "qFJA7YKDXaIob791ecrlsAE8UWwXuDPSYjdozzdmeWM";
  localStorage.setItem('what-session-token', '"' + token + '"');
  const service = this.subject();
  assert.equal(service.get('token'), token);
  assert.equal(service.get('claims.v'), "MA_2UMYpEhA");
});

