import {ComponentAnnotation as Component, ViewAnnotation as View, bootstrap, NgIf, EventEmitter} from 'angular2/angular2';

@Component({
    selector: 'bs-alert',
    properties: ['type', 'dismissible'],
    events: ['dismiss']
})
@View({
    template: `<div attr.class="alert alert-{{_type}}" [class.alert-dismissible]="_dismissible" role="alert">
                    <button *ng-if="_dismissible" type="button" class="close" aria-label="Close" (^click)="close()">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <ng-content></ng-content>
                </div>`,
    directives: [NgIf]
})
class BsAlert {
    _availableTypes = ['success', 'info', 'warning', 'danger'];
    _dismissible = false;
    _type = this._availableTypes[2];
    dismiss = new EventEmitter();

    set type(val) {
        this._type = this._availableTypes.indexOf(val) ? val : this._availableTypes[2];
    }

    set dismissible(val) {
        this._dismissible = String(val) == "true";
    }
    
    close() {
        this.dismiss.next();
    }
}

@Component({
    selector: 'hello'
})
@View({
    template: `<bs-alert [dismissible]="true" type="warning" (dismiss)="closed()">some content</bs-alert>`,
    directives: [BsAlert]
})
export class Hello {
    
    closed() {
        console.log('closed');
    }
}

bootstrap(Hello);
