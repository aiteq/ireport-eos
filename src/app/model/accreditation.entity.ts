import { Manageable } from '../persistence/persistence'

export class Accreditation extends Manageable {

  uid: string;
  status: Accreditation.Status;
  job: string;
  guestsRequested: number;
  guestsConfirmed: number;

}

export namespace Accreditation {
  export enum Status {
    NOT_APPLIED,
    APPLIED,
    CONFIRMED,
    CONFIRMED_NO_GUESTS,
    REFUSED,
    NOT_AVAILABLE
  }
}
