const ToX = require('../templates/toX'),
      opencc = require('node-opencc');

class ToTrad extends ToX {
  constructor() {
    super(
      'to_trad',
      ['tt'],
      opencc.simplifiedToTraditional
    );
  }

}

// module.exports = ToTrad;
