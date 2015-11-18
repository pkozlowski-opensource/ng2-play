import {Component, Input, ContentChildren, QueryList, NgFor} from 'angular2/angular2';

@Component({
    selector: 'panel',
    template: `
        <div>
            <div><h3 (click)="toggle()">{{title}}</h3></div>
            <div [hidden]="!open">
                <ng-content></ng-content>
            </div>
        </div>
    `
})
export class Panel {
    @Input() open = false;
    @Input() title: string;

    toggle() {
        this.open = !this.open;
    }
}

@Component({
    selector: 'accordion',
    template: `<ng-content></ng-content>`
})
export class Accordion {
    openPanel: Panel;
    @ContentChildren(Panel) panels: QueryList<Panel>;

    afterContentChecked() {

        var openPanels = this.panels.filter((panel) => {
            return panel.open;
        });

        if (!this.openPanel) {
            // initial rendering
            this.openPanel = openPanels[0];
        } else {
            // subsequent children checks
            for (let i = 0; i < openPanels.length; i++) {
                if (openPanels[i] !== this.openPanel) {
                    this.openPanel = openPanels[i];
                    break;
                }
            }
        }

        for (let i = 0; i < openPanels.length; i++) {
            if (openPanels[i] !== this.openPanel) {
                openPanels[i].open = false;
            }
        }
    }
}