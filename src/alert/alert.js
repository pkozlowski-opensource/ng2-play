import {ComponentAnnotation as Component, ViewAnnotation as View, NgIf, EventEmitter} from 'angular2/angular2';

@Component({
    selector: 'bs-alert',
    properties: ['type', 'dismissible'],
    events: ['dismiss']
})
@View({
    templateUrl: 'alert/alert.html',
    directives: [NgIf]
})
export class BsAlert {
    static alertTypes = ['success', 'info', 'warning', 'danger'];
    _dismissible = false;
    _type = BsAlert.alertTypes[2];
    dismiss = new EventEmitter();

    set type(val) {
        this._type = BsAlert.alertTypes.indexOf(val) !== -1 ? val : BsAlert.alertTypes[2];
    }

    set dismissible(val) {
        this._dismissible = String(val) == "true";
    }

    close() {
        this.dismiss.next();
    }
}

//TODO: self-closing as a default handler?