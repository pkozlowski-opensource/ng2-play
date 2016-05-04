import {Component} from '@angular/core';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {DateRangePicker, Collapse} from 'fuel-ui/fuel-ui';

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

        <button class="btn btn-primary" (click)="collapsed = !collapsed">Toggle Collapse</button>
        <style>
            #collapse-demo-box {
                border: 1px solid black; 
                padding: 0 25px;
            }
        </style>
        <div id="collapse-demo-box" [collapse]="collapsed" [duration]="duration">
            <h2>All of your content</h2>
            <ul>
                <li>That you wish</li>
                <li>to be able</li>
                <li>to collapse</li>
            </ul>
            <p>At any time!</p>
        </div>
    `,
    directives: [DateRangePicker, Collapse]
})
export class HelloApp {
    name: string = 'World';
    collapsed: boolean = false;
    duration: number = 500;
}

bootstrap(HelloApp);