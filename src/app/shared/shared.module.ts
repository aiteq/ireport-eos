import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Angular2FontAwesomeModule } from 'angular2-font-awesome/angular2-font-awesome';

import { FocusDirective } from '../atq/focus.directive';
import { EmptyDirective } from '../atq/empty.directive';

@NgModule({
  imports: [
    CommonModule,
    Angular2FontAwesomeModule,
  ],

  declarations: [
    FocusDirective,
    EmptyDirective,
  ],

  exports: [
    FocusDirective,
    EmptyDirective,
  ]
})
export class SharedModule { }