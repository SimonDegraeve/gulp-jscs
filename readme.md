# [gulp](http://gulpjs.com)-jscs

[![Build Status](https://travis-ci.org/SimonDegraeve/gulp-jscs.svg?branch=master)](https://travis-ci.org/SimonDegraeve/gulp-jscs) [![Coverage Status](https://img.shields.io/coveralls/SimonDegraeve/gulp-jscs.svg)](https://coveralls.io/r/SimonDegraeve/gulp-jscs) [![Dependencies Status](https://david-dm.org/SimonDegraeve/gulp-jscs.png)](https://david-dm.org/SimonDegraeve/gulp-jscs)

> Check JavaScript code style with [jscs](https://github.com/jscs-dev/node-jscs)

*Issues with the output should be reported on the jscs [issue tracker](https://github.com/jscs-dev/node-jscs/issues).*


## Install

```sh
$ npm install --save-dev SimonDegraeve/gulp-jscs
```


## Usage

```js
var gulp = require('gulp');
var jscs = require('gulp-jscs');

gulp.task('default', function () {
  return gulp.src('src/app.js')
    .pipe(jscs());
    .pipe(jscs.reporter()); // Default: Use the console built-in jscs reporter

    /*
      You can use any built-in jscs reporters
      ex: jscs.reporter('text')

      Or a function
      ex: jscs.reporter(function(errors) { console.log(errors); })

      Or a module
      ex: npm install SimonDegraeve/jscs-stylish
          stylish = require('jshint-stylish');
          jscs.reporter(stylish);
    */

    .pipe(jscs.reporter('fail')); // Abort the task
});
```


## API

### jscs(configPath | options)

#### configPath

Type: `string`  
Default: `'./.jscsrc'`

Path to the [.jscsrc](https://github.com/jscs-dev/node-jscs#options).

#### options

Type: `object`  
Default: `{}`

```js
{
  // Use esprima harmony parser
  esnext: true,

  // Path to the .jscsrc or any valid jscs options
  configPath: './.jscsrc'
}
```

## License

MIT © SimonDegraeve
