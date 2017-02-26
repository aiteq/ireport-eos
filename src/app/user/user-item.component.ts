import { Component, Input, OnChanges } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { User } from '../model/user.entity';

@Component({
  selector: 'user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.css']
})
export class UserItemComponent implements OnChanges {
  private userPhotoStyle: SafeStyle;

  @Input() user: User;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: any) {
    if (changes.user && changes.user.currentValue) {
      this.userPhotoStyle = this.sanitizer.bypassSecurityTrustStyle(`background-image:url(${this.user.urlPhoto})`);
    }
  }
}
