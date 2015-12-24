System.register(['angular2/core', './../../services/dribbble', 'angular2/router'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, dribbble_1, router_1;
    var PostComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (dribbble_1_1) {
                dribbble_1 = dribbble_1_1;
            },
            function (router_1_1) {
                router_1 = router_1_1;
            }],
        execute: function() {
            PostComponent = (function () {
                function PostComponent(dl, rp) {
                    var _this = this;
                    dl.getPost(rp.params.id).subscribe(function (res) {
                        _this.post = res.json().data;
                    });
                }
                PostComponent = __decorate([
                    core_1.Component({
                        selector: 'post',
                        templateUrl: 'src/components/post/post.html',
                        providers: [dribbble_1.Dribbble]
                    }), 
                    __metadata('design:paramtypes', [dribbble_1.Dribbble, router_1.RouteParams])
                ], PostComponent);
                return PostComponent;
            })();
            exports_1("PostComponent", PostComponent);
        }
    }
});
