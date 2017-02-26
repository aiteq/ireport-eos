import { Component, Input, Output, OnInit, OnChanges, EventEmitter } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { AtqComponent } from '../atq/atq-component';
import { CalendarEvent, ImportedEvent } from '../model/event.entity'
import { Registration, User, Venue } from '../model/index';
import { Accreditation } from '../model/accreditation.entity';
import { EventTypeComponent } from './event-type.component';
import { EntityManager, DAO } from '../atq/persistence';
import { Utils } from '../shared/utils';

@Component({
  selector: 'event-inline',
  templateUrl: './event-inline.component.html',
  styleUrls: ['./event-inline.component.scss']
})
export class EventInlineComponent extends AtqComponent implements OnInit, OnChanges {

  private readonly EventType = CalendarEvent.Type;
  private readonly EventTypeNames = EventTypeComponent.TYPES;

  private daoEvent: DAO<CalendarEvent>;
  private daoImport: DAO<ImportedEvent>;
  private daoUser: DAO<User>;
  private daoVenue: DAO<Venue>;

  private subscription: Subscription;
  private btnsVisible: { [key: string]: boolean } = {};

  // helping accessors - it is not possible to access enums within namespaces from component template
  private AccStatus = Accreditation.Status;
  private RegJob = Registration.Job;

  private importedEvents: CalendarEvent[];
  private venues: Venue[];


  @Input('event') eventObject: CalendarEvent;

  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  constructor(private em: EntityManager) {
    super();

    this.daoEvent = this.em.getDao<CalendarEvent>(CalendarEvent);
    this.daoImport = this.em.getDao<ImportedEvent>(ImportedEvent);
    this.daoUser = this.em.getDao<User>(User);
    this.daoVenue = this.em.getDao<Venue>(Venue);
  }

  private cancel() {
    this.close.emit(null);
  }

  ngOnInit() {

    this.eventObject = this.eventObject || new CalendarEvent();

    /*
    // load imported events
    this.subscriptions.push(this.daoImport.findAll().subscribe(events => {
      this.importedEvents = events;
    }));
    // load venues
    this.subscriptions.push(this.daoVenue.findAll().subscribe(venues => {
      this.venues = venues;
    }));
    //*/

    this.venues = [];
    let v = new Venue();
    v.name = 'Lucerna Music Bar(';v.city = 'Praha';
    this.venues.push(v);
    v = new Venue();
    v.name = 'DEPO2015';v.city = 'Plzeň';
    this.venues.push(v);
    v = new Venue();
    v.name = 'Futurum Music Bar';v.city = 'Praha';
    this.venues.push(v);

    this.importedEvents = [];
    let e = new CalendarEvent();
    e.title = 'Xindl X';e.start = '2017-02-08 20:30';e.end = '2017-02-08 23:59';e.type = 0;
    e.venue = new Venue();
    e.venue.name = 'Lucerna Music Bar';
    e.venue.city = 'Praha';
    this.importedEvents.push(e);
    e = new CalendarEvent();
    e.title = 'Mydy Rabycad';e.start = '2017-03-10 20:30';e.end = '2017-03-10 23:59';e.type = 0;
    e.venue = new Venue();
    e.venue.name = 'Roxy';
    e.venue.city = 'Praha';
    this.importedEvents.push(e);
    e = new CalendarEvent();
    e.title = 'Mydy Rabycad';e.start = '2017-04-10 20:30';e.end = '2017-04-10 23:59';e.type = 0;
    e.venue = new Venue();
    e.venue.name = 'Roxy';
    e.venue.city = 'Praha';
    this.importedEvents.push(e);
    e = new CalendarEvent();
    e.title = 'J.A.R.';
    e.venue = new Venue();
    e.venue.name = 'Rock Cafe';
    e.venue.city = 'Praha';
    this.importedEvents.push(e);
  }

  ngOnChanges(changes: any) {
    if (changes.eventObject && changes.eventObject.currentValue) {
      if (!this.subscription) {
        this.subscription = this.daoEvent.find(changes.eventObject.currentValue.id).subscribe(event => {
          this.eventObject = event;
        });
      }
    }
  }

  atqCleanUp() {
    this.subscription.unsubscribe();
  }

  private add() {
    this.save().first().subscribe(event => this.close.emit(event), err => console.error('Unable to add event: ' + err));
  }

  private save() {
    return this.daoEvent.save(this.eventObject);
  }

  private searchImported = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : (this.importedEvents ? this.importedEvents.filter(ie => new RegExp(Utils.toRegExpSafe(term), 'gi').test(ie.title)).splice(0, 10) : []));

  private searchVenues = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .distinctUntilChanged()
      .map(term => term.length < 2 ? []
        : (this.venues ? this.venues.filter(v => {
          return new RegExp(Utils.toRegExpSafe(term), 'gi').test(v.name);
        }).splice(0, 10) : []));

  private formatEvent(event: CalendarEvent) {
    return event.title || null;
  }

  private formatVenue(venue: Venue) {
    return venue.name || null;
  }

  private highlightTerm(result: string, term: string) {
    return Utils.highlightTerm(result, term);
  }

  private selectImported(event: { item: CalendarEvent }) {
    Object.assign(this.eventObject, event.item);
    this.eventObject.venue = Object.assign(new Venue(), event.item.venue);
  }

  private selectVenue(event: { item: Venue }) {
    Object.assign(this.eventObject.venue, event.item);
  }

  private getAccreditations(job: Registration.Job): Accreditation[] {
    return this.eventObject.accreditations.filter(acc => acc.registration.job == job);
  }

  private getRegistrations(job: Registration.Job): Registration[] {
    return this.eventObject.registrations.filter(reg => reg.job == job);
  }

  private updateAccreditationStatus(acc: Accreditation, status: Accreditation.Status) {
    acc.status = status;

    this.daoEvent.save(this.eventObject, { accreditations: this.eventObject.accreditations});
  }

  private assign(reg: Registration) {

    // create new accreditation by assigning
    let acc = new Accreditation();
    acc.registration = reg;

    reg.status = Registration.Status.ASSIGNED;
    this.eventObject.accreditations.push(acc);

    this.eventObject.registrations.splice(this.eventObject.registrations.indexOf(reg), 1);

    this.daoEvent.save(this.eventObject, { accreditations: this.eventObject.accreditations, registrations: this.eventObject.registrations});
  }

  private unassign(acc: Accreditation) {

    this.eventObject.accreditations.splice(this.eventObject.accreditations.indexOf(acc), 1);
    acc.registration.status = Registration.Status.UNASSIGNED;

    this.eventObject.registrations.push(acc.registration);

    this.daoEvent.save(this.eventObject, { accreditations: this.eventObject.accreditations, registrations: this.eventObject.registrations});
  }

  private register(user: User, job: Registration.Job) {
    let reg: Registration = new Registration();
    reg.job = job;
    reg.user = user;
    this.eventObject.registrations.push(reg);

    this.daoEvent.save(this.eventObject, { registrations: this.eventObject.registrations });
  }

  private unregister(reg: Registration) {
    this.eventObject.registrations.splice(this.eventObject.registrations.indexOf(reg), 1);

    this.daoEvent.save(this.eventObject, { registrations: this.eventObject.registrations });
  }
}
