'use strict';

var through = require('through2'),
    exists = require('fs').existsSync,
    Checker = require('jscs'),
    loadConfigFile = require('jscs/lib/cli-config'),
    PluginError = require('gulp-util').PluginError,
    reporters = require('./reporters'),
    pluginName = require('../package.json').name;

function getConfig(options) {
  var config;
  if (typeof options === 'object') {
    if (options.configPath) {
      // create config from path if 'configPath'
      if (!exists(options.configPath)) {
        throw new PluginError(pluginName, {
          message: 'Config file not found',
          showStack: false
        });
      }
      config = loadConfigFile.load(options.configPath);
    }else if (Object.keys(options).indexOf('esnext') !== -1  && Object.keys(options).length === 1) {
      // create config from .jscsrc if only 'esnext'
      config = loadConfigFile.load();
    }else {
      // create config from options
      delete options.esnext;
      config = options;
    }
  }else {
    // create config from path
    if (options && !exists(options)) {
      throw new PluginError(pluginName, {
        message: 'Config file not found',
        showStack: false
      });
    }
    config = loadConfigFile.load(options);
  }
  return config;
}

function jscs(checker, string, file) {
  var errors = checker.checkString(string, file.path);
  if (errors.isEmpty()) {
    file.jscs.success = true;
  } else {
    file.jscs.errors = [errors];
    file.jscs.results = toJshintErrors(errors);
  }
}

function toJshintErrors(errors) {
  var filename = errors.getFilename();
  return errors.getErrorList().map(function(error) {
    error = {
      id: '(error)',
      raw: error.message,
      code: '',
      evidence: errors._file._lines[error.line - 1],
      line: error.line,
      character: error.column,
      scope: '',
      a: undefined,
      b: undefined,
      c: undefined,
      d: undefined,
      reason: error.message
    };
    return {
      file: filename,
      error: error
    };
  });
}

function plugin(options) {
  var checker = new Checker({esnext: options && !!options.esnext}),
      config = getConfig(options);

  checker.registerDefaultRules();

  try {
    checker.configure(config);
  } catch (error) {
    throw new PluginError(pluginName, {
      message: error,
      showStack: false
    });
  }

  var stream = through.obj(function(file, encoding, done) {
    // default jscs properties
    file.jscs = {
      success: false,
      ignored: false,
      errors: [],
      results: [] // Jshint errors compatibilty
    };

    if (file.isNull()) {
      file.jscs.ignored = true;
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(pluginName, {
        message: 'Streaming not supported',
        showStack: false
      }));
    }

    if (checker._isExcluded(file.path)) {
      file.jscs.ignored = true;
    }

    if (!checker._hasCorrectExtension(file.path)) {
      file.jscs.ignored = true;
    }

    if (file.isBuffer() && !file.jscs.ignored) {
      jscs(checker, file.contents.toString(), file);
    }

    this.push(file);
    return done();
  });

  return stream;
}

// expose the reporters API
plugin.reporter = reporters;

module.exports = plugin;
