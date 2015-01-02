var gulp = require('gulp');
var traceur = require('gulp-traceur');

var PATHS = {
    src: {
        js: 'src/*.js',
        html: 'src/*.html'
    },
    lib: [
        'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
        'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
        'node_modules/systemjs/dist/system.src.js',
        'node_modules/systemjs/lib/extension-register.js'
    ]
};

gulp.task('js', function () {
    return gulp.src(PATHS.src.js)
        .pipe(traceur({
            annotations: true,
            types: true,
            script: false,
            memberVariables: true,
            modules: 'instantiate'
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('html', function () {
    return gulp.src(PATHS.src.html)
        .pipe(gulp.dest('dist'));
});

gulp.task('libs', function () {
    return gulp.src(PATHS.lib)
        .pipe(gulp.dest('dist/lib'));
});

gulp.task('default', ['js', 'html', 'libs']);