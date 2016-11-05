/*global localStorage: false*/

import Ember from 'ember';
import AuthCallbackInitializer from 'dummy/initializers/auth-callback';
import { module, test } from 'qunit';

let application;
let jQuery = Ember.$;

module('Unit | Initializer | auth callback', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  },
  afterEach() {
    Ember.$ = jQuery;
    localStorage.removeItem('what-session-token');
  }
});

test('It should run.', function(assert) {
  AuthCallbackInitializer.initialize(application);
  assert.ok(true);
});

test('It should intercept /auth/callback/[provider].', function(assert) {
  let ajaxCalled = false;
  let closeCalled = false;
  
  application.window = {
    location: {
      origin: "http://example.com",
      pathname: "/auth/callback/xanga",
      search: "?code=WHAT",
    },
    close() { closeCalled = true; }
  };
  
  Ember.$ = {
    ajax(options) {
      ajaxCalled = true;
      assert.equal(options.url, '/token');
      assert.ok(options.data);
      assert.equal(options.data.redirect_uri,
          'http://example.com/auth/callback/xanga');
      assert.equal(options.data.code, 'WHAT');
      assert.equal(options.data.provider, 'xanga');
      return {
        then: function(callback) {
          assert.ok(callback, "The ajax promise should be given a callback.");
          const result = {"token": "json.eyJ3ZWIiOiJ3ZWIifQ.token"};
          callback(result);
        }
      };
    }
  };
  
  AuthCallbackInitializer.initialize(application);
  
  assert.ok(ajaxCalled, 'Ember.$.ajax should be called.');
  assert.ok(closeCalled, 'window.close should be called.');
  assert.equal(localStorage.getItem('what-session-token'),
               "\"json.eyJ3ZWIiOiJ3ZWIifQ.token\"");
});

test('It should not intercept other paths.', function(assert) {
  application.window = {
    location: {
      origin: "http://example.com",
      pathname: "/arimaa-client",
      search: "?game_id=1000000000",
    }
  };
  
  Ember.$ = { ajax() { assert.ok(false); } };
  
  AuthCallbackInitializer.initialize(application);
  assert.ok(true);
});

