/**
 * Root.
 */

var global = function(){return this}();

/**
 * Format error.
 *
 * @param {Error} error
 * @returns {String}
 * @api private
 */

function formatError(error) {
  if (!error.stack) return error.message;
  var stack = error.stack;
  var firstLine = stack.substring(0, stack.indexOf('\n'));
  if (error.message && firstLine.indexOf(error.message) === -1) stack = error.message + '\n' + stack;
  return stack.replace(/\n.+\/adapter(\/lib)?\/hydro.js\?\d*\:.+(?=(\n|$))/g, '');
}

/**
 * forward hydro results to karma
 *
 * @param {Hydro} hydro
 * @api public
 */

module.exports = function(hydro) {
  if (typeof __karma__ === 'undefined') return;

  hydro.on('pre:all', function() {
    __karma__.info({ total: hydro.tests().length });
  });

  hydro.on('post:all', function() {
    __karma__.complete({ coverage: global.__coverage__ });
  });

  hydro.on('post:test', function(test) {
    var skipped = test.status === 'pending' || test.status === 'skipped';
    var suite = test.suite;
    var suites = [];
    var errors = [];

    if (test.error) {
      errors.push(formatError(test.error));
    }

    while (!suite.parent) {
      suites.unshift(suite.title);
      suite = suite.parent;
    }

    __karma__.result({
      id: '',
      description: test.title,
      suite: suites,
      success: test.status === 'passed',
      skipped: skipped,
      time: test.time,
      log: errors
    });
  });
};
