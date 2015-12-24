System.register(['angular2/core', 'angular2/router', './../../services/dribbble'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, router_1, dribbble_1;
    var HomeComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            },
            function (dribbble_1_1) {
                dribbble_1 = dribbble_1_1;
            }],
        execute: function() {
            HomeComponent = (function () {
                function HomeComponent(dl) {
                    var _this = this;
                    this.name = 'World';
                    this.page = 0;
                    this.dl = dl;
                    this.page = 1;
                    this.dl.getPosts(this.page).subscribe(function (res) {
                        _this.posts = res.json().data;
                    });
                }
                HomeComponent.prototype.routerCanDeactivate = function (next, prev) {
                    window.scrollTo(0, 0);
                    return true;
                };
                HomeComponent.prototype.gotoPost = function (id) {
                    alert(id);
                };
                HomeComponent.prototype.loadMore = function () {
                    var _this = this;
                    this.page++;
                    this.dl.getPosts(this.page).subscribe(function (res) {
                        res.json().data.forEach(function (post) {
                            _this.posts.push(post);
                        });
                    });
                };
                HomeComponent = __decorate([
                    core_1.Component({
                        selector: 'home',
                        templateUrl: 'src/components/home/home.html',
                        providers: [dribbble_1.Dribbble],
                        directives: [router_1.ROUTER_DIRECTIVES]
                    }), 
                    __metadata('design:paramtypes', [dribbble_1.Dribbble])
                ], HomeComponent);
                return HomeComponent;
            })();
            exports_1("HomeComponent", HomeComponent);
        }
    }
});
