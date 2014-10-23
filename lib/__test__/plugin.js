'use strict';

var join = require('path').join,
    FakeStream = require('stream').PassThrough,
    PluginError = require('gulp-util').PluginError,
    jshint = require('gulp-jshint'),
    jscs = proxy('../plugin', {
      './reporters': function() {}
    }),
    fixtures = function(glob) {
      return join(__dirname, 'fixtures', glob);
    };

describe('plugin', function() {
  it('should ignore null file', function(done) {
    stream(null)
      .pipe(jscs())
      .pipe(assert.first(function(file) {
        expect(file.jscs.ignored).to.equal(true);
      }))
      .pipe(assert.end(done));
  });

  it('should emit error on streamed file', function(done) {
    stream(new FakeStream())
      .pipe(jscs())
      .on('error', function(error) {
        expect(error.message).to.equal('Streaming not supported');
        done();
      });
  });

  it('should add jscs properties to file', function(done) {
    stream()
      .pipe(jscs())
      .pipe(assert.first(function(file) {
        expect(file).to.contain.keys('jscs');
        expect(file.jscs.success).to.be.a('boolean');
        expect(file.jscs.ignored).to.be.a('boolean');
        expect(file.jscs.errors).to.be.a('array');
        expect(file.jscs.results).to.be.a('array');
      }))
      .pipe(assert.end(done));
  });

  it('should add errors to jscs properties', function(done) {
    var opts = {requireSpacesInsideObjectBrackets: 'all'};
    stream('var obj = {key: "value"};')
      .pipe(jscs(opts))
      .pipe(assert.first(function(file) {
        expect(file.jscs.errors).to.have.length(1);
        expect(file.jscs.results).to.have.length(2);
      }))
      .pipe(assert.end(done));
  });

  it('should transform jscs errors to jshint errors', function(done) {
    stream('var obj = {key: "value"};')
      .pipe(jshint({maxlen: 20}))
      .pipe(jscs({maximumLineLength: 20}))
      .pipe(assert.first(function(file) {
        expect(file.jscs.errors).to.have.length(1);
        expect(file.jscs.results).to.have.length(1);
        expect(file.jshint.results).to.have.length(1);

        var jscsError = file.jscs.results[0],
            jshintError = file.jshint.results[0];

        expect(jscsError.file).to.equal(jshintError.file);
        Object.keys(jscsError.error).forEach(function(key, index) {
          var jscsValue = jscsError.error[key],
              jshintValue = jshintError.error[key];
          expect(jscsValue).to.be.a(typeof jshintValue);
          if (['raw', 'code', 'scope', 'reason'].indexOf(key) === -1) {
            expect(jscsValue).to.equal(jshintValue);
          }
        });
      }))
      .pipe(assert.end(done));
  });

  it('should expose reporter', function(done) {
    expect(jscs.reporter).to.be.a('function');
    done();
  });

  describe('options', function() {
    it('should throw error on bad options', function(done) {
      var opts = {badOption: ''};
      try {
        expect(jscs(opts)).to.throw(PluginError);
      } catch (error) {
        expect(error).to.be.instanceof(PluginError);
      }
      done();
    });

    it('should ignore files based on "excludeFiles"', function(done) {
      var opts = {excludeFiles: ['file0.js']};
      stream()
        .pipe(assert.first(function(file) {
          file.path = 'file0.js';
        }))
        .pipe(jscs(opts))
        .pipe(assert.first(function(file) {
          expect(file.jscs.ignored).to.equal(true);
        }))
        .pipe(assert.end(done));
    });

    it('should ignore files based on "fileExtensions"', function(done) {
      var opts = {fileExtensions: ['.js']};
      stream()
        .pipe(assert.first(function(file) {
          file.path = 'file0.js.test';
        }))
        .pipe(jscs(opts))
        .pipe(assert.first(function(file) {
          expect(file.jscs.ignored).to.equal(true);
        }))
        .pipe(assert.end(done));
    });

    it('should support "esnext"', function(done) {
      var opts = {esnext: true, fileExtensions: ['.js']};
      stream('fakeVar => fakeVar;')
        .pipe(jscs(opts))
        .pipe(assert.first(function(file) {
          expect(file.jscs.success).to.equal(true);
        }))
        .pipe(assert.end(done));
    });

    describe('with string as argument', function() {
      it('should throw error on config file not found', function(done) {
        var opts = fixtures('jshintrc.json.test');
        try {
          expect(jscs(opts)).to.throw(PluginError);
        } catch (error) {
          expect(error).to.be.instanceof(PluginError);
        }
        done();
      });

      it('should load config from path', function(done) {
        var opts = fixtures('jshintrc.json');
        stream('var obj = { key: "value" };')
          .pipe(jscs(opts))
          .pipe(assert.first(function(file) {
            expect(file.jscs.success).to.equal(true);
          }))
          .pipe(assert.end(done));
      });
    });

    describe('with object as argument', function() {
      it('should throw error on config file not found', function(done) {
        var opts = {configPath: fixtures('jshintrc.json.test')};
        try {
          expect(jscs(opts)).to.throw(PluginError);
        } catch (error) {
          expect(error).to.be.instanceof(PluginError);
        }
        done();
      });

      it('should load config from path', function(done) {
        var opts = {configPath: fixtures('jshintrc.json')};
        stream('var obj = { key: "value" };')
          .pipe(jscs(opts))
          .pipe(assert.first(function(file) {
            expect(file.jscs.success).to.equal(true);
          }))
          .pipe(assert.end(done));
      });

      it('should load config from default config file if only "esnext" option', function(done) {
        var opts = {esnext: true};
        stream('var obj = { key: "value" };')
          .pipe(jscs(opts))
          .pipe(assert.first(function(file) {
            expect(file.jscs.success).to.equal(false);
          }))
          .pipe(assert.end(done));
      });

      it('should load config from object with "esnext" options', function(done) {
        var opts = {esnext: true, requireSpacesInsideObjectBrackets: 'all'};
        stream('var obj = { key: "value" };')
          .pipe(jscs(opts))
          .pipe(assert.first(function(file) {
            expect(file.jscs.success).to.equal(true);
          }))
          .pipe(assert.end(done));
      });
    });
  });
});
