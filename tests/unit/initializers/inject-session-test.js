import Ember from 'ember';
import InjectSessionInitializer from 'dummy/initializers/inject-session';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | inject session', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

test('It should run.', function(assert) {
  InjectSessionInitializer.initialize(application);
  assert.ok(true);
});

test('It should injects the session into routes.', function(assert) {
  const Session = Ember.Object.extend({token: "Curiouser and curiouser!"});
  application.register('service:session', Session, {singleton: true});
  InjectSessionInitializer.initialize(application);
  const appInstance = application.buildInstance();
  const basic = appInstance.lookup('route:basic');
  assert.equal("Curiouser and curiouser!", basic.get('session.token'));
});

test('it injects the session into components.', function(assert) {
  const Session = Ember.Object.extend({token: "I knew who I was this morning"});
  application.register('service:session', Session, {singleton: true});
  InjectSessionInitializer.initialize(application);
  const appInstance = application.buildInstance();
  const checkbox = appInstance.lookup('component:Checkbox');
  assert.equal("I knew who I was this morning", checkbox.get('session.token'));
});

test('It should inject the session into controllers.', function(assert) {
  const Session = Ember.Object.extend({token: "run twice as fast as that."});
  application.register('service:session', Session, {singleton: true});
  const QueenOfHearts = Ember.Object.extend({off: "with their heads!"});
  application.register('controller:queen', QueenOfHearts, {singleton: true});
  InjectSessionInitializer.initialize(application);
  const appInstance = application.buildInstance();
  const queen = appInstance.lookup('controller:queen');
  assert.equal("with their heads!", queen.get('off'));
  assert.equal("run twice as fast as that.", queen.get('session.token'));
});

