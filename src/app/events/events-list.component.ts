import { Component, Input, OnChanges, OnInit, OnDestroy, SimpleChanges, style, state, animate, transition, trigger } from '@angular/core';
import { Moment } from 'Moment';
import * as moment from 'moment';
import { FirebaseListObservable } from 'angularfire2';
import { BehaviorSubject, Subscription } from 'rxjs';
//import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent } from '../model/event.entity';
import { EntityManager, DAO } from '../persistence/persistence'
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
export class EventsListComponent implements OnChanges, OnInit, OnDestroy {

  private year: number = moment().year();

  private months: Array<{ name: string, events: CalendarEvent[] }> = [];
  private subscriptions: Subscription[] = [];
  //private months$: BehaviorSubject<CalendarEvent[]>[];
  private dao: DAO<CalendarEvent>;
  private monthsVisible: boolean[] = [];
  private activeEvent: string;
  private EventType = CalendarEvent.Type;

  constructor(private em: EntityManager/*, private modalService: NgbModal*/) {
  }

  /*
  addEvent(content: any) {
    this.modalService.open(content, { size: 'lg' }).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${reason}`);
    });
  }
  */

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
      this.subscriptions[m] = this.dao.list({
        orderByChild: 'start',
        startAt: start.format(),
        endAt: end.format()
      }).subscribe(events => {
        //console.log(m + ': ' + events.length);
        this.months[m].events = events;
      });
      //*/
    }
  }

  ngOnChanges(changes:  any) {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
