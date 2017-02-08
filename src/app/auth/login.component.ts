import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2';

@Component({
  templateUrl: './login.component.html'
})
export class LoginComponent {
  public error: any;
  public email: string = 'tomas.klima@gmail.com';
  public password: string = '122333';

  constructor(private af: AngularFire, private router: Router) { }

  onSubmit(formData: any) {
    if (formData.valid) {
      console.log(formData.value);
      this.af.auth.login({
        email: formData.value.email,
        password: formData.value.password
      }).then((success) => {
          console.log(success);
          this.router.navigate(['/home']);
        }).catch((err) => {
          console.log(err);
          this.error = err.message;
        })
    } else {
      this.error = 'Your form is invalid';
    }
  }

  loginGoogle() {
    this.af.auth.login({
      provider: AuthProviders.Google,
      method: AuthMethods.Popup
    }).then((success) => {
      console.log(success);
      this.router.navigate(['/home']);
    }).catch((err) => {
      console.log(err);
      this.error = err.message;
    })
  }

  loginFacebook() {
    this.af.auth.login({
      provider: AuthProviders.Facebook,
      method: AuthMethods.Popup
    }).then((success) => {
      console.log(success);
      this.router.navigate(['/home']);
    }).catch((err) => {
      console.log(err);

      /* TO-DO */
      /*
      if (err.code == 'auth/account-exists-with-different-credential') {
        // try to link with an existing account
        // we have to use standard Firebase API while Angularfire doesn't implement linking yet

      }
      */

      this.error = err.message;
    })
  }

  loginTwitter() {
    this.af.auth.login({
      provider: AuthProviders.Twitter,
      method: AuthMethods.Popup
    }).then((success) => {
      console.log(success);
      this.router.navigate(['/home']);
    }).catch((err) => {
      console.log(err);
      this.error = err.message;
    })
  }
}