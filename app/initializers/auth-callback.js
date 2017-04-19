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
    
    let url = ENV.whatSession.tokenUrl;
    if (!url) {
      try {
        const adapter = application.__container__.lookup('adapter:application');
        const namespace = adapter.get('namespace');
        url = (namespace ? '/' + namespace + '/token' : '/token');
      } catch (e) {
        url = '/token';
      }
    }
    
    Ember.$.ajax({ url, data }).then((result) => {
      localStorage.setItem('what-session-token', JSON.stringify(result.token));
      win.close();
    }, (error) => {
      console.log('Error:', error);
      alert(error.responseText);
      localStorage.removeItem('what-session-reload-page');
    });
  }
}

export default {
  name: 'auth-callback',
  initialize
};
