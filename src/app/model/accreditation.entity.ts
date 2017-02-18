import { AbstractEntity, Entity, ManyToOne } from '../atq/persistence';
import { User } from './user.entity'

@Entity()
export class Accreditation extends AbstractEntity {

  @ManyToOne(() => User) user: User;
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
