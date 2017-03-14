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
    var tscConfig = require('./tsconfig.json');

    var tsResult = gulp
        .src([PATHS.src, 'node_modules/angular2/typings/browser.d.ts'])
        .pipe(typescript(tscConfig.compilerOptions));

    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('play', ['ts2js'], function () {
    var http    = require('http');
    var open    = require('open');
    var fs      = require("fs");
    var port    = 9000;
    gulp.watch(PATHS.src, ['ts2js']);

    function serveFile(req, res){
        var filePath = "."+ req.url;
        if(filePath == "./"){
            filePath = "./index.html";
        }
        fs.readFile(filePath, function(err, file){
            if(err){
                var isStaticContent = filePath.match(/.css|.js|.png|.jpeg/i);
                if(!isStaticContent){
                    req.url = "/";
                    serveFile(req, res);
                    return;
                }
                res.write(err.toString());
            } else {
                res.write(file);
            }
            res.end();
        });
    }
    http.createServer(serveFile).listen(port, function () {
        open('http://localhost:' + port);
    });
});

gulp.task('default', ['play']);
