const Command = require('../Command');

class Eval extends Command {
  constructor() {
    super(
      'eval',
      {
        aliases: ['e'],
        category: 'owner'
      }
    );
  }

  async exec(msg, args) {
    try {
      // await eval(args);
      return [{
        description: 'Eval ran successfully.'
      }];
    } catch (e) {
      console.error('EVAL', e);
      return [{
        color: 0xFF0000,
        description: `**Error:** "${e.message}". See console for the stack trace.`
      }];
    }
  }
}

// command disabled
// module.exports = Eval;
