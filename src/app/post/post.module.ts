import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostRoutingModule } from './post-routing.module';
import { PostComponent } from './post.component';
import { ColorNamerPipe } from '../color-namer.pipe';

@NgModule({
  declarations: [PostComponent, ColorNamerPipe],
  imports: [
    CommonModule,
    PostRoutingModule
  ],
})
export class PostModule { }
