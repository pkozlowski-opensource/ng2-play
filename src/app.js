import {bootstrap, Component, TemplateConfig} from 'core/core';

@Component({
    selector: 'hello-app',  //TODO: default to camel-cased class name if not provided?
    template: new TemplateConfig({ //TODO: if a string is provided, default to template string (or its URL?)
        inline: `<span>Hello, {{name}}!</span>`
    })
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