import {ComponentAnnotation as Component, ViewAnnotation as View, bootstrap, NgIf, EventEmitter} from 'angular2/angular2';
import {BsAlert} from './alert/alert';

@Component({
    selector: 'hello'
})
@View({
    template: `<bs-alert [dismissible]="true" type="success" (dismiss)="closed()">some content</bs-alert>`,
    directives: [BsAlert]
})
export class Hello {
    closed() {
        console.log('closed');
    }
}

bootstrap(Hello);
