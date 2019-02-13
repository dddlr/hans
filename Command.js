class Command {
  constructor(name, options) {
    this.name = name;
    ({ aliases: this.aliases, reaction_aliases: this.reaction_aliases, category: this.category } = options);
    // timeout?

    // correspondences between messages where a reaction command has been
    // called, and the message the bot sends
    this.reactionsUsed = new Map;
  }
}

module.exports = Command;
