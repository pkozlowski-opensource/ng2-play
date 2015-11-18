import {Component, bootstrap} from 'angular2/angular2';
import {Accordion, Panel} from './parent_child';

@Component({
    selector: 'hello-app',
    template: `
        <accordion>
            <panel title="Panel 1">Panel 1 content</panel>
            <panel title="Panel 2">Panel 2 content</panel>
            <panel title="Panel 3">Panel 3 content</panel>
        </accordion>
    `,
    directives: [Accordion, Panel]
})
export class HelloApp {
    name: string = 'World';
}

bootstrap(HelloApp);