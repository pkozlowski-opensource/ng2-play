import {bootstrap, Component, TemplateConfig} from 'core/core';

@Component({
    selector: 'hello-app',  //default to ng-app?
    template: new TemplateConfig({ //if a string is provided, default to template string (or its URL?)
        inline: `<span>Hello, {{name}}!</span>`,
        directives: [], //this is mandatory, even if empty (not sure if this happens for all components or only app-level ones)... => PR...
    })
})
class AppCmpt {
    constructor() {
        this.name = 'World'; //how to declare a field with its default value (so I don't need a constructor)?
    }
}

export function main() { //maybe we could use sth like <div ng-app="app::AppCmpt"></div> or similar?
    bootstrap(AppCmpt);
}