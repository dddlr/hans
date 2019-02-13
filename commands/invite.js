const Command = require('../Command');

class Invite extends Command {
  constructor() {
    super(
      'invite',
      {
        aliases: ['i', 'inv'],
        category: 'general'
      }
    );
  }

  exec(msg, args) {
    return [{
      fields: [
        {
          name: 'Info about Hans 漢斯/汉斯',
          value: 'Hi! Hans (version 0.0.1) is made by chrys.'
        },
        {
          name: 'Libraries',
          value: 'This bot relies heavily on the [node-opencc](https://github.com/compulim/node-opencc) library for conversion. Auto-detection of trad/simp Chinese is based on hanzidentifier (which uses data from cedict).'
        },
        {
          name: 'Invite this bot! 邀請/邀请',
          value: 'https://discordapp.com/api/oauth2/authorize?client_id=543655721196060694&permissions=346176&scope=bot'
        }
      ]
    }];
  }

}

module.exports = Invite;
