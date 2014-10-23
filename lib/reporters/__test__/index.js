'use strict';

var PluginError = require('gulp-util').PluginError,
    reporter = proxy(__dirname + '/../index', {
      './failReporter': function() {
        throw new Error('Call failReporter');
      },
      'jscs/lib/reporters/console': function() {
        throw new Error('Call consoleReporter');
      }
    }),
    fileStub = function(file) {
      file.jscs = {
        success: false,
        ignored: false,
        errors: []
      };
      return file;
    };

describe('reporter', function() {
  it('should use function as reporter', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
      }))
      .pipe(reporter(function() {
        throw new Error('Call functionReporter');
      }))
      .on('error', function(error) {
        expect(error.message).to.equal('Call functionReporter');
        done();
      });
  });

  it('should use function from object as reporter', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
      }))
      .pipe(reporter({
        reporter: function() {
          throw new Error('Call functionReporter');
        }
      }))
      .on('error', function(error) {
        expect(error.message).to.equal('Call functionReporter');
        done();
      });
  });

  it('should not use invalid object as reporter', function(done) {
    try {
      expect(reporter({reporter: 'invalidReporter'})).to.throw(PluginError);
    } catch (error) {
      expect(error).to.be.instanceof(PluginError);
    }
    try {
      expect(reporter({invaliReporter: 'invalidReporter'})).to.throw(PluginError);
    } catch (error) {
      expect(error).to.be.instanceof(PluginError);
    }
    done();
  });

  it('should use built-in reporter', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
      }))
      .pipe(reporter('console'))
      .on('error', function(error) {
        expect(error.message).to.equal('Call consoleReporter');
        done();
      });
  });

  it('should use full-path or module reporter', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
      }))
      .pipe(reporter('jscs/lib/reporters/console'))
      .on('error', function(error) {
        expect(error.message).to.equal('Call consoleReporter');
        done();
      });
  });

  it('should use fail reporter', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
      }))
      .pipe(reporter('fail'))
      .on('error', function(error) {
        expect(error.message).to.match(/JSCS failed for/);
        done();
      });
  });

  it('should use console as default reporter', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
      }))
      .pipe(reporter())
      .on('error', function(error) {
        expect(error.message).to.equal('Call consoleReporter');
        done();
      });
  });

  it('should throw error on invalid reporter', function(done) {
    try {
      expect(reporter('invalidReporter')).to.throw(PluginError);
    } catch (error) {
      expect(error).to.be.instanceof(PluginError);
    }
    done();
  });

  it('should skip file without jscs properties', function(done) {
    stream()
      .pipe(reporter())
      .pipe(assert.end(done));
  });

  it('should skip ignored file', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
        file.jscs.ignored = true;
      }))
      .pipe(reporter())
      .pipe(assert.end(done));
  });

  it('should skip file without errors', function(done) {
    stream()
      .pipe(assert.first(function(file) {
        file = fileStub(file);
        file.jscs.success = true;
      }))
      .pipe(reporter())
      .pipe(assert.end(done));
  });
});
