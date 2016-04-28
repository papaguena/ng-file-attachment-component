'use strict';

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
    ngHtml2Js = require("gulp-ng-html2js");




var tsProject = ts.createProject('tsconfig.json');

var tsSrc = 'src/**/*.ts',
    tsExternalDefinitions = 'typings/**/*.d.ts';

gulp.task('clean-ts', function (cb) {
    // delete the files
    del(['dist/**/*.js', 'dist/**/*.js.map', 'dist/**/*.d.ts'], cb);
});

//TODO MGA: fix ts-lint task
gulp.task('ts-lint', function () {
    return gulp.src([tsSrc]).pipe(tslint()).pipe(tslint.report('verbose'));
    //return gulp.src(tsSrc).pipe(tslint({ configuration: require("./tslint.json")})).pipe(tslint.report('prose'));
});

gulp.task('compile-ts', function () {
    var tsResults = gulp.src([tsSrc, tsExternalDefinitions])
                        .pipe(sourcemaps.init())// This means sourcemaps will be generated
                        .pipe(ts(tsProject));
    return merge([
        tsResults.dts.pipe(concat('ng-file-attachment-component.d.ts'))//TODO MGA : hardcoded output file to extract
                     .pipe(gulp.dest('dist/definitions')),

        tsResults.js//.pipe(concat('ng-http-wrapper.min.js'))
                    .pipe(concat('ng-file-attachment-component.js'))//Comment uglify to get un-minified sources
                    .pipe(ngAnnotate())//TODO MGA : check if it breaks sourcemaps ?
                    .pipe(sourcemaps.write())// Now the sourcemaps are added to the .js file //TODO MGA: sourcemaps keeps track of original .ts files + the concatenated .js file : how to only have the 2 original ts files ?
                    //.pipe(rename({ suffix: '.min' }))
                    //.pipe(uglify()) //Uncomment to activate minification TODO MGA: minification breaks ng-annotate & source-mappings. TOFIX.
                    .pipe(gulp.dest('dist/js'))
    ]);
});

gulp.task('compile-tpl', function () {
    gulp.src("src/**/*.html")
    .pipe(ngHtml2Js({
        moduleName: "file-attachment-component-tpl",
        //prefix: "/partials"
    }))
    .pipe(concat('ng-file-attachment-component.tpl.js'))//Comment uglify to get un-minified sources
    .pipe(gulp.dest("dist/partials"));
});

//TODO MGA: fix ts-lint step
gulp.task('default', ['clean-ts', 'compile-tpl', 'compile-ts']);
//gulp.task('default', ['ts-lint', 'clean-ts', 'compile-ts']);
