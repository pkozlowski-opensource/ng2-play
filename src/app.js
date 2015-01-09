import {bootstrap, Component, TemplateConfig} from 'core/core';

@Component({
    selector: 'hello-app',  //TODO: default to ng-app if not provided?
    template: new TemplateConfig({ //TODO: if a string is provided, default to template string (or its URL?)
        inline: `<span>Hello, {{name}}!</span>`,
        directives: [], //TODO: this is mandatory, even if empty (not sure if this happens for all components or only app-level ones)... => PR...
    })
})
class AppCmpt {
    constructor() {
        this.name = 'World'; //TODO: how to declare a field with its default value (so I don't need a constructor)?
    }
}

export function main() { //TODO: maybe we could use sth like <div ng-app="app::AppCmpt"></div> or similar?
    bootstrap(AppCmpt);
}