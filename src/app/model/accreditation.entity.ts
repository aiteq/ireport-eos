import { AbstractEntity, Entity, ManyToOne } from '../atq/persistence';
import { Registration } from './registration.entity';

@Entity()
export class Accreditation extends AbstractEntity {

  @ManyToOne(() => Registration) registration: Registration;
  status: Accreditation.Status = Accreditation.Status.NOT_APPLIED;
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
