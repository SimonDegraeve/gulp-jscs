'use strict';

var through = require('through2'),
    PluginError = require('gulp-util').PluginError,
    failReporter = require('./fail'),
    pluginName = require('../../package.json').name;

function loadReporter(reporter) {
  // function
  if (typeof reporter === 'function') {
    return reporter;
  }

  // object reporters
  if (typeof reporter === 'object' && typeof reporter.reporter === 'function') {
    return reporter.reporter;
  }

  // load jscs built-in reporters
  if (typeof reporter === 'string') {
    try {
      return loadReporter(require('jscs/lib/reporters/' + reporter));
    } catch (error) {}
  }

  // load full-path or module reporters
  if (typeof reporter === 'string') {
    try {
      return loadReporter(require(reporter));
    } catch (error) {}
  }
}

module.exports = function(reporter) {
  if (reporter === 'fail') {
    return failReporter();
  }

  var rpt = loadReporter(reporter || 'console');

  if (typeof rpt !== 'function') {
    throw new PluginError(pluginName, 'Invalid reporter');
  }

  // return stream that reports stuff
  return through.obj(function(file, encoding, done) {
    if (file.jscs && !file.jscs.success && !file.jscs.ignored) {
      try {
        rpt(file.jscs.errors);
      } catch (error) {
        return done(error, file);
      }
    }

    done(null, file);
  });
};
