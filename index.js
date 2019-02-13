const hansClient = require('./hans');
const settings = require('./settings.json');
const Client = new hansClient(settings);
const bot = Client.user;

Client.on('ready', () => {
  console.log('ready');
});

Client.login(settings.token);

process.on('unhandledRejection', (err, p) => {
  console.error('ERROR: unhandled rejection at ', p, 'with reason', err.stack || err);
});
