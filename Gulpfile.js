'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    plumber = require('gulp-plumber'),
    jshint = require('gulp-jshint'),
    jscs = require('./lib/plugin'),
    jscsStylish = require('jscs-stylish'),
    jshintStylish = require('jshint-stylish'),
    paths = {
      'src.scripts': ['lib/**/*.js', '!lib/**/__test__/*.js'],
      'src.tests': ['lib/**/__test__', 'lib/**/__test__/*.js'],
      'src.tests.loader': ['test-loader.js']
    };

gulp.task('test', ['lint'], function(done) {
  gulp.src(paths['src.scripts'])
    .pipe(istanbul({
      includeUntested: true
    }))
    .on('finish', function() {
      gulp.src(paths['src.tests.loader'], {read: false})
        .pipe(plumber())
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          reporters: ['text', 'text-summary']
        }))
        .on('end', done);
    });
});

gulp.task('watch:test', ['test'], function() {
  watch(paths['src.tests'], {name: 'src.tests', read: false}, function() {
    gulp.start('test');
  });
});

gulp.task('lint', function() {
  return gulp.src(paths['src.scripts'].concat(paths['src.tests']))
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jscs())
    .pipe(jscs.reporter(jscsStylish));
});

gulp.task('default', ['test']);
