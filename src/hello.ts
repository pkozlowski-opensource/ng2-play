import {Component, Input, NgFor, ContentChild, TemplateRef, bootstrap} from 'angular2/angular2';

@Component({
    selector: 'ngb-rating',
    template: `
        <div>
            <template ng-for [ng-for-of]="ratings" [ng-for-template]="rateTpl" #active="rating < 5">
                <span>X</span>
            </template>
        </div>
    `,
    directives: [NgFor]
})
class NgbRating {
    private ratings: number[] = [];

    @ContentChild(TemplateRef) rateTpl;

    @Input()
    rating: number;

    @Input()
    set maxRating(maxRating: number) {
        this.ratings.length = maxRating;
        for(var i=1; i<=maxRating; i++) {
            this.ratings[i - 1] = i;
        }
    }
}


@Component({
    selector: 'hello-app',
    template: `
        <ngb-rating [max-rating]="5" [rating]="3">
        </ngb-rating>
    `,
    directives: [NgbRating]
})
class HelloApp {
    rating = 6;
}

bootstrap(HelloApp);