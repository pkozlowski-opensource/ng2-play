import {ComponentAnnotation as Component, ViewAnnotation as View, NgFor, EventEmitter} from 'angular2/angular2';

@Component({
  selector: 'bs-pagination',
  properties: ['pageNo', 'collectionSize', 'pageSize'],
  events: ['pageChange']
})
@View({
  templateUrl: 'pagination/pagination.html',
  directives: [NgFor]
})
export class BsPagination {
  pageChange = new EventEmitter();
  _collectionSize;
  _pageNo = 0;
  _pageSize = 10; //TODO: how this should be configured "globally"?
  _pages = [];

  set pageNo(newPageNo) {
    //TODO: type conversion - this could be a string
    this.selectPage(newPageNo);
  }

  set collectionSize(newSize) {
    //TODO: type conversion - this could be a string
    this._collectionSize = newSize;
    this._updatePages();
  }

  set pageSize(newSize) {
    //TODO: type conversion - this could be a string
    this._pageSize = newSize || 10;
    this._updatePages();
  }

  hasPrevious() {
    return this._pageNo > 1;
  }

  hasNext() {
    return this._pageNo < this._pages.length;
  }

  selectPage(pageNumber) {
    var prevPageNo = this._pageNo;
    this._pageNo = Math.max(Math.min(pageNumber, this._pages.length), 1);

    if (this._pageNo != prevPageNo) {
      this.pageChange.next(this._pageNo);
    }
  }

  //TODO: is lazy-re-calculating the best option here? Would immutable data structures help?
  _updatePages() {

    //re-calculate new length of pages
    var pageCount = Math.ceil(this._collectionSize / this._pageSize);

    //fill-in model needed to render pages
    this._pages.length = 0;
    for (var i = 1; i <= pageCount; i++) {
      this._pages.push(i);
    }

    //make sure that the selected page is within available pages range
    this.selectPage(this._pageNo);
  }
}