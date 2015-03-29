import {Component, Template} from 'angular2/angular2';
import {If} from 'angular2/angular2';

@Component({
    selector: 'hello'  //TODO: default to camel-cased class name if not provided?
})
@Template({
    inline: `<span *if="name">Hello, {{name}}!</span>`,
    directives: [If]
})
export class Hello {
    name: string = 'World';
    constructor() {
        setTimeout(() => {
          this.name = 'NEW World'
        }, 2000);
    }
}
