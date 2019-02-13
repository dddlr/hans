const fs = require('fs'),
      path = require('path'),
      Command = require('./Command');

class CommandHandler {
  constructor(client, settings) {
    this.client = client;
    ({ directory: this.directory, prefix: this.prefix, color: this.color, owner: this.owner } = settings);
    // TODO: use collection?
    this.commands = new Map;
    this.reactionCommands = new Map;
    // this.lastRun = new Map; // TODO: implement timeout

    this.setup();
  }

  setup() {
    this.client.once('ready', () => {
      console.log('CommandHandler setting up...');
      this.client.on('message', msg => this.check(msg));
      this.client.on('messageReactionAdd', (reaction, user) => this.check_reaction_add(reaction, user));
      this.client.on('messageReactionRemove', (reaction, user) => this.check_reaction_remove(reaction, user));

    });

    this.load(this.directory);
  }

  load(directory) {
    // load all commands
    const filepaths = fs.readdirSync(directory);
    for (const f of filepaths) {
      const command_class = require(path.resolve(directory, f));
      // ignore invalid commands
      if (typeof command_class !== 'function')
        continue;
      const command = new command_class();
      // regular commands
      this.commands.set(command.name, command);
      for (const alias of command.aliases)
        this.commands.set(alias, command);
      // reaction commands
      if (command.reaction_aliases) {
        for (const alias of command.reaction_aliases)
          this.reactionCommands.set(alias, command);
      }
    }
  }

  async handle(msg, command, args, alias) {
    try {
      args = args.trim();
      console.log(`Running command [${command.name}] ${args}`);
      const output = await command.exec(msg, args, alias);

      for (const out of output) {
        if (typeof out === 'string') {
          await msg.channel.send(out);
        } else {
          // TODO: add checking for Embed Links permissions?
          // TODO: fallbacks if no Embed Links permissions?
          let options = {embed: out};
          if (!options['embed'].color)
            options['embed'].color = parseInt(this.color, 16);
          await msg.channel.send('', options);
        }
      }
    } catch (e) {
      console.error('ERROR', e);
    }
  }

  async handle_reaction_add(msg, command, alias) {
    try {
      console.log(`Running reaction command [${command.name}] with alias [${alias}]`);
      const output = await command.exec(msg, '', alias);
      let sent_msg;

      if (typeof output[0] === 'string') {
        sent_msg = await msg.channel.send(output);
      } else {
        // TODO: add checking for Embed Links permissions?
        // TODO: fallbacks if no Embed Links permissions?
        let options = {embed: output[0]};
        if (!options['embed'].color)
          options['embed'].color = parseInt(this.color, 16);
        sent_msg = await msg.channel.send('', options);
      }
      // keep track of what message the reaction was added to, and what message
      // the bot sent
      command.reactionsUsed.set(msg.id, sent_msg.id);
    } catch (e) {
      console.error('ERROR', e);
    }
  }

  async handle_reaction_remove(msg, command, alias) {
    try {
      console.log(`Running reaction removal command [${command.name}}] with alias [${alias}]`);
      const output = await command.exec_reaction_remove(msg, alias);
    } catch (e) {
      console.error('ERROR handle_reaction_remove', e);
    }
  }

  check(msg) {
    // Where all the checks and parsing for the command go
    // e.g. checking whether message constitutes a valid command
    //      checking if user has the right permissions

    // pinging the bot is also a valid prefix
    const prefixes = [this.prefix, this.client.user.toString()];
    // prevent replying to itself
    if (msg.author.id == this.client.user.id)
      return;
    // "message" sent by discord or bot, not by a user
    if (msg.system || msg.author.bot)
      return;

    // TODO: check when command was last run

    let alias_used, args;
    for (const prefix of prefixes) {
      if (msg.content.startsWith(prefix)) {
        // parse string
        let split_msg = msg.content.substring(prefix.length).split(' ');
        if (prefix == this.client.user.toString() && split_msg[0] == '')
          split_msg.splice(0, 1);
        [alias_used, ...args] = split_msg;
        // handle space after "prefix" if it is a bot mention
        args = args.join(' ');
        break;
      }
    }

    if (!this.commands.has(alias_used))
      return;

    const command = this.commands.get(alias_used);

    return this.handle(msg, command, args, alias_used);
  }

  check_reaction_add(reaction, user) {
    const msg = reaction.message;

    if (msg.system || msg.author.bot || user.bot)
      return;
    if (user.id === this.client.user.id)
      return;

    // prevent double reactions
    if (reaction.count !== 1)
      return;

    console.log(`reaction ${reaction.emoji.name} (${reaction.emoji.id}) added`);
    // note: default emoji don't have IDs while server-specific ones do
    if (reaction.emoji.id && this.reactionCommands.has(reaction.emoji.id)) {
      const command = this.reactionCommands.get(reaction.emoji.id);
      return this.handle_reaction_add(msg, command, reaction.emoji.id);
    } else if (reaction.emoji.name && this.reactionCommands.has(reaction.emoji.name)) {
      const command = this.reactionCommands.get(reaction.emoji.name);
      return this.handle_reaction_add(msg, command, reaction.emoji.name);
    }

    return;
  }

  check_reaction_remove(reaction, user) {
    const msg = reaction.message;
    if (msg.system || msg.author.bot || user.bot)
      return;
    if (user.id === this.client.user.id)
      return;

    if (reaction.count !== 0)
      return;

    console.log(`reaction ${reaction.emoji.name} (${reaction.emoji.id}) removed`);

    if (reaction.emoji.id && this.reactionCommands.has(reaction.emoji.id)) {
      const command = this.reactionCommands.get(reaction.emoji.id);
      return this.handle_reaction_remove(msg, command, reaction.emoji.id);
    } else if (reaction.emoji.name && this.reactionCommands.has(reaction.emoji.name)) {
      const command = this.reactionCommands.get(reaction.emoji.name);
      return this.handle_reaction_remove(msg, command, reaction.emoji.name);
    }

    return;
  }

}

module.exports = CommandHandler;
