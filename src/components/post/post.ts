import {Component} from 'angular2/core';
import {Dribbble} from './../../services/dribbble';
import {RouteParams} from 'angular2/router';
@Component({
	selector: 'post',
	templateUrl: 'src/components/post/post.html',
	providers: [Dribbble]
})
export class PostComponent {
	post;
	constructor(dl:Dribbble, rp:RouteParams){
		dl.getPost(rp.params.id).subscribe(res => {
			this.post = res.json().data;
		});
	}
}