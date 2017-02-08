import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Subscription, Observable } from 'rxjs';
import { User } from '../model/user.entity';
import { EntityManager, DAO } from '../persistence/persistence'
import { Utils } from '../shared/utils';

@Component({
  selector: 'user-select',
  templateUrl: './user-select.component.html',
})
export class UserSelectComponent implements OnInit, OnChanges, OnDestroy {
  private dao: DAO<User>;
  private user: User;
  //private user$: Observable<User>;
  private subscription: Subscription;
  private userPhotoStyle: SafeStyle;
  private users: User[];
  private highlightTerm = Utils.highlightTerm;

  constructor(private em: EntityManager, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.dao = this.em.getDao<User>(User);

    this.users = [];
    let u: User = new User();
    u.name = 'Tomáš Klíma';
    this.users.push(u);
    u = new User();
    u.name = 'Tomáš Dařbič Klíma';
    this.users.push(u);
    u = new User();
    u.name = 'Ho ho ha ha';
    this.users.push(u);
  }

  ngOnChanges(changes: any) {
    /*
    if (changes.uid && changes.uid.currentValue) {
      this.user$ = this.dao.find(changes.uid.currentValue);
      this.subscription = this.user$.subscribe(user => {
        this.user = user;
        this.userPhotoStyle = this.sanitizer.bypassSecurityTrustStyle(`background-image:url(${this.user.urlPhoto})`);
      }, err => console.error(`Unable to load user ${err}`));
    }
    */
  }

  ngOnDestroy() {
    this.subscription && this.subscription.unsubscribe();
  }

  private searchUsers = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : (this.users ? this.users.filter(u => new RegExp(Utils.toRegExpSafe(term), 'gi').test(u.name)).splice(0, 10) : []));

  private formatUser(user: User) {
    return user.name || null;
  }
}
