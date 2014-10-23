'use strict';

var File = require('gulp-util').File,
    join = require('path').join,
    glob = require('glob'),
    chai = require('chai'),
    array = require('stream-array'),
    pkg = require('./package.json');

chai.use(require('sinon-chai'));

function stream() {
  var args = Array.prototype.slice.call(arguments),
      fakeDirectory = '/home/user/project',
      i = 0;

  function create(contents) {
    return new File({
      cwd: fakeDirectory,
      base: join(fakeDirectory, '__test__'),
      path: join(fakeDirectory, '__test__', 'file' + (i++).toString() + '.js'),
      contents: typeof contents === 'string' ? new Buffer(contents) : contents
    });
  }

  args = args.length === 0 ? [''] : args;
  return array(args.map(create));
}

global.stream = stream;
global.expect = chai.expect;
global.assert = require('stream-assert');
global.sinon = require('sinon');
global.proxy = require('proxyquire');

describe(pkg.name, function() {
  glob.sync(__dirname + '/lib/**/__test__/*.js').map(function(path) {
    require(path);
  });
});
