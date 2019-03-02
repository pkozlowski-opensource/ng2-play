import { Component, OnInit } from '@angular/core';
import { BehanceService } from '../behance.service';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  post$;
  isFavorite: boolean;
  constructor(private behance: BehanceService, private route: ActivatedRoute) {
    this.post$ = this.behance.getPost(this.route.snapshot.params.id).pipe(
      map((data: any) => data.project)
    );
  }

  ngOnInit() {
    this.isFavorite = (JSON.parse(localStorage.getItem('favorites')) || {})[this.route.snapshot.params.id];
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    localStorage.setItem('favorites',
      JSON.stringify({
        ...JSON.parse(localStorage.getItem('favorites')),
        [this.route.snapshot.params.id]: this.isFavorite
      })
    );
  }

}
