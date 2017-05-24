import Ember from 'ember';
import ENV from '../config/environment';

export function initialize(application) {
  const win = application.window || window;
  const location = win.location;
  const path_m = location.pathname.match(/\/auth\/callback\/(.*)/);
  if (path_m) {
    application.deferReadiness();
    const code_m = location.search.match(/code=([^\&]*)/);
    const code = code_m[1];
    const provider = path_m[1];
    const redirect_uri = location.origin + location.pathname;
    const data = {code, provider, redirect_uri};
    const url = getTokenUrl(application);
    
    Ember.$.ajax({ url, data }).then((result) => {
      localStorage.setItem('what-session-token', JSON.stringify(result.token));
      win.close();
    }, (error) => {
      Ember.Logger.log('Error:', error);
      alert(error.responseText);
      localStorage.removeItem('what-session-reload-page');
    });
  }
}

function getTokenUrl(application) {
  const url = ENV.whatSession.tokenUrl;
  if (url) { return url; }
  try {
    const adapter = application.__container__.lookup('adapter:application');
    const namespace = adapter.get('namespace');
    return namespace ? '/' + namespace + '/token' : '/token';
  } catch (e) {
    return '/token';
  }
}

export default {
  name: 'auth-callback',
  initialize
};

