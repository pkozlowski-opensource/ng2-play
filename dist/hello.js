System.register(['angular2/core', 'angular2/platform/browser', 'angular2/http', 'angular2/router', './components/home/home', './components/post/post'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, browser_1, http_1, router_1, home_1, post_1;
    var APP;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (browser_1_1) {
                browser_1 = browser_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (home_1_1) {
                home_1 = home_1_1;
            },
            function (post_1_1) {
                post_1 = post_1_1;
            }],
        execute: function() {
            APP = (function () {
                function APP() {
                }
                APP = __decorate([
                    router_1.RouteConfig([
                        { path: '/snaps', component: home_1.HomeComponent, as: 'Home', useAsDefault: true },
                        { path: '/snaps/:id', component: post_1.PostComponent, as: 'Post' }
                    ]),
                    core_1.Component({
                        selector: 'app',
                        templateUrl: 'src/components/app/app.html',
                        directives: [router_1.ROUTER_DIRECTIVES]
                    }), 
                    __metadata('design:paramtypes', [])
                ], APP);
                return APP;
            })();
            exports_1("APP", APP);
            browser_1.bootstrap(APP, [http_1.JSONP_PROVIDERS, router_1.ROUTER_PROVIDERS, core_1.provide(router_1.LocationStrategy, { useClass: router_1.HashLocationStrategy }),
                core_1.provide(router_1.APP_BASE_HREF, { useValue: '/' })]);
        }
    }
});
