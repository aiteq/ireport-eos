import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//import { EventsComponent } from './events.component';
import { EventsListComponent } from './events-list.component';
import { AuthGuard } from '../auth/auth-guard.service';

const appRoutes: Routes = [
/*{
  path: 'events',
  component: EventsComponent,
  //canActivate: [AuthGuard]
},*/
{
  path: 'list',
  component: EventsListComponent,
  canActivate: [AuthGuard]
},];

export const eventsRouting: ModuleWithProviders = RouterModule.forChild(appRoutes);
