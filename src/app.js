import {bootstrap, Component, Template} from 'angular2/core';

@Component({
    selector: 'hello-app'  //TODO: default to camel-cased class name if not provided?
})
@Template({
    inline: `<span>Hello, {{name}}!</span>`
})
class HelloApp {
    constructor() {
        this.name = 'World'; //TODO: how to declare a field with its default value (so I don't need a constructor)?
        setTimeout(() => {
          this.name = 'NEW World'
        }, 2000);
    }
}

//TODO: maybe we could use sth like <div ng-app="app::AppCmpt"></div> or similar?
export function main() {
    bootstrap(HelloApp);
}