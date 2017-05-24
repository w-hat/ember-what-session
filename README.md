# Ember-what-session

[![Build Status](https://travis-ci.org/w-hat/ember-what-session.svg?branch=master)](https://travis-ci.org/w-hat/ember-what-session)

This Ember addon provides a simple authentication service called `session`
which persists a JWT bearer token in `localStorage` after
authenticating via OAuth2 or an username/password combination.
Facebook, Google, and Github are supported OAuth2 providers.


## Alternatives

This addon provides the main features of the combination of
[ember-simple-auth](https://github.com/simplabs/ember-simple-auth) and
[torii](https://github.com/Vestorly/torii) without all of the cruft.
However, those addons are more featureful and more configurable.


## Usage

Configure the addon in `config/environment.js`:

```js
module.exports = function(environment) {
  var ENV = {
    whatSession: {
      tokenUrl: '/token',
      redirectBase: 'http://localhost:4200',
      providers: {
        local: { url: '/token' },
        google: { id: 'GOOGLE_CLIENT_ID' },
      }
    },
// ...
```

Call the `session.authenticate` function with the name of a provider (and with
a username and password for local authentication).

```hbs
<button {{action session.authenticate 'google'}}>Login with Google</button>
<form>
  {{input value=email}}
  {{input value=password type='password'}}
  <button {{action session.authenticate 'local' email password}}>Login</button>
</form>
```

A popup will then present the user with the OAuth2 prompt.  Note that the
`redirect_uri` must be set to `[redirectBase]/auth/callback/[provider]`
in the provider's settings online.
If the user approves, ember-what-session will handle the callback for you and
send a request to your backend to `tokenUrl`.
Your backend should respond with a JWT after fetching the user's information
from the appropriate provider (or verifying that the password is correct).

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyM30.5GmbIy8VoP6A4kR6zJaks7VGDbhIiTz-1b6EZfiRcgE" }
```

Ember-what-session will decode the token and provide access to its contents via
`session.claims`.  You may use the claims to populate a service that extends
`session` or a different service that injects it.

```js
import Ember from 'ember';
import WhatSession from "ember-what-session/services/session";

export default WhatSession.extend({
  store: Ember.inject.service(),
  user: Ember.computed('claims.sub', function() {
    const user_id = this.get('claims.sub');
    if (user_id) {
      return this.get('store').findRecord('user', user_id);
    } else {
      return null;
    }
  }),
});
```

Then you can use `session.user` anywhere in your application since
ember-what-session injects itself into components, controllers, and routes.

```hbs
{{#if session.user}}
  <span>{{session.user.name}}</span>
  <button {{action session.deauthenticate}}>Logout</button>
{{/if}}
```

It's that easy!  And the session will be kept synchronized between tabs.


## Planned Features

This addon does not support automatically refreshing tokens yet.


## Backend Example

Here is an example of an overly-simple ES7
[node](https://nodejs.org/) backend that uses
[koa](https://github.com/koajs/koa),
[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), and
[whatauth](https://github.com/w-hat/whatauth) to fetch the user's profile
from the relevant provider and then return a token.

```js
import Koa from 'koa';
import KoaRouter from 'koa-router';
import jwt from 'jsonwebtoken';
import WhatAuth from 'whatauth';

const jwt_secret = "JWT_SECRET_123";

const whatauth = new WhatAuth({
  google: { id: "GOOGLE_CLIENT_ID", secret: "GOOGLE_CLIENT_SECRET" },
});

const app = new Koa();
const router = KoaRouter();

router.get('/token', async ctx => {
  const profile = await whatauth.fetch(ctx.query);
  const token = jwt.sign({
    name: profile.name,
    sub: profile.ident,
    exp: Math.floor(Date.now()/1000) + 28800,
  }, jwt_secret);
  ctx.body = { token };
});

router.get('/hello', loadUser, ctx => {
  ctx.body = { hello: ctx.state.user.name };
});

async function loadUser(ctx, next) {
  const auth = ctx.header.authorization;
  if (!auth) {
    ctx.status = 401;
  } else {
    const token = auth.split("Bearer ")[1];
    const claims = await jwt.verifyAsync(token, jwt_secret);
    ctx.state.user = { name: claims.name };
    await next();
  }
}

app.use(main.routes());

module.exports = app.listen(3000);
```


## Installation

* `git clone https://github.com/w-hat/ember-what-session`
* `cd ember-what-session`
* `npm install`
* `bower install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
