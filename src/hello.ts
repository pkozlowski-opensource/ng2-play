import {Component, bootstrap} from 'angular2/angular2';
import {Alert} from 'ng2-bootstrap/ng2-bootstrap';

@Component({
    selector: 'hello-app',
    directives: [Alert],
    template: `
        <h1>Hello, {{name}}!</h1>
        Say hello to: <input [value]="name" (input)="name = $event.target.value">
        <alert type="success">Hello world by ng2-bootstrap</alert>
    `
})
export class HelloApp {
    name: string = 'World';
}

bootstrap(HelloApp);