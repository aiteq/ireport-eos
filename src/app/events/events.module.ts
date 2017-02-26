import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { MomentModule } from 'angular2-moment';
import { Angular2FontAwesomeModule } from 'angular2-font-awesome/angular2-font-awesome';

import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../auth/auth-guard.service';
import { eventsRouting } from './events.routing';
//import { EventsComponent } from './events.component';
import { EventsListComponent } from './events-list.component';
import { EventInlineComponent } from './event-inline.component';
import { EventFormComponent } from './event-form.component';
//import { UserNameAsyncPipe } from '../user/user.utilities';
import { UserItemComponent } from '../user/user-item.component';
import { UserSelectComponent } from '../user/user-select.component';
import { EventTypeComponent } from './event-type.component';

@NgModule({
  imports: [
    eventsRouting,
    SharedModule,
    CommonModule,
    FormsModule,
    NgbModule,
    MomentModule,
    Angular2FontAwesomeModule,
  ],

  providers: [
    AuthGuard,
  ],

  declarations: [
    //EventsComponent,
    EventsListComponent,
    EventInlineComponent,
    EventFormComponent,
    EventTypeComponent,
    UserItemComponent,
    UserSelectComponent,
  ]
})
export class EventsModule { }