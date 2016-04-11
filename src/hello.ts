import {Component} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {DateRangePicker} from 'fuel-ui/fuel-ui';

@Component({
    selector: 'hello-app',
    template: `
        <h1>Hello, {{name}}!</h1>
        Say hello to: <input [value]="name" (input)="name = $event.target.value">
        <div class="row">
            <div class="col-md-4">
                <date-range-picker></date-range-picker>
            </div>
        </div>
    `,
    directives: [DateRangePicker]
})
export class HelloApp {
    name: string = 'World';
}

bootstrap(HelloApp);