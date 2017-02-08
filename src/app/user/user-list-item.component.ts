import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Subscription, Observable } from 'rxjs';
import { User } from '../model/user.entity';
import { EntityManager, DAO } from '../persistence/persistence'

@Component({
  selector: 'user-list-item',
  templateUrl: './user-list-item.component.html',
})
export class UserListItemComponent implements OnChanges, OnDestroy {
  private dao: DAO<User>;
  private user: User;
  private user$: Observable<User>;
  private subscription: Subscription;
  private userPhotoStyle: SafeStyle;

  @Input() uid: string;

  constructor(private em: EntityManager, private sanitizer: DomSanitizer) {
    this.dao = em.getDao<User>(User);
  }

  ngOnChanges(changes: any) {
    if (changes.uid && changes.uid.currentValue) {
      this.user$ = this.dao.find(changes.uid.currentValue);
      this.subscription = this.user$.subscribe(user => {
        this.user = user;
        this.userPhotoStyle = this.sanitizer.bypassSecurityTrustStyle(`background-image:url(${this.user.urlPhoto})`);
      }, err => console.error(`Unable to load user ${err}`));
    }
  }

  ngOnDestroy() {
    this.subscription && this.subscription.unsubscribe();
  }
}
