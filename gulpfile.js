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

gulp.task('clean-dist', function () {
    // delete the files
    //TODO MGA: use del without return ? sync enough to wait for it ?
    return del(['dist/**/*.*']);
});

//TODO MGA: fix ts-lint task
gulp.task('ts-lint', ['clean-dist'], function () {
    return gulp.src([tsSrc])
        .pipe(tslint({
            configuration: "tslint.json",
            formatter: "verbose"
        })).pipe(tslint.report());
    //return gulp.src(tsSrc).pipe(tslint({ configuration: require("./tslint.json")})).pipe(tslint.report('prose'));
});

gulp.task('compile-ts', ['clean-dist'], function () {
    //gulp.task('compile-ts', ['clean-dist','ts-lint'], function () { // TODO MGA: fix ts-lint and add as dependency
    var tsResults = gulp.src([tsSrc, tsExternalDefinitions])
                        .pipe(sourcemaps.init())// This means sourcemaps will be generated
                        .pipe(ts(tsProject));
    return merge([
        tsResults.dts.pipe(concat(tsdOutputFileName))//TODO MGA : hardcoded output file to extract
                     .pipe(gulp.dest(tsdOutputDir)),

        tsResults.js.pipe(concat(tsOutputFileName))//Comment uglify to get un-minified sources
                    //TODO MGA: breaks source maps ?
                    .pipe(ngAnnotate())
                    //TODO MGA: we should not minify by default, but let consumer build tools take care of that ?
                    //.pipe(uglify()) //comment/uncomment to toggle minification
                    //TODO MGA: sourcemaps keeps track of original .ts files + the concatenated .js file : how to only have the 2 original ts files ?
                    .pipe(sourcemaps.write())// Now the sourcemaps are added to the .js file
                    //.pipe(rename({ suffix: '.min' })) //comment/uncomment based on minification turned on or not
                    .pipe(gulp.dest(tsOutputDir))
    ]);
});

/**
 * 1 - compress html
 * 2 - run html2js
 * 3 - concatenate output files
 * 4 - compress output js
 * TODO MGA: keep track of sourcemaps ?
 */
gulp.task('compile-tpl', ['clean-dist'], function () {
    return gulp.src(partialsSrc)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
            //removeEmptyElements: true // makes font-awesome icons disapear
        }))
        .pipe(ngHtml2Js({ moduleName: 'file-attachment-component-tpl' }))
        .pipe(concat(tplOutputFileName))
        //TODO MGA: we should not minify by default, but let consumer build tools take care of that ?
        //.pipe(uglify()) //js minification turned on by default for templates
        //.pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(tplOutputDir));
});


/**
 * 1 - compress CSS
 * 2 - concatenate css in 1 file
 * 3 - keep tracks of sourceMaps
 */
gulp.task('compile-css', ['clean-dist'], function () {
    return gulp.src(cssSrc)
    .pipe(sourcemaps.init())
    //TODO MGA: we should not minify by default, but let consumer build tools take care of that ?
    //.pipe(cleanCSS()) //minification turned on by default for css
    .pipe(concat(cssOutputFileName))
    //.pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(cssOutputDir));
});


//TODO MGA: fix ts-lint step & add-it + put dependency on it for other tasks ?
gulp.task('default', ['clean-dist', 'compile-ts', 'compile-tpl', 'compile-css']);
