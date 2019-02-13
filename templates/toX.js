const Command = require('../Command');

class ToX extends Command {
  constructor(name, aliases, converter) {
    super(
      name,
      {
        aliases: aliases,
        category: 'general'
      }
    );
    this.converter = converter;
    this.default_no = 1;
    this.max_limit = 5;
  }

  async exec(msg, args) {
    const args_split = args.split(' ');
    let msg_limit = parseInt(args_split[0], 10);

    if (args_split[0] === '')
      msg_limit = this.default_no; // running command standalone
    if (msg_limit > this.max_limit)
      msg_limit = this.max_limit;
    let output = [];

    if (Number.isNaN(msg_limit)) {
      // option 1: converting a text string
      output.push({
        description: (this.converter(args) || '(nothing to convert)'),
        author: {
          name: msg.author.tag,
          url: msg.url,
          icon_url: msg.author.avatarURL
        },
      });
    } else {
      // option 2: converting last n messages in the channel
      const last_msgs = await msg.channel.fetchMessages({ before: msg.id, limit: msg_limit });
      // https://www.npmjs.com/package/node-opencc
      for (const [id, m] of last_msgs) {
        output.push({
          description: (this.converter(m.content) || '(nothing to convert)'),
          author: {
            name: m.author.tag,
            url: m.url,
            icon_url: m.author.avatarURL
          },
        });
      }
      // fetchMessages returns messages newest to oldest, while we want oldest to newest
      output.reverse();
    }

    return output;
  }
}

// module.exports = ToX;
