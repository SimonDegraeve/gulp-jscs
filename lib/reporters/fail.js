'use strict';

var through = require('through2'),
    PluginError = require('gulp-util').PluginError,
    pluginName = require('../../package.json').name;

module.exports = function() {
  var failed = false;

  return through.obj(
    function(file, encoding, done) {
      if (file.jscs && !file.jscs.success && !file.jscs.ignored) {
        (failed = failed || []).push(file.path);
      }
      this.push(file);
      done();
    }, function(done) {
      if (failed) {
        this.emit('error', new PluginError(pluginName, {
          message: 'JSCS failed for: ' + failed.join(', '),
          showStack: false
        }));
      }
      done();
    }
  );
};
