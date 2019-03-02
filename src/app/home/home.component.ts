import { Component, OnInit } from '@angular/core';

import { BehanceService } from '../behance.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  posts$ = this.behance.getPosts().pipe(map((data: any) => data.projects));
  constructor(private behance: BehanceService) {

  }

  ngOnInit() {
    this.behance.getPosts();
  }

}
