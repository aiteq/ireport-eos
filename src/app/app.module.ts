import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFireModule, FIREBASE_PROVIDERS, AngularFire, AuthMethods, AuthProviders } from 'angularfire2';

import { AppComponent, PageNotFoundComponent } from './app.component';
import { TestComponent } from './test.component';
import { EntityManager, EntityRegistry, AngularfireEntityManager } from './atq/persistence';
import { AuthModule } from './auth/auth.module';
import { AppRouting } from './app.routing';
import { EventsModule } from './events/events.module';

import { firebaseConfig } from './firebase';

@NgModule({
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AppRouting,
    AuthModule,
    EventsModule,
    NgbModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    TestComponent,
    PageNotFoundComponent
  ],
  providers: [
    { provide: EntityManager, useClass: AngularfireEntityManager },
    EntityRegistry
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }