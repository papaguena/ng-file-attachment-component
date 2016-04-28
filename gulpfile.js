'use strict';

// imports
var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    tslint = require('gulp-tslint'),
    del = require('del'),
    merge = require('merge2'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngHtml2Js = require('gulp-ng-html2js'),
    htmlmin = require('gulp-htmlmin'),
    cleanCSS = require('gulp-clean-css');


//ts config
var tsProject = ts.createProject('tsconfig.json');

//gulp file config
var tsSrc = 'src/**/*.ts',
    tsExternalDefinitions = 'typings/**/*.d.ts',
    partialsSrc = 'src/**/*.html',
    cssSrc = 'src/**/*.css';

var tsOutputFileName = 'ng-file-attachment-component.js',
    tsdOutputFileName = 'ng-file-attachment-component.d.ts',
    tplOutputFileName = 'ng-file-attachment-component.tpl.js',
    cssOutputFileName = 'ng-file-attachment-component.css';

var tsOutputDir = 'dist/js',
    tsdOutputDir = 'dist/definitions',
    tplOutputDir = 'dist/partials',
    cssOutputDir = 'dist/css';


/// TASKS ///

gulp.task('clean-dist', function (cb) {
    // delete the files
    del(['dist/**/*.*'], cb);
});

//TODO MGA: fix ts-lint task
gulp.task('ts-lint', function () {
    return gulp.src([tsSrc]).pipe(tslint()).pipe(tslint.report('verbose'));
    //return gulp.src(tsSrc).pipe(tslint({ configuration: require("./tslint.json")})).pipe(tslint.report('prose'));
});

gulp.task('compile-ts', function () { //TODO MGA: clean-dist dependency necessary ?
    var tsResults = gulp.src([tsSrc, tsExternalDefinitions])
                        .pipe(sourcemaps.init())// This means sourcemaps will be generated
                        .pipe(ts(tsProject));
    return merge([
        tsResults.dts.pipe(concat(tsdOutputFileName))//TODO MGA : hardcoded output file to extract
                     .pipe(gulp.dest(tsdOutputDir)),

        tsResults.js.pipe(concat(tsOutputFileName))//Comment uglify to get un-minified sources
                    .pipe(ngAnnotate())
                    .pipe(uglify()) //comment/uncomment to toggle minification //TODO : breaks source maps ?
                    .pipe(sourcemaps.write())// Now the sourcemaps are added to the .js file //TODO MGA: sourcemaps keeps track of original .ts files + the concatenated .js file : how to only have the 2 original ts files ?
                    .pipe(rename({ suffix: '.min' }))
                    .pipe(gulp.dest(tsOutputDir))
    ]);
});

/**
 * 1 - compress html
 * 2 - run html2js
 * 3 - concatenate output files
 * 4 - compress output js
 */
gulp.task('compile-tpl', function () { //TODO MGA: clean-dist dependency necessary ?
    gulp.src(partialsSrc)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyElements: true
        }))
        .pipe(ngHtml2Js({ moduleName: 'file-attachment-component-tpl' }))
        .pipe(concat(tplOutputFileName))//Comment uglify to get un-minified sources
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(tplOutputDir));
});


gulp.task('compile-css', function () { //TODO MGA: clean-dist dependency necessary ?
    return gulp.src(cssSrc)
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(concat(cssOutputFileName))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(cssOutputDir));
});


//TODO MGA: fix ts-lint step & add-it + put dependency on it for other tasks ?
gulp.task('default', ['clean-dist', 'compile-ts', 'compile-tpl', 'compile-css']);
