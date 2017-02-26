import { Component, Input, Output, OnChanges, OnInit, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Subscription, Observable } from 'rxjs';
import { AtqComponent } from '../atq/atq-component';
import { User } from '../model/user.entity';
import { EntityManager, DAO } from '../atq/persistence'
import { Utils } from '../shared/utils';

@Component({
  selector: 'user-select',
  templateUrl: './user-select.component.html',
  styleUrls: ['./user-select.component.scss']
})
export class UserSelectComponent extends AtqComponent implements OnInit, OnChanges {

  @Input() initialState: 'icon' | 'input' = 'icon';

  @Output() selectUser: EventEmitter<any> = new EventEmitter<any>();

  private dao: DAO<User>;
  private user: User;
  //private user$: Observable<User>;
  private subscription: Subscription;
  private userPhotoStyle: SafeStyle;
  private users: User[] = [];
  private highlightTerm = Utils.highlightTerm;
  private inputVisible: boolean = false;

  constructor(private em: EntityManager, private sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit() {
    this.dao = this.em.getDao<User>(User);
    this.subscription = this.dao.list({ orderByChild: 'name' }).subscribe(users => {
      this.users = users;
    });

    /*this.users = [];
    let u: User = new User();
    u.name = 'Tomáš Klíma';
    u.id = 'wafZDnzdPDXFighOZYQuM10YFHm1';
    this.users.push(u);
    u = new User();
    u.name = 'Tomáš Dařbič Klíma';
    u.urlPhoto = 'https://www.gravatar.com/avatar/01be78c58daa73595a9f66977d24e3cf?s=64&d=identicon&r=PG';
    this.users.push(u);
    u = new User();
    u.name = 'Ho ho ha ha';
    this.users.push(u);*/
  }

  ngOnChanges(changes: any) {
    if (changes.initialState && changes.initialState.currentValue) {
      this.inputVisible = changes.initialState.currentValue === 'input';
    }
  }

  atqCleanUp() {
    this.subscription && this.subscription.unsubscribe();
  }

  private safeStyle(url: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`background-image:url(${url})`);
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
