const ToX = require('../templates/toX'),
      opencc = require('node-opencc');

class ToSimp extends ToX {
  constructor() {
    super(
      'to_simp',
      ['ts'],
      opencc.traditionalToSimplified
    );
  }

}

// module.exports = ToSimp;
