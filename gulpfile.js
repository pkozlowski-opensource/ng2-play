var gulp = require('gulp');

//TODO: this _needs_ to be extracted to a dedicated gulp plugin, see: https://github.com/sindresorhus/gulp-traceur/issues/54
//more generally - we should better understand what is missing from the the gulp-traceur so it can be used for Angular2 projects
function transpile(options) {

    var traceur = require('traceur');
    var through = require('through2');
    var path = require('path');

    function cloneFile(file, override) {
        var File = file.constructor;
        return new File({
            path: override.path || file.path,
            cwd: override.cwd || file.cwd,
            contents: new Buffer(override.contents || file.contents),
            base: override.base || file.base});
    }

    return through.obj(function (file, enc, done) {

        var originalFilePath = file.history[0];

        try {
            options.moduleName = path.basename(originalFilePath, '.js');
            var transpiledContent = traceur.compile(file.contents.toString(), options, originalFilePath);
            this.push(cloneFile(file, {contents: transpiledContent}));
            done();

        } catch (errors) {
            if (errors.join) {
                throw new Error('gulp-traceur:\n  ' + errors.join('\n  '));
            } else {
                console.error('Error when transpiling:\n  ' + originalFilePath);
                throw errors;
            }
        }
    });
}

var PATHS = {
    src: {
        js: 'src/*.js',
        html: 'src/*.html'
    },
    lib: [
        'node_modules/traceur/bin/traceur-runtime.js',
        'node_modules/es6-module-loader/dist/es6-module-loader-sans-promises.src.js',
        'node_modules/systemjs/lib/extension-register.js',
        'lib/*.*'
    ]
};

gulp.task('js', function () {
    return gulp.src('src/**/*.js')
        .pipe(transpile({
            modules: 'instantiate',
            annotations: true,
            types: true
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