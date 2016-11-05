export function initialize(application) {
  application.inject('route', 'session', 'service:session');
  application.inject('component', 'session', 'service:session');
  application.inject('controller', 'session', 'service:session');
}

export default {
  name: 'inject-session',
  initialize
};
