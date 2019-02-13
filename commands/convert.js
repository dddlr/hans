const Command = require('../Command'),
      opencc = require('node-opencc'),
      detectTradSimp = require('../util/detectTradSimp');

class Convert extends Command {
  constructor() {
    super(
      'convert',
      {
        aliases: ['c', 'tt', 'to_trad', 'ts', 'to_simp'],
        reaction_aliases: ['🔁'],
        category: 'general'
      }
    );
    this.default_no = 1;
    this.max_limit = 3;
  }

  do_nothing(a) {
    return a;
  }

  find_converter(msgs) {
    let lean = 0;
    msgs.forEach(msg => {
      const identify = detectTradSimp.tradOrSimp(msg.content);
      if (identify === 'simp')
        return ++lean;
      else if (identify === 'trad')
        return --lean;
      else
        return;
    });
    if (lean > 0)
      return [':arrow_right:', opencc.simplifiedToTraditional];
    else if (lean < 0)
      return [':arrow_left:', opencc.traditionalToSimplified];
    else
      return [':asterisk:', this.do_nothing];
  }

  async exec_reaction_remove(msg, alias) {
    try {
      if (!this.reactionsUsed.has(msg.id))
        return;
      const bot_msg_id = this.reactionsUsed.get(msg.id);
      const bot_msg = await msg.channel.fetchMessage(bot_msg_id);
      if (bot_msg.deletable)
        await bot_msg.delete();
      this.reactionsUsed.delete(msg.id);
    } catch (e) {
      console.error('ERROR in exec_reaction_remove', e);
    }
  }

  async exec(msg, args, alias) {
    const args_split = args.split(' ');
    let msg_limit = NaN; // default to converting the message input
    if (args_split.length === 1 && args !== '')
      msg_limit = Number(args_split[0]);

    if (msg_limit < 1)
      msg_limit = 1; // message limit passed too low
    else if (args_split[0] === '')
      msg_limit = this.default_no; // running command standalone

    if (msg_limit > this.max_limit)
      msg_limit = this.max_limit;
    let output = [];

    let msgs;
    if (this.reaction_aliases.includes(alias)) {
      // option 1: command called via a reaction
      msgs = [{
        content: msg.content,
        name: msg.author.tag,
        icon_url: msg.author.avatarURL
      }];
    } else if (Number.isNaN(msg_limit)) {
      // option 2: converting a text string
      msgs = [{
        content: args,
        name: msg.author.tag,
        icon_url: msg.author.avatarURL
      }];
    } else {
      // option 3: converting last n messages in the channel
      msgs = await msg.channel.fetchMessages({ before: msg.id, limit: msg_limit })
      msgs = msgs.map(m => { return {
        content: m.content,
        name: m.author.tag,
        icon_url: m.author.avatarURL
      } }).reverse();
    }

    // Find whether to convert to Trad or Simp Chinese
    let arrow, converter;
    if (alias === 'ts' || alias === 'to_simp') {
      arrow = ':arrow_left:';
      converter = opencc.traditionalToSimplified;
    } else if (alias === 'tt' || alias === 'to_trad') {
      arrow = ':arrow_right:';
      converter = opencc.simplifiedToTraditional;
    } else {
      const c = this.find_converter(msgs);
      arrow = c[0];
      converter = c[1];
    }

    // https://www.npmjs.com/package/node-opencc
    for (const m of msgs) {
      output.push({
        description: arrow + ' ' + (converter(m.content) || '(nothing to convert)'),
        author: {
          name: m.name,
          icon_url: m.icon_url
        }
      });
    }

    return output;
  }
}

module.exports = Convert;
