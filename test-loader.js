'use strict';

var File = require('gulp-util').File,
    path = require('path'),
    glob = require('glob'),
    chai = require('chai'),
    array = require('stream-array'),
    proxyquire = require('proxyquire'),
    callsite = require('callsite'),
    pkg = require('./package.json');

chai.use(require('sinon-chai'));

function stream() {
  var args = Array.prototype.slice.call(arguments),
      fakeDirectory = '/home/user/project',
      i = 0;

  function create(contents) {
    return new File({
      cwd: fakeDirectory,
      base: path.join(fakeDirectory, '__test__'),
      path: path.join(fakeDirectory, '__test__', 'file' + (i++).toString() + '.js'),
      contents: typeof contents === 'string' ? new Buffer(contents) : contents
    });
  }

  args = args.length === 0 ? [''] : args;
  return array(args.map(create));
}

function proxy(module, stubs) {
  var stack = callsite(),
      requester = stack[1].getFileName(),
      baseDir = path.dirname(requester);
  return proxyquire(path.join(baseDir, module), stubs || {});
}

global.stream = stream;
global.expect = chai.expect;
global.assert = require('stream-assert');
global.sinon = require('sinon');
global.proxy = proxy;

describe(pkg.name, function() {
  glob.sync(__dirname + '/lib/**/__test__/*.js').map(function(path) {
    require(path);
  });
});
