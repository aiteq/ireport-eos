import { AbstractEntity, Entity, ManyToOne } from '../atq/persistence';
import { User } from './user.entity';

@Entity()
export class Registration extends AbstractEntity {

  @ManyToOne(() => User) user: User;
  job: Registration.Job;
  status: Registration.Status = Registration.Status.UNASSIGNED;
  guestsRequested: number;
}

export namespace Registration {
  export enum Job {
    EDITOR,
    PHOTOGRAPHER
  }

  export enum Status {
    UNASSIGNED,
    ASSIGNED,
    BACKUP
  }
}
