var gulp = require("gulp");
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task("watch", function () {
    gulp.watch('./src/*.js', ['compile'])
});  

gulp.task('compile', function () {
    browserify({
        entries: './src/bookmark-search.js',
        debug: false
    })
    .transform(babelify)
    .bundle()
    .pipe(source('bookmark-search.js'))
    .pipe(gulp.dest('./dist'))
})