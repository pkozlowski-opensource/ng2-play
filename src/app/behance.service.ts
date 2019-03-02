import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap, catchError } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BehanceService {
  constructor(private http: HttpClient) { }

  getPosts() {
    return this.http.jsonp(
      environment.api + 'collections/170716829/projects?per_page=20&page=' + 1 + '&api_key=' + environment.token, 'callback'
    );
  }

  getPost(id) {
    return this.http.jsonp(
      environment.api + 'projects/' + id + '?api_key=' + environment.token, 'callback'
    );
  }
}
