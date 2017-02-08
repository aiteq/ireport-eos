import { Component, Input } from '@angular/core';
import { CalendarEvent } from '../model/event.entity';

@Component({
  selector: 'event-type',
  templateUrl: './event-type.component.html',
})
export class EventTypeComponent {

  private TYPES = EventTypeComponent.TYPES;

  private _type: { label: string, icon: string };

  @Input()
  set type (t: CalendarEvent.Type) {
    this._type = EventTypeComponent.TYPES[t] || EventTypeComponent.TYPES[CalendarEvent.Type.OTHER];
  }
  @Input() icon: boolean = true;
  @Input() text: boolean = false;
}

export namespace EventTypeComponent {
  export const TYPES: Array<{ label: string, icon: string}> = [];
}

// static initializer
(() => {
  var initType = (type: CalendarEvent.Type, label: string, icon: string) => {
    //EventTypeComponent.TYPES[CalendarEvent.Type[CalendarEvent.Type[type]]] = {
    EventTypeComponent.TYPES[type] = {
      label: label,
      icon: icon
    };
  };

  initType(CalendarEvent.Type.CONCERT, 'Concert', 'music');
  initType(CalendarEvent.Type.FESTIVAL, 'Festival', 'sun-o');
  initType(CalendarEvent.Type.PRESS, 'Press event', 'comment-o');
  initType(CalendarEvent.Type.REVIEW, 'Review', 'headphones');
  initType(CalendarEvent.Type.INTERVIEW, 'Interview', 'comments-o');
  initType(CalendarEvent.Type.MOVIE, 'Film screening', 'film');
  initType(CalendarEvent.Type.SHOOTING, 'Shooting', 'video-camera');
  initType(CalendarEvent.Type.OTHER, 'Other', 'calendar-o');
})();
