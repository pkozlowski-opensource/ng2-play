import {Component, View, bootstrap, CORE_DIRECTIVES} from 'angular2/angular2';

@Component({ selector: 'hello-app' })
@View({template: `
    <h1>Hello, {{name}}!</h1>
    Say hello to: <input [value]="name" (input)="name = $event.target.value">
` })
export class HelloApp {
    name: string = 'World';
}

bootstrap(HelloApp);