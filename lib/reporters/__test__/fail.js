'use strict';

var PluginError = require('gulp-util').PluginError,
    failReporter = proxy('../fail'),
    fileStub = function(file) {
      file.jscs = {
        success: false,
        ignored: false,
        errors: []
      };
      return file;
    };

describe('fail reporter', function() {
  it('should skip file without jscs properties', function(done) {
    stream()
      .pipe(failReporter())
      .pipe(assert.end(done));
  });

  it('should skip ignored file', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
        file.jscs.ignored = true;
      }))
      .pipe(failReporter())
      .pipe(assert.end(done));
  });

  it('should skip file without errors', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
        file.jscs.success = true;
      }))
      .pipe(failReporter())
      .pipe(assert.end(done));
  });

  it('should emit error', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
      }))
      .pipe(failReporter())
      .on('error', function(error) {
        expect(error).to.be.instanceof(PluginError);
        expect(error.message).to.match(/JSCS failed for/);
        done();
      });
  });
});
