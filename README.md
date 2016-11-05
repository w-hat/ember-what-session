# Ember-what-session

[![Build Status](https://travis-ci.org/w-hat/ember-what-session.svg?branch=master)](https://travis-ci.org/w-hat/ember-what-session)

This Ember addon provides a simple authentication service called `session`
which holds a user's identity as a JWT bearer token in `localStorage` after
authenticating with Facebook, Github, or Google via OAuth2.


## Alternatives

The addon [ember-simple-auth](https://github.com/simplabs/ember-simple-auth)
is an alternative for storing data in a session, and the addon
[torii](https://github.com/Vestorly/torii) is an alternative for performing
OAuth requests.  Those addons are much more featureful and more mature than
ember-what-session.  They are also more bloated.  For example, even if your
application never authenticates with Azure, including Torii automatically 
includes code for Azure OAuth in your app.


## Usage

Configure the addon in `config/environment.js`:

```js
module.exports = function(environment) {
  var ENV = {
    whatSession: {
      fields: { user: 'sub' },
      tokenUrl: '/token',
      redirectBase: 'http://localhost:4200',
      providers: {
        google:   { id: 'GOOGLE_CLIENT_ID' },
      }
    },
// ...
```

Call the `service.authenticate` function with the name of a provider.

```hbs
<a {{action session.authenticate 'google'}}>Login</a>
```

A popup will then present the user with the OAuth2 prompt.  Note that the
`redirect_uri` must be set to `[redirectBase]/auth/callback/[provider]`
in the provider's settings online.
If the user approves, ember-what-session will handle the callback for you and
send a request to your backend to `tokenUrl`.
Your backend should respond with a JWT after fetching the user's information
from the appropriate provider.

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyM30.5GmbIy8VoP6A4kR6zJaks7VGDbhIiTz-1b6EZfiRcgE" }
```

Ember-what-session will use the id's  provided in the token according to
`fields` to populate the `session` service.
Typically, the `sub` claim from the JWT will contain a user id, which
will be fetched from the `store`.  Then you can use `session.user` anywhere in
your application since ember-what-session injects itself into components,
controllers, and routes.

```hbs
{{#if session.user}}
  <p>{{session.user.name}}</p>
  <a {{action session.deauthenticate}}>Logout</a>
{{/if}}
```

It's that easy!  And the session will be kept synchronized between tabs.


## Production Concerns

This addon is not ready for production.  Do not use it in production because
it's best to be careful with code related to authentication.


## Backend Example

Here is an example of an overly-simple ES7
[node](https://nodejs.org/) backend that uses
[koa](https://github.com/koajs/koa),
[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), and
[whatauth](https://github.com/w-hat/whatauth) to fetch the user's profile
from the relevant provider and then return a token.

```js
import Koa from 'koa';
import jwt from 'jsonwebtoken';
import WhatAuth from 'whatauth';

const whatauth = new WhatAuth({
  google: {
    id:     "GOOGLE_CLIENT_ID",
    secret: "GOOGLE_CLIENT_SECRET",
  }
});

const app = new Koa();

app.use(async ctx => {
  const profile = await whatauth.fetch(ctx.query);
  const token = jwt.sign({
    name: profile.name,
    sub: profile.ident,
    exp: Math.floor(Date.now()/1000) + 28800,
  }, "JWT_SECRET_123");
  ctx.body = {token};
});

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

For more information on using ember-cli, visit [http://ember-cli.com/](http://ember-cli.com/).
