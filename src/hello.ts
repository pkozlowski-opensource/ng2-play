import {Component, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {Http, HTTP_PROVIDERS, Jsonp, JSONP_PROVIDERS} from 'angular2/http'
import {ROUTER_DIRECTIVES, RouteConfig, APP_BASE_HREF, LocationStrategy, HashLocationStrategy, ROUTER_PROVIDERS} from 'angular2/router'


import {HomeComponent} from './components/home/home';
import {PostComponent} from './components/post/post';

@RouteConfig([
    {path: '/', component: HomeComponent, as: 'Home', useAsDefault: true},
    {path: '/:id', component: PostComponent, as: 'Post'}
])
@Component({
    selector: 'app',
    templateUrl: 'src/components/app/app.html',
    directives: [ROUTER_DIRECTIVES]
})
export class APP {
    
}

bootstrap(APP, [JSONP_PROVIDERS, provide(LocationStrategy, { useClass: HashLocationStrategy }), provide(APP_BASE_HREF, {useValue: '/'}), ROUTER_PROVIDERS]);