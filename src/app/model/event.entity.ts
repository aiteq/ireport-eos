import { Moment } from 'Moment';
import * as moment from 'moment';
//import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AbstractEntity, Entity, ManyToOne } from '../atq/persistence';
import { Accreditation } from './accreditation.entity';
import { Registration } from './registration.entity';
import { Venue } from './venue.entity';

@Entity('/events')
export class CalendarEvent extends AbstractEntity {

  private static readonly INPUT_DATE_FORMAT = 'YYYY-MM-DD';
  private static readonly INPUT_TIME_FORMAT = 'HH:mm';
  private static readonly INPUT_DATETIME_FORMAT = `${CalendarEvent.INPUT_DATE_FORMAT}T${CalendarEvent.INPUT_TIME_FORMAT}:00`;
  private static readonly REGEXP_ISO8601 = /(\d{4}-\d{2}-\d{2})[T|\s]?(\d{2}:\d{2})?/;

  private _start: Moment;
  private _end: Moment;

  type: CalendarEvent.Type;
  title: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  @ManyToOne(() => Venue) venue: Venue;
  annotation: string;
  chiefNotes: string;
  instructions: string;

  createdBy: string;

  accreditations: Accreditation[] = [];
  accreditationNotes: string;
  registrations: Registration[] = [];

  // TO-DO: remove
  editors: any[];
  photo: any[];


  //className: string;
  //textReportStatus: CalendarEvent.ReportStatus;
  //photoReportStatus: CalendarEvent.ReportStatus;

  //private _pickedStart: NgbDateStruct;

  constructor() {
    super();
    this.venue = new Venue();
  }

  get unassignedEditors(): Registration[] {
    return this.registrations.filter(reg => reg.job == Registration.Job.EDITOR && reg.status == Registration.Status.UNASSIGNED);
  }

  get unassignedPhotographers(): Registration[] {
    return this.registrations.filter(reg => reg.job == Registration.Job.PHOTOGRAPHER && reg.status == Registration.Status.UNASSIGNED);
  }

  get inputStartDate(): string {
    return this.start ? moment(this.start).format(CalendarEvent.INPUT_DATE_FORMAT) : null;
  }

  set inputStartDate(dateStr: string) {
    this.start = dateStr && (this.start && (this.start.length > CalendarEvent.INPUT_DATE_FORMAT.length) ?
      dateStr + this.start.slice(CalendarEvent.INPUT_DATE_FORMAT.length) :
      dateStr);
  }

  get inputStartTime(): string {
    return this.start && (this.start.length > CalendarEvent.INPUT_DATE_FORMAT.length) ?
      moment(this.start).format(CalendarEvent.INPUT_TIME_FORMAT) : null;
  }

  set inputStartTime(timeStr: string) {
    if (this.start) {
      if (timeStr) {
        this.start = this.start.slice(0, CalendarEvent.INPUT_DATE_FORMAT.length) + 'T' + timeStr;
      } else {
        this.start = this.start.slice(0, CalendarEvent.INPUT_DATE_FORMAT.length);
      }
    } else {
      if (timeStr) {
        this.start = moment().format(CalendarEvent.INPUT_DATE_FORMAT) + 'T' + timeStr;
      }
    }
  }

  get inputEndDate(): string {
    return this.end ? moment(this.end).format(CalendarEvent.INPUT_DATE_FORMAT) : null;
  }

  set inputEndDate(dateStr: string) {
    this.end = dateStr && (this.end && (this.end.length > CalendarEvent.INPUT_DATE_FORMAT.length) ?
      dateStr + this.end.slice(CalendarEvent.INPUT_DATE_FORMAT.length) :
      dateStr);
  }

  get inputEndTime(): string {
    return this.end && (this.end.length > CalendarEvent.INPUT_DATE_FORMAT.length) ?
      moment(this.end).format(CalendarEvent.INPUT_TIME_FORMAT) : null;
  }

  set inputEndTime(timeStr: string) {
    if (this.end) {
      if (timeStr) {
        this.end = this.end.slice(0, CalendarEvent.INPUT_DATE_FORMAT.length) + 'T' + timeStr;
      } else {
        this.end = this.end.slice(0, CalendarEvent.INPUT_DATE_FORMAT.length);
      }
    } else {
      if (timeStr) {
        this.end = moment().format(CalendarEvent.INPUT_DATE_FORMAT) + 'T' + timeStr;
      }
    }
  }
}

@Entity('/imports/events')
export class ImportedEvent extends AbstractEntity {
  name: string;
}

export namespace CalendarEvent {
  export enum Type {
    CONCERT,
    FESTIVAL,
    INTERVIEW,
    PRESS,
    REVIEW,
    MOVIE,
    SHOOTING,
    OTHER
  }

  export enum ReportStatus {
    NOT_AVAILABLE,
    RECEIVED,
    PUBLISHED
  }
}

export namespace CalendarEvent.Type {
  export const length = Object.keys(CalendarEvent.Type).length/2;
  export const array = Object.keys(CalendarEvent.Type).splice(0, CalendarEvent.Type.length);
}
