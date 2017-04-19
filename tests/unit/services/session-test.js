/*global localStorage: false*/

import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor('service:session', 'Unit | Service | session', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

test('It should exist.', function(assert) {
  const service = this.subject();
  assert.ok(service);
});

test('It should have an authenticate method.', function(assert) {
  const service = this.subject();
  assert.ok(service.authenticate, 'authenticate should exist');
  assert.equal(typeof service.authenticate, 'function');
  assert.equal(service.authenticate.length, 3);
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
  service.authenticate('arimaa', windo);
  assert.ok(inFocus);
});

test('It should have an deauthenticate method.', function(assert) {
  const service = this.subject();
  assert.ok(service.deauthenticate, 'deauthenticate should exist');
  assert.equal(typeof service.deauthenticate, 'function');
  assert.equal(service.deauthenticate.length, 1);
  localStorage.setItem('what-session-token', 'OJWb5e8SG8c');
  service.set('fields', {'theuser': 'uid'});
  service.set('token', 'OJWb5e8SG8c');
  service.set('theuser', Ember.Object.extend({name: "Zendaya"}));
  service.deauthenticate();
  assert.equal(localStorage.getItem('what-session-token'), null);
  assert.equal(service.get('fields.theuser'), 'uid');
  assert.equal(service.get('theuser'), null);
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

test('It should have a "can" permissions method.', function(assert) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
                "eyJjYW4iOlsicnVuLWZhc3QiLCJ0dW1ibGUiXX0." +
                "iSWAybdhc_mxr9OSyjSJBeu4RAcYf6gN2kLLGoCHEgU";
  localStorage.setItem('what-session-token', '"' + token + '"');
  
  const service = this.subject();
  
  assert.equal(service.can('run-fast'), true);
  assert.equal(service.can('dunk'), false);
});


