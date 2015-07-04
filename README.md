ng2-play
========

The goal of this repo is to prepare a minimal ("walking skeleton") project build with Angular2.0 and ES6

## Install

Clone this repo and execute in your favourite shell:

* `npm i -g gulp` to install gulp globally (if you don't have it installed already)
* `npm i` to install local npm dependencies

## Play

After completing installation type in your favourite shell:

* `gulp play` (or `npm start`) to start a "Hello World" app in a new browser window. App files are observed and will be re-transpiled on each change.

## Dependencies

### Build-time

* [traceur](https://github.com/google/traceur-compiler): ES6 -> ES5 transpilation
* [ystemjs/builder](https://github.com/systemjs/builder): ES6 modules bundler

### Run-time

* [traceur-runtime](https://github.com/google/traceur-compiler): traceur utils and ES6 polyfill
* [reflect-metadata](https://github.com/rbuckton/ReflectDecorators): ES7 Reflection API for Decorator Metadata polyfill
* [systemjs](https://github.com/systemjs/systemjs): ES6 modules loading (module loader polyfill)

## Learning materials

### ES6 module loading

* [Practical Workflows for ES6 Modules, Fluent 2014](https://www.youtube.com/watch?v=0VUjM-jJf2U)
* [Guy Bedford: Package Management for ES6 Modules, JSConf2014](https://www.youtube.com/watch?v=szJjsduHBQQ)
* [Loader API specification](http://whatwg.github.io/loader/) 

### Zones / long stack-traces

* [original repo](https://github.com/angular/zone.js)
* [zones in Dart](https://www.dartlang.org/articles/zones/)
* [zones in node](http://strongloop.com/strongblog/comparing-node-js-promises-trycatch-zone-js-angular/)