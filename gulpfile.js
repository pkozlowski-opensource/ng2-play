var gulp = require('gulp');

var PATHS = {
    src: 'src/**/*.ts'
};

gulp.task('clean', function (done) {
    var del = require('del');
    del(['dist'], done);
});

gulp.task('ts2js', function () {
    var typescript = require('gulp-typescript');
    var sourcemaps = require('gulp-sourcemaps');
    var tscConfig = require('./tsconfig.json');

    var tsResult = gulp
        .src(PATHS.src)
        .pipe(sourcemaps.init())
        .pipe(typescript(tscConfig.compilerOptions));

    return tsResult.js.pipe(sourcemaps.write()).pipe(gulp.dest('dist'));
});

gulp.task('play', ['ts2js'], function () {
    var http = require('http');
    var connect = require('connect');
    var serveStatic = require('serve-static');
    var open = require('open');

    var port = 9000, app;

    gulp.watch(PATHS.src, ['ts2js']);

    app = connect().use(serveStatic(__dirname));
    app.use(function (req, res) {
        // redirect 404s to index.html
        fs.readFile(__dirname + '/index.html', function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
    }); 
    http.createServer(app).listen(port, function () {
        open('http://localhost:' + port);
    });
});

gulp.task('default', ['play']);
