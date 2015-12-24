System.register(['angular2/core', 'angular2/http'], function(exports_1) {
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, http_1;
    var Dribbble;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            }],
        execute: function() {
            Dribbble = (function () {
                function Dribbble(jsonp) {
                    this.api = 'http://api.dribbble.com/v1/';
                    this.token = 'bc0239a39745e8604bb996d5ae6cd73ca605d4a0b448de4ab3b21b31fd610966';
                    this.jsonp = jsonp;
                }
                Dribbble.prototype.getPosts = function (page) {
                    return this.jsonp.get(this.api + '/shots?page=' + page + '&access_token=' + this.token + '&callback=JSONP_CALLBACK');
                };
                Dribbble.prototype.getPost = function (id) {
                    return this.jsonp.get(this.api + '/shots/' + id + '?access_token=' + this.token + '&callback=JSONP_CALLBACK');
                };
                Dribbble = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Jsonp])
                ], Dribbble);
                return Dribbble;
            })();
            exports_1("Dribbble", Dribbble);
        }
    }
});
