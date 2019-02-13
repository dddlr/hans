const { Client } = require('discord.js');
const CommandHandler = require('./CommandHandler.js');

class hansClient extends Client {
  constructor(settings) {
    super();
    this.commandHandler = new CommandHandler(this, settings);
  }
}

module.exports = hansClient;
