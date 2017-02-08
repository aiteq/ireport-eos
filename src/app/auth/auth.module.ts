import { NgModule }      from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//import { authRouting } from './auth.routing';
import { LoginComponent } from './login.component';

@NgModule({
  imports:      [ 
    FormsModule,
    CommonModule,
    //NgbModule,
   ],
  declarations: [ 
    LoginComponent,
  ]
})
export class AuthModule { }
