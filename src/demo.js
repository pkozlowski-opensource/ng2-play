import {ComponentAnnotation as Component, ViewAnnotation as View, bootstrap, NgIf, EventEmitter, formDirectives} from 'angular2/angular2';
import {BsAlert} from './alert/alert';
import {BsPagination} from './pagination/pagination';

@Component({
    selector: 'bs-demo-app'
})
@View({
    templateUrl: 'demo.html',
    directives: [formDirectives, BsAlert, BsPagination]
})
export class BsDemoApp {
    pagination = {
      collection: 100,
      items: 10
    };


    alertClosed() {
        console.log('Alert closed');
    }

    pageChanged($event) {
        console.log('Page changed', $event);
    }
}

bootstrap(BsDemoApp);
