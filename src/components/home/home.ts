import {Component} from 'angular2/core';
import {ROUTER_DIRECTIVES, CanDeactivate, ComponentInstruction} from 'angular2/router'
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
    dl:Dribbble;
    page = 0;
    constructor(dl: Dribbble){
        this.dl = dl;
        this.page = 1;
        this.dl.getPosts(this.page).subscribe(res => {
            this.posts = res.json().data;
        });
    }
    routerCanDeactivate(next: ComponentInstruction, prev: ComponentInstruction) {
        window.scrollTo(0, 0);
        return true;
    }
    gotoPost(id){
        alert(id);
    }
    loadMore() {
        this.page++;
        this.dl.getPosts(this.page).subscribe(res => {
            res.json().data.forEach(post => {
                this.posts.push(post);
            });
        })
    }
}