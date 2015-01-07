import {SALUTATION} from 'salutation';

export class Greeter {
    say(name) {
        console.log(SALUTATION + ', ' + name + '!');
    }
}