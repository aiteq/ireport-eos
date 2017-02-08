import { Component, Input, OnChanges, OnDestroy, OnInit, Injectable, Directive, ElementRef, Renderer, AfterViewInit } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { FirebaseObjectObservable } from 'angularfire2';
import { NgbModule, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Moment } from 'Moment';
import * as moment from 'moment';
import { CalendarEvent, ImportedEvent } from '../model/event.entity';
import { User } from '../model/user.entity';
import { Accreditation } from '../model/accreditation.entity';
import { EntityManager, DAO } from '../persistence/persistence';

@Component({
  providers: [
    { provide: NgbDateParserFormatter, useFactory: () => new MomentDateFormat('DD/MM/YYYY') }
  ],
  selector: 'event-form',
  templateUrl: './event-form.component.html',
})
export class EventFormComponent implements OnChanges, OnInit, OnDestroy {

  private daoEvent: DAO<CalendarEvent>;
  private daoImport: DAO<ImportedEvent>;
  private daoUser: DAO<User>;
  private event$: FirebaseObjectObservable<CalendarEvent>;
  private subscriptions: Subscription[] = [];
  private importedEvents: ImportedEvent[];
  
  private static readonly EventType = CalendarEvent.Type;
  private static readonly EVENT_TYPE_NAMES: any = [];

  private AccStatus = Accreditation.Status;

  private eventx: any;

  @Input('event') eventObject: CalendarEvent;

  constructor(private em: EntityManager) {
    this.daoEvent = em.getDao<CalendarEvent>(CalendarEvent);
    this.daoImport = em.getDao<ImportedEvent>(ImportedEvent);
    this.daoUser = em.getDao<User>(User);

    this.eventObject = new CalendarEvent();
  }

  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : (this.importedEvents ? this.importedEvents.filter(ie => new RegExp(term, 'gi').test(ie.name)).splice(0, 10) : []));

  highlightTerm = (result: string, term: string) =>
    result.replace(new RegExp(`(${term})`, 'gi'), `<strong>$1</strong>`);

  importFormatter = (event: any) => event.name;

  ngOnInit() {
    /*
    this.subscriptions.push(this.daoImport.findAll().subscribe(events => {
      this.importedEvents = events;
    }));
    //*/
  }

  ngOnChanges(changes:  any) {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}

export class MomentDateFormat extends NgbDateParserFormatter {

  constructor(private _format: string) {
    super();
  }

  parse(value: string): NgbDateStruct {
    console.log('parsing: ' + value);
    if (value) {      
      let m = moment(value, this._format);
      console.log(m.format());
      return {
        year: m.year(),
        month: m.month() + 1,
        day: m.date()
      };
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    console.log('formating: ');
    console.log(date);
    return date ? moment([date.year, date.month - 1, date.day]).format(this._format) : '';
  }
}
