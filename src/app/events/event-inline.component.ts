import { Component, Input, Output, OnInit, OnChanges, OnDestroy, EventEmitter } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { FirebaseObjectObservable } from 'angularfire2';
import { CalendarEvent, ImportedEvent } from '../model/event.entity'
import { User } from '../model/user.entity';
import { Venue } from '../model/venue.entity';
import { Accreditation } from '../model/accreditation.entity';
import { EventTypeComponent } from './event-type.component';
import { EntityManager, DAO } from '../atq/persistence';
import { Utils } from '../shared/utils';

@Component({
  selector: 'event-inline',
  templateUrl: './event-inline.component.html',
})
export class EventInlineComponent implements OnChanges, OnDestroy {

  private readonly EventType = CalendarEvent.Type;
  private readonly EventTypeNames = EventTypeComponent.TYPES;

  private daoEvent: DAO<CalendarEvent>;
  private daoImport: DAO<ImportedEvent>;
  private daoUser: DAO<User>;
  private daoVenue: DAO<Venue>;

  private event$: FirebaseObjectObservable<CalendarEvent>;
  private subscriptions: Subscription[] = [];
  private btnsVisible: { [key: string]: boolean } = {};

  private AccStatus = Accreditation.Status;

  private importedEvents: CalendarEvent[];
  private venues: Venue[];

  private ex: any;

  @Input('event') eventObject: CalendarEvent;

  @Output() close: EventEmitter<any> = new EventEmitter<any>();

  constructor(private em: EntityManager) {}

  test = (pl: any) => console.log(pl);

  private cancel() {
    this.close.emit(null);
  }

  ngOnInit() {
    this.daoEvent = this.em.getDao<CalendarEvent>(CalendarEvent);
    this.daoImport = this.em.getDao<ImportedEvent>(ImportedEvent);
    this.daoUser = this.em.getDao<User>(User);
    this.daoVenue = this.em.getDao<Venue>(Venue);

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
      this.eventObject = changes.eventObject.currentValue;
      /*
      this.event$ = <FirebaseObjectObservable<CalendarEvent>>this.daoEvent.find(changes.eventObject.currentValue.id);
      this.subscriptions.push(this.event$.subscribe(event => {
        this.eventObject = event;
      }, err => console.error(`Unable to load event ${err}`)));
      //*/
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private add() {
    this.daoEvent.save(this.eventObject).first().subscribe(event => this.close.emit(event.id), err => console.error('Unable to add event: ' + err));
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
    return result.replace(new RegExp(`(${Utils.toRegExpSafe(term)})`, 'gi'), `<strong>$1</strong>`);
  }

  private selectImported(event: { item: CalendarEvent }) {
    Object.assign(this.eventObject, event.item);
    this.eventObject.venue = Object.assign(new Venue(), event.item.venue);
  }

  private selectVenue(event: { item: Venue }) {
    Object.assign(this.eventObject.venue, event.item);
  }

  private setAccStatus(index: number, status: Accreditation.Status) {
    this.eventObject.accreditations[index].status = status;
    this.event$.update({
      accreditations: this.eventObject.accreditations
    });
  }

  private unassign(indexObj: any) {
    if (indexObj.acc.job == 'editor') {
      (this.eventObject.editors || (this.eventObject.editors = [])).push(indexObj.acc);
      this.eventObject.accreditations.splice(indexObj.index, 1);
      this.event$.update({
        accreditations: this.eventObject.accreditations,
        editors: this.eventObject.editors
      });
    } else {
      (this.eventObject.photo || (this.eventObject.photo = [])).push(indexObj.acc);
      this.eventObject.accreditations.splice(indexObj.index, 1);
      this.event$.update({
        accreditations: this.eventObject.accreditations,
        photo: this.eventObject.photo
      });
    }
  }

  private assignEditor(applicant: any) {
    let acc = new Accreditation();
    acc.user = applicant.app.user;
    acc.status = applicant.app.status || Accreditation.Status.NOT_APPLIED;
    acc.guestsRequested = applicant.app.guestsRequested || 0;
    acc.job = 'editor';
    (this.eventObject.accreditations || (this.eventObject.accreditations = [])).push(acc);
    this.eventObject.editors.splice(applicant.index, 1);
    this.event$.update({
      accreditations: this.eventObject.accreditations,
      editors: this.eventObject.editors
    });
  }

  private assignPhoto(applicant: any) {
    try {
    let acc = new Accreditation();
    acc.user = applicant.app.user;
    acc.status = applicant.app.status || Accreditation.Status.NOT_APPLIED;
    acc.guestsRequested = applicant.app.guestsRequested || 0;
    acc.job = 'photo';
    (this.eventObject.accreditations || (this.eventObject.accreditations = [])).push(acc);
    this.eventObject.photo.splice(applicant.index, 1);
    this.event$.update({
      accreditations: this.eventObject.accreditations,
      photo: this.eventObject.photo
    });
    } catch (err) {
      console.error(err);
    }
  }

  private checkEditors(): boolean {
    return (!this.eventObject.editors || this.eventObject.editors.length == 0) &&
      (!this.eventObject.accreditations || this.eventObject.accreditations.filter(acc => acc.job == 'editor').length == 0);
  }

  private checkPhoto(): boolean {
    return (!this.eventObject.photo || this.eventObject.photo.length == 0) &&
      (!this.eventObject.accreditations || this.eventObject.accreditations.filter(acc => acc.job == 'photo').length == 0);
  }
}
