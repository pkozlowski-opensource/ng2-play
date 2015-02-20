import {Component, Template} from 'angular2/angular2';

@Component({
    selector: 'hello'  //TODO: default to camel-cased class name if not provided?
})
@Template({
    inline: `<span>Hello, {{name}}!</span>`
})
export class Hello {
    constructor() {
        this.name = 'World'; //TODO: how to declare a field with its default value (so I don't need a constructor)?
        setTimeout(() => {
          this.name = 'NEW World'
        }, 2000);
    }
}
