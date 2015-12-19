import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router'
import {Dribbble} from './../../services/dribbble';
@Component({
	selector: 'home',
	templateUrl: 'src/components/home/home.html',
	providers: [Dribbble],
    directives: [ROUTER_DIRECTIVES]
})
export class HomeComponent {
	name: string = 'World';
    posts;
    
    constructor(dl: Dribbble){
        dl.getPosts().subscribe(res => {
            this.posts = res.json().data;
        });
    }
    gotoPost(id){
        alert(id);
    }
}