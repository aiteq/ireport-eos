import { Component, Input, OnInit, SimpleChanges, style, state, animate, transition, trigger } from '@angular/core';
import { Moment } from 'Moment';
import * as moment from 'moment';
import { FirebaseListObservable } from 'angularfire2';
import { BehaviorSubject, Subscription } from 'rxjs';
//import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AtqComponent } from '../atq/atq-component';
import { CalendarEvent } from '../model/event.entity';
import { EntityManager, DAO } from '../atq/persistence'
import { EventTypeComponent } from './event-type.component';

@Component({
  selector: 'list',
  templateUrl: './events-list.component.html',
  animations: [
    trigger('animForm', [
      state('in', style({height: '*'})),
      transition('void => *', [
        style({height: 0}),
        animate('100ms ease-out', style({height: '*'}))
      ]),
      transition('* => void', [
        style({height: '*'}),
        animate('100ms ease-in', style({height: 0}))
      ])
    ])
  ]
})
export class EventsListComponent extends AtqComponent implements OnInit {

  private year: number = moment().year();

  private months: Array<{ name: string, events: CalendarEvent[] }> = [];
  private changed: Array<CalendarEvent[]> = [];

  private subscriptions: Subscription[] = [];
  //private months$: BehaviorSubject<CalendarEvent[]>[];
  private dao: DAO<CalendarEvent>;
  private monthsVisible: boolean[] = [];
  private activeEvent: CalendarEvent;
  private EventType = CalendarEvent.Type;

  constructor(private em: EntityManager) {
    super();
  }

  ngOnInit() {
    this.dao = this.em.getDao<CalendarEvent>(CalendarEvent);

    for (let m = 0; m < 12; m++) {
      let today = moment();
      let start: Moment = moment([this.year, m, 1]),
          end: Moment = moment(start).endOf('month');

      this.months[m] = {
        name: start.format('MMMM'),
        events: []
      };
      this.monthsVisible[m] = today.month() == m;

      //*
      this.subscriptions.push(this.dao.list({
        orderByChild: 'start',
        startAt: start.format(),
        endAt: end.format()
      }).subscribe(events => {
        if (this.activeEvent) {
          this.changed[m] = events;
        } else {
          this.months[m].events = events;
        }
      }));
      //*/
    }
  }

  atqCleanUp() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private clickMonth($event: any, month: number) {
    $event.preventDefault();

    this.monthsVisible[month] = !this.monthsVisible[month];
    this.activeEvent = undefined;
  }

  private clickEvent($event: any, ce: CalendarEvent) {
    $event.preventDefault();

    if (!this.activeEvent) {
      this.activeEvent = ce;
    } else {
      this.activeEvent = undefined;
      this.updateChanged();
    }
  }

  private updateChanged() {
    this.changed.forEach((month, i) => {
      this.months[i].events = month;
      delete this.changed[i];
    });
  }
}
